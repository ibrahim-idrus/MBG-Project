import type Database from 'better-sqlite3';
import { Hono } from 'hono';
import type { AuthEnv } from '../auth/middleware.js';
import { decimalValue, hasOwn, integerValue, likePattern, pagination, paginationResponse, pathId, readJson, requiredText, validDate, validationResponse, type JsonObject } from './common.js';
import { getMenusByDate, getMenuDetail, getMenuCompositions, getMenusByWeek } from '../db/queries.js';

// Public menu API (user-facing, READ-only)
const publicMenus = new Hono();

publicMenus.get('/menus', (c) => {
  const date = c.req.query('date');
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return c.json({ error: 'Parameter date (YYYY-MM-DD) wajib diisi.' }, 400);
  }
  const menus = getMenusByDate(date);
  return c.json({ data: menus });
});

publicMenus.get('/menus/:id', (c) => {
  const id = Number(c.req.param('id'));
  if (!id || !Number.isInteger(id) || id <= 0) {
    return c.json({ error: 'ID menu tidak valid.' }, 400);
  }
  const menu = getMenuDetail(id) as any;
  if (!menu) {
    return c.json({ error: 'Menu tidak ditemukan.' }, 404);
  }
  const compositions = getMenuCompositions(id);
  return c.json({ data: { ...menu, compositions } });
});

export default publicMenus;

const MEAL_TYPES = ['breakfast', 'lunch', 'snack'] as const;

function menuView(row: any) {
  return {
    id: row.id,
    kitchen_id: row.kitchen_id,
    school_id: row.school_id,
    name: row.name,
    meal_type: row.meal_type,
    menu_date: row.menu_date,
    description: row.description,
    photo_url: row.photo_url,
    created_by: row.created_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
    kitchen: row.kitchen_name === undefined ? undefined : { id: row.kitchen_id, name: row.kitchen_name, code: row.kitchen_code },
    school: row.school_name === undefined ? undefined : { id: row.school_id, name: row.school_name, npsn: row.school_npsn },
    creator: row.creator_name === undefined ? undefined : { id: row.created_by, name: row.creator_name, email: row.creator_email, role: row.creator_role },
  };
}

function loadMenu(db: Database.Database, id: number) {
  return db.prepare(`
    SELECT m.*, k.name AS kitchen_name, k.code AS kitchen_code,
      s.name AS school_name, s.npsn AS school_npsn,
      a.name AS creator_name, a.email AS creator_email, a.role AS creator_role
    FROM menus m
    JOIN mbg_kitchens k ON k.id = m.kitchen_id
    JOIN schools s ON s.id = m.school_id
    JOIN admins a ON a.id = m.created_by
    WHERE m.id = ?
  `).get(id) as any;
}

function loadMenuNutrition(db: Database.Database, menuId: number) {
  return db.prepare(`
    SELECT COALESCE(SUM(mc.calories), 0) as total_calories,
           COALESCE(SUM(mc.protein), 0) as total_protein,
           COALESCE(SUM(mc.carbohydrates), 0) as total_carbohydrates,
           COALESCE(SUM(mc.fat), 0) as total_fat,
           COALESCE(SUM(mc.fiber), 0) as total_fiber
    FROM menu_compositions mc
    WHERE mc.menu_id = ?
  `).get(menuId) as any;
}

function menuPayload(body: JsonObject, current?: any) {
  const errors: Record<string, string> = {};
  const value = (key: string) => hasOwn(body, key) ? body[key] : current?.[key];
  const name = requiredText(value('name'));
  const kitchenId = integerValue(value('kitchen_id'));
  const schoolId = integerValue(value('school_id'));
  const mealType = requiredText(value('meal_type'));
  const menuDate = validDate(value('menu_date'));
  if (!name) errors.name = 'Nama menu wajib diisi.';
  if (kitchenId === null || kitchenId <= 0) errors.kitchen_id = 'Dapur MBG wajib dipilih.';
  if (schoolId === null || schoolId <= 0) errors.school_id = 'Sekolah wajib dipilih.';
  if (!mealType || !MEAL_TYPES.includes(mealType as any)) errors.meal_type = 'Jenis makan tidak valid.';
  if (!menuDate) errors.menu_date = 'Tanggal menu tidak valid.';

  if (Object.keys(errors).length) return { errors };
  return {
    value: {
      name,
      kitchenId: kitchenId as number,
      schoolId: schoolId as number,
      mealType: mealType as string,
      menuDate: menuDate as string,
      description: hasOwn(body, 'description') ? body.description === null ? null : String(body.description).trim() || null : current?.description ?? null,
      photoUrl: hasOwn(body, 'photo_url') ? body.photo_url === null ? null : String(body.photo_url).trim() || null : current?.photo_url ?? null,
    },
  };
}

