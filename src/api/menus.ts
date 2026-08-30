import type Database from 'better-sqlite3';
import { Hono } from 'hono';
import type { AuthEnv } from '../auth/middleware.js';
import { decimalValue, hasOwn, integerValue, likePattern, pagination, paginationResponse, pathId, readJson, requiredText, validDate, validationResponse, type JsonObject } from './common.js';

const MEAL_TYPES = ['breakfast', 'lunch', 'snack'] as const;
const NUTRIENTS = ['calories', 'protein', 'carbohydrates', 'fat', 'fiber'] as const;
type Nutrient = typeof NUTRIENTS[number];

function menuView(row: any) {
  return {
    id: row.id,
    kitchen_id: row.kitchen_id,
    school_id: row.school_id,
    name: row.name,
    meal_type: row.meal_type,
    menu_date: row.menu_date,
    description: row.description,
    composition: row.composition,
    photo_url: row.photo_url,
    calories: row.calories,
    protein: row.protein,
    carbohydrates: row.carbohydrates,
    fat: row.fat,
    fiber: row.fiber,
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

  const nutrition: Record<string, number | null> = {};
  for (const nutrient of NUTRIENTS) {
    const raw = value(nutrient);
    if (raw === null || raw === undefined || raw === '') {
      nutrition[nutrient] = null;
    } else {
      const parsed = decimalValue(raw);
      if (parsed === null || parsed < 0) errors[nutrient] = 'Nilai gizi harus berupa angka nol atau lebih.';
      else nutrition[nutrient] = parsed;
    }
  }

  if (Object.keys(errors).length) return { errors };
  return {
    value: {
      name,
      kitchenId: kitchenId as number,
      schoolId: schoolId as number,
      mealType: mealType as string,
      menuDate: menuDate as string,
      description: hasOwn(body, 'description') ? body.description === null ? null : String(body.description).trim() || null : current?.description ?? null,
      composition: hasOwn(body, 'composition') ? body.composition === null ? null : String(body.composition).trim() || null : current?.composition ?? null,
      photoUrl: hasOwn(body, 'photo_url') ? body.photo_url === null ? null : String(body.photo_url).trim() || null : current?.photo_url ?? null,
      nutrition,
    },
  };
}

function validRelationship(db: Database.Database, kitchenId: number, schoolId: number): boolean {
  return Boolean(db.prepare('SELECT 1 FROM schools WHERE id = ? AND kitchen_id = ?').get(schoolId, kitchenId));
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

  app.get('/api/admin/menus/:id', (c) => {
    const id = pathId(c.req.param('id'));
    if (id === null) return validationResponse(c, { id: 'ID menu tidak valid.' });
    const row = loadMenu(db, id);
    return row ? c.json({ data: menuView(row) }) : c.json({ message: 'Menu tidak ditemukan.' }, 404);
  });

  app.post('/api/admin/menus', async (c) => {
    const body = await readJson(c);
    if (!body) return validationResponse(c, { body: 'Body JSON wajib diisi.' });
    const payload = menuPayload(body);
    if ('errors' in payload) return validationResponse(c, payload.errors);
    if (!validRelationship(db, payload.value.kitchenId, payload.value.schoolId)) return validationResponse(c, { school_id: 'Sekolah tidak terhubung dengan dapur yang dipilih.' });
    const admin = c.get('admin');
    const result = db.prepare(`
      INSERT INTO menus (kitchen_id, school_id, name, meal_type, menu_date, description, composition, photo_url, calories, protein, carbohydrates, fat, fiber, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(payload.value.kitchenId, payload.value.schoolId, payload.value.name, payload.value.mealType, payload.value.menuDate, payload.value.description, payload.value.composition, payload.value.photoUrl, ...NUTRIENTS.map((key) => payload.value.nutrition[key]), admin.id);
    return c.json({ data: menuView(loadMenu(db, Number(result.lastInsertRowid))), message: 'Menu berhasil dibuat.' }, 201);
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
      UPDATE menus SET kitchen_id = ?, school_id = ?, name = ?, meal_type = ?, menu_date = ?, description = ?, composition = ?, photo_url = ?, calories = ?, protein = ?, carbohydrates = ?, fat = ?, fiber = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(payload.value.kitchenId, payload.value.schoolId, payload.value.name, payload.value.mealType, payload.value.menuDate, payload.value.description, payload.value.composition, payload.value.photoUrl, ...NUTRIENTS.map((key) => payload.value.nutrition[key]), id);
    return c.json({ data: menuView(loadMenu(db, id)), message: 'Menu berhasil diperbarui.' });
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