function validRelationship(db: Database.Database, kitchenId: number, schoolId: number): boolean {
  return Boolean(db.prepare('SELECT 1 FROM schools WHERE id = ? AND kitchen_id = ?').get(schoolId, kitchenId));
}

function validateCompositions(body: JsonObject): { errors?: Record<string, string>; value?: Array<{ food_item_id: number; amount: number; unit: string }> } {
  const raw = body.compositions;
  if (!Array.isArray(raw) || raw.length === 0) {
    return { errors: { compositions: 'Menu harus memiliki minimal satu komposisi.' } };
  }
  const errors: Record<string, string> = {};
  const result: Array<{ food_item_id: number; amount: number; unit: string }> = [];
  for (let i = 0; i < raw.length; i++) {
    const item = raw[i] as JsonObject;
    const foodItemId = integerValue(item.food_item_id);
    const amount = decimalValue(item.amount);
    const unit = typeof item.unit === 'string' ? item.unit.trim() : '';
    if (!foodItemId || foodItemId <= 0) errors['compositions.' + i + '.food_item_id'] = 'ID bahan tidak valid.';
    if (amount === null || amount <= 0) errors['compositions.' + i + '.amount'] = 'Jumlah harus lebih dari 0.';
    if (!unit) errors['compositions.' + i + '.unit'] = 'Unit wajib diisi.';
    result.push({ food_item_id: foodItemId || 0, amount: amount || 0, unit: unit || 'g' });
  }
  if (Object.keys(errors).length) return { errors };
  return { value: result };
}

function upsertCompositions(db: Database.Database, menuId: number, compositions: Array<{ food_item_id: number; amount: number; unit: string }>) {
  db.prepare('DELETE FROM menu_compositions WHERE menu_id = ?').run(menuId);
  const insert = db.prepare(`
    INSERT INTO menu_compositions (menu_id, food_item_id, amount, unit, calories, protein, carbohydrates, fat, fiber)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const comp of compositions) {
    const foodItem = db.prepare('SELECT * FROM food_items WHERE id = ?').get(comp.food_item_id) as any;
    if (!foodItem) continue;
    insert.run(menuId, comp.food_item_id, comp.amount, comp.unit,
      foodItem.calories_per_100g, foodItem.protein_per_100g,
      foodItem.carbohydrates_per_100g, foodItem.fat_per_100g, foodItem.fiber_per_100g);
  }
}

export function registerMenuRoutes(app: Hono<AuthEnv>, db: Database.Database) {
  app.get('/api/admin/menus', (c) => {
    const { page, perPage, offset } = pagination(c);
    const where: string[] = [];
    const params: unknown[] = [];
    const search = c.req.query('search');
    if (search) { where.push('m.name LIKE ? ESCAPE \'\\\''); params.push(likePattern(search)); }
    if (c.req.query('date')) { where.push('m.menu_date = ?'); params.push(c.req.query('date')); }
    if (c.req.query('meal_type')) { where.push('m.meal_type = ?'); params.push(c.req.query('meal_type')); }
    if (c.req.query('kitchen_id')) { where.push('m.kitchen_id = ?'); params.push(c.req.query('kitchen_id')); }
    if (c.req.query('school_id')) { where.push('m.school_id = ?'); params.push(c.req.query('school_id')); }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const total = (db.prepare(`SELECT COUNT(*) AS count FROM menus m ${clause}`).get(...params) as any).count as number;
    const sort = c.req.query('sort') === 'oldest' ? 'ASC' : 'DESC';
    const rows = db.prepare(`
      SELECT m.*, k.name AS kitchen_name, k.code AS kitchen_code,
        s.name AS school_name, s.npsn AS school_npsn,
        a.name AS creator_name, a.email AS creator_email, a.role AS creator_role
      FROM menus m JOIN mbg_kitchens k ON k.id = m.kitchen_id JOIN schools s ON s.id = m.school_id JOIN admins a ON a.id = m.created_by
      ${clause} ORDER BY m.menu_date ${sort}, m.id ${sort} LIMIT ? OFFSET ?
    `).all(...params, perPage, offset);
    return c.json({ data: rows.map(menuView), pagination: paginationResponse(page, perPage, total) });
  });

  app.get('/api/admin/menus/week', (c) => {
    const dateRaw = c.req.query('date');
    const dateStr = dateRaw && /^\d{4}-\d{2}-\d{2}$/.test(dateRaw) ? dateRaw : new Date().toISOString().slice(0, 10);
    const d = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = d.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(d);
    monday.setDate(d.getDate() + mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const startDate = monday.toISOString().slice(0, 10);
    const endDate = sunday.toISOString().slice(0, 10);
    const rows = getMenusByWeek(startDate, endDate) as any[];
    const days: Record<string, any[]> = {};
    for (const row of rows) {
      if (!days[row.menu_date]) days[row.menu_date] = [];
      days[row.menu_date].push(menuView(row));
    }
    const weekDays: Array<{ date: string; dayName: string; menus: any[] }> = [];
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    for (let i = 0; i < 7; i++) {
      const dd = new Date(monday);
      dd.setDate(monday.getDate() + i);
      const dateKey = dd.toISOString().slice(0, 10);
      weekDays.push({ date: dateKey, dayName: dayNames[dd.getDay()], menus: days[dateKey] || [] });
    }
    return c.json({ data: { startDate, endDate, days: weekDays } });
  });

  app.get('/api/admin/menus/:id', (c) => {
    const id = pathId(c.req.param('id'));
    if (id === null) return validationResponse(c, { id: 'ID menu tidak valid.' });
    const row = loadMenu(db, id);
    if (!row) return c.json({ message: 'Menu tidak ditemukan.' }, 404);
    const compositions = getMenuCompositions(id, db);
    const nutrition = loadMenuNutrition(db, id);
    return c.json({ data: { ...menuView(row), compositions, nutrition } });
  });

  app.post('/api/admin/menus', async (c) => {
    const body = await readJson(c);
    if (!body) return validationResponse(c, { body: 'Body JSON wajib diisi.' });
    const payload = menuPayload(body);
    if ('errors' in payload) return validationResponse(c, payload.errors);
    if (!validRelationship(db, payload.value.kitchenId, payload.value.schoolId)) return validationResponse(c, { school_id: 'Sekolah tidak terhubung dengan dapur yang dipilih.' });
    const compResult = validateCompositions(body);
    if ('errors' in compResult) return validationResponse(c, compResult.errors);
    const admin = c.get('admin');
    const insertMenu = db.prepare(`
      INSERT INTO menus (kitchen_id, school_id, name, meal_type, menu_date, description, photo_url, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = insertMenu.run(payload.value.kitchenId, payload.value.schoolId, payload.value.name, payload.value.mealType, payload.value.menuDate, payload.value.description, payload.value.photoUrl, admin.id);
    const menuId = Number(result.lastInsertRowid);
    upsertCompositions(db, menuId, compResult.value!);
    const menu = loadMenu(db, menuId);
    const compositions = getMenuCompositions(menuId, db);
    const nutrition = loadMenuNutrition(db, menuId);
    return c.json({ data: { ...menuView(menu), compositions, nutrition }, message: 'Menu berhasil dibuat.' }, 201);
  });

  const updateMenu = async (c: any) => {
    const id = pathId(c.req.param('id'));
    if (id === null) return validationResponse(c, { id: 'ID menu tidak valid.' });
    const current = loadMenu(db, id);
    if (!current) return c.json({ message: 'Menu tidak ditemukan.' }, 404);
    const body = await readJson(c);
    if (!body) return validationResponse(c, { body: 'Body JSON wajib diisi.' });
    const payload = menuPayload(body, current);
    if ('errors' in payload) return validationResponse(c, payload.errors);
    if (!validRelationship(db, payload.value.kitchenId, payload.value.schoolId)) return validationResponse(c, { school_id: 'Sekolah tidak terhubung dengan dapur yang dipilih.' });
    db.prepare(`
      UPDATE menus SET kitchen_id = ?, school_id = ?, name = ?, meal_type = ?, menu_date = ?, description = ?, photo_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(payload.value.kitchenId, payload.value.schoolId, payload.value.name, payload.value.mealType, payload.value.menuDate, payload.value.description, payload.value.photoUrl, id);
    if (hasOwn(body, 'compositions') && Array.isArray(body.compositions)) {
      const compResult = validateCompositions(body);
      if ('errors' in compResult) return validationResponse(c, compResult.errors);
      upsertCompositions(db, id, compResult.value!);
    }
    const menu = loadMenu(db, id);
    const compositions = getMenuCompositions(id, db);
    const nutrition = loadMenuNutrition(db, id);
    return c.json({ data: { ...menuView(menu), compositions, nutrition }, message: 'Menu berhasil diperbarui.' });
  };
  app.put('/api/admin/menus/:id', updateMenu);
  app.patch('/api/admin/menus/:id', updateMenu);

  app.delete('/api/admin/menus/:id', (c) => {
    const id = pathId(c.req.param('id'));
    if (id === null) return validationResponse(c, { id: 'ID menu tidak valid.' });
    const result = db.prepare('DELETE FROM menus WHERE id = ?').run(id);
    return result.changes ? c.json({ message: 'Menu berhasil dihapus.' }) : c.json({ message: 'Menu tidak ditemukan.' }, 404);
  });
}
