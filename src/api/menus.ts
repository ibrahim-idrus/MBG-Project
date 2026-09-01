import type Database from 'better-sqlite3';
import { Hono } from 'hono';
import type { AuthEnv } from '../auth/middleware.js';
import { decimalValue, hasOwn, integerValue, likePattern, pagination, paginationResponse, pathId, readJson, requiredText, validDate, validationResponse, type JsonObject } from './common.js';
import { getMenusByDate, getMenuDetail, getMenuCompositions, getMenusByWeek } from '../db/queries.js';

// Public menu API (user-facing, READ-only). Factory so we can mount the
// routes with the correct db handle (the live server, the test app, etc.).
export function createPublicMenuRouter(db: Database.Database) {
  const router = new Hono();

  router.get('/menus', (c) => {
    const where: string[] = ['1=1'];
    const params: unknown[] = [];
    const date = c.req.query('date');
    const kitchenIdRaw = c.req.query('kitchen_id');
    const schoolIdRaw = c.req.query('school_id');

    // The user-facing page MUST scope by kitchen or school. Without that, the
    // endpoint would dump the entire menu catalog across all kitchens, which is
    // exactly the leak the menu rules forbid.
    if (!kitchenIdRaw && !schoolIdRaw) {
      return c.json({ error: 'Parameter kitchen_id atau school_id wajib diisi.', data: [] }, 400);
    }

    if (date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return c.json({ error: 'Parameter date (YYYY-MM-DD) tidak valid.' }, 400);
      }
      where.push('m.menu_date = ?');
      params.push(date);
    }

    if (kitchenIdRaw) {
      const kitchenId = integerValue(kitchenIdRaw);
      if (kitchenId === null) return c.json({ error: 'Parameter kitchen_id tidak valid.' }, 400);
      where.push('m.kitchen_id = ?');
      params.push(kitchenId);
    }
    if (schoolIdRaw) {
      const schoolId = integerValue(schoolIdRaw);
      if (schoolId === null) return c.json({ error: 'Parameter school_id tidak valid.' }, 400);
      where.push('m.school_id = ?');
      params.push(schoolId);
    }

    const menus = getMenusByDate('', where.join(' AND '), params, db) as any[];
    return c.json({ data: menus });
  });

  router.get('/menus/:id', (c) => {
    const id = Number(c.req.param('id'));
    if (!id || !Number.isInteger(id) || id <= 0) {
      return c.json({ error: 'ID menu tidak valid.' }, 400);
    }
    const menu = getMenuDetail(id, db) as any;
    if (!menu) {
      return c.json({ error: 'Menu tidak ditemukan.' }, 404);
    }
    const compositions = getMenuCompositions(id, db);
    return c.json({ data: { ...menu, compositions } });
  });

  return router;
}

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

function getAdminKitchenIds(db: Database.Database, adminId: number, role: string): number[] | 'all' {
  if (role === 'super_admin') return 'all';
  const rows = db
    .prepare('SELECT kitchen_id FROM admin_kitchens WHERE admin_id = ?')
    .all(adminId) as { kitchen_id: number }[];
  return rows.map((row) => row.kitchen_id);
}

// Resolve the kitchen that the current admin should write to. The server is
// the only source of truth: any kitchen_id sent by the client is ignored, and
// the kitchen is always picked from admin_kitchens. super_admin also has links
// (auto-created during backfill) so the same rule applies uniformly.
function resolveAdminKitchen(db: Database.Database, admin: { id: number; role: string }, requestedKitchenId?: number | null): { kitchenId: number } | { error: string } {
  const allowed = getAdminKitchenIds(db, admin.id, admin.role);
  if (allowed !== 'all' && allowed.length === 0) {
    return { error: 'Admin belum terhubung dengan dapur MBG manapun. Hubungi super admin.' };
  }
  // If a specific kitchen was requested (from page-level selector), validate it.
  if (requestedKitchenId != null && requestedKitchenId > 0) {
    if (allowed !== 'all' && !allowed.includes(requestedKitchenId)) {
      return { error: 'Anda tidak memiliki akses ke dapur tersebut.' };
    }
    return { kitchenId: requestedKitchenId };
  }
  // Fallback: use the first allowed kitchen (for backward-compat single-kitchen admins).
  if (allowed === 'all') {
    const fallback = db.prepare(
      `SELECT id FROM mbg_kitchens WHERE status = 'active' ORDER BY id ASC LIMIT 1`
    ).get() as { id: number } | undefined;
    if (!fallback) return { error: 'Belum ada dapur MBG aktif di sistem.' };
    return { kitchenId: fallback.id };
  }
  return { kitchenId: (allowed as number[])[0] };
}

function menuPayload(body: JsonObject, current?: any) {
  const errors: Record<string, string> = {};
  const value = (key: string) => hasOwn(body, key) ? body[key] : current?.[key];
  const name = requiredText(value('name'));
  const schoolId = integerValue(value('school_id'));
  const mealType = requiredText(value('meal_type'));
  const menuDate = validDate(value('menu_date'));
  if (!name) errors.name = 'Nama menu wajib diisi.';
  if (schoolId === null || schoolId <= 0) errors.school_id = 'Sekolah wajib dipilih.';
  if (!mealType || !MEAL_TYPES.includes(mealType as any)) errors.meal_type = 'Jenis makan tidak valid.';
  if (!menuDate) errors.menu_date = 'Tanggal menu tidak valid.';

  if (Object.keys(errors).length) return { errors };
  return {
    value: {
      name,
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

function replaceCompositions(db: Database.Database, menuId: number, compositions: Array<{ food_item_id: number; amount: number; unit: string }>) {
  // Pre-resolve every food item before mutating so a single bad id rolls the
  // whole transaction back instead of leaving a half-deleted composition set.
  const foodItemLookup = db.prepare('SELECT * FROM food_items WHERE id = ?');
  const insertComposition = db.prepare(`
    INSERT INTO menu_compositions (menu_id, food_item_id, amount, unit, calories, protein, carbohydrates, fat, fiber)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const resolved: Array<[number, number, number, string, number, number, number, number, number]> = [];
  for (const comp of compositions) {
    const foodItem = foodItemLookup.get(comp.food_item_id) as any;
    if (!foodItem) {
      throw new Error(`Bahan dengan ID ${comp.food_item_id} tidak ditemukan.`);
    }
    resolved.push([
      menuId,
      comp.food_item_id,
      comp.amount,
      comp.unit,
      foodItem.calories_per_100g,
      foodItem.protein_per_100g,
      foodItem.carbohydrates_per_100g,
      foodItem.fat_per_100g,
      foodItem.fiber_per_100g,
    ]);
  }
  db.prepare('DELETE FROM menu_compositions WHERE menu_id = ?').run(menuId);
  for (const row of resolved) insertComposition.run(...row);
}

export function registerMenuRoutes(app: Hono<AuthEnv>, db: Database.Database) {
  app.get('/api/admin/me/kitchens', (c) => {
    const admin = c.get('admin');
    const allowed = getAdminKitchenIds(db, admin.id, admin.role);
    if (allowed === 'all') {
      const rows = db
        .prepare(
          `SELECT id, name, code, address, village, district, city, province, postal_code, capacity, status
             FROM mbg_kitchens
             WHERE status = 'active'
             ORDER BY name ASC`
        )
        .all();
      return c.json({ data: rows });
    }
    if (allowed.length === 0) return c.json({ data: [] });
    const placeholders = allowed.map(() => '?').join(',');
    const rows = db
      .prepare(
        `SELECT id, name, code, address, village, district, city, province, postal_code, capacity, status
           FROM mbg_kitchens
           WHERE id IN (${placeholders})
           ORDER BY name ASC`
      )
      .all(...allowed);
    return c.json({ data: rows });
  });

  app.get('/api/admin/menus', (c) => {
    const admin = c.get('admin');
    const allowed = getAdminKitchenIds(db, admin.id, admin.role);
    const { page, perPage, offset } = pagination(c);
    const where: string[] = [];
    const params: unknown[] = [];
    if (allowed !== 'all') {
      if (allowed.length === 0) {
        return c.json({ data: [], pagination: paginationResponse(page, perPage, 0) });
      }
      where.push(`m.kitchen_id IN (${allowed.map(() => '?').join(',')})`);
      params.push(...allowed);
    }
    const search = c.req.query('search');
    if (search) { where.push('m.name LIKE ? ESCAPE \'\\\''); params.push(likePattern(search)); }
    if (c.req.query('date')) { where.push('m.menu_date = ?'); params.push(c.req.query('date')); }
    if (c.req.query('meal_type')) { where.push('m.meal_type = ?'); params.push(c.req.query('meal_type')); }
    if (c.req.query('kitchen_id')) {
      const kid = integerValue(c.req.query('kitchen_id'));
      if (kid === null) return validationResponse(c, { kitchen_id: 'ID dapur tidak valid.' });
      if (allowed !== 'all' && !allowed.includes(kid)) return validationResponse(c, { kitchen_id: 'Anda tidak memiliki akses ke dapur tersebut.' });
      where.push('m.kitchen_id = ?');
      params.push(kid);
    }
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
    const admin = c.get('admin');
    const allowed = getAdminKitchenIds(db, admin.id, admin.role);
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
    const filters: string[] = ['m.menu_date >= ?', 'm.menu_date <= ?'];
    const baseParams: unknown[] = [startDate, endDate];
    if (allowed !== 'all') {
      if (allowed.length === 0) {
        return c.json({ data: { startDate, endDate, days: [] } });
      }
      filters.push(`m.kitchen_id IN (${allowed.map(() => '?').join(',')})`);
      baseParams.push(...allowed);
    }
    const clause = `WHERE ${filters.join(' AND ')}`;
    const rows = db.prepare(`
      SELECT m.*, k.name AS kitchen_name, k.code AS kitchen_code,
        s.name AS school_name, s.npsn AS school_npsn,
        a.name AS creator_name, a.email AS creator_email, a.role AS creator_role
      FROM menus m JOIN mbg_kitchens k ON k.id = m.kitchen_id JOIN schools s ON s.id = m.school_id JOIN admins a ON a.id = m.created_by
      ${clause}
      ORDER BY m.menu_date, CASE m.meal_type WHEN 'breakfast' THEN 1 WHEN 'lunch' THEN 2 WHEN 'snack' THEN 3 END
    `).all(...baseParams) as any[];
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
    const admin = c.get('admin');
    const id = pathId(c.req.param('id'));
    if (id === null) return validationResponse(c, { id: 'ID menu tidak valid.' });
    const row = loadMenu(db, id);
    if (!row) return c.json({ message: 'Menu tidak ditemukan.' }, 404);
    const allowed = getAdminKitchenIds(db, admin.id, admin.role);
    if (allowed !== 'all' && !allowed.includes(row.kitchen_id)) {
      return c.json({ message: 'Anda tidak memiliki akses ke menu ini.' }, 403);
    }
    const compositions = getMenuCompositions(id, db);
    const nutrition = loadMenuNutrition(db, id);
    return c.json({ data: { ...menuView(row), compositions, nutrition } });
  });

  app.post('/api/admin/menus', async (c) => {
    const admin = c.get('admin');
    const body = await readJson(c);
    if (!body) return validationResponse(c, { body: 'Body JSON wajib diisi.' });
    // Accept kitchen_id from page-level selector but validate against admin's allowed kitchens.
    const requestedKitchenId = integerValue(body.kitchen_id);
    const payload = menuPayload(body);
    if ('errors' in payload) return validationResponse(c, payload.errors);
    const kitchen = resolveAdminKitchen(db, admin, requestedKitchenId);
    if ('error' in kitchen) return validationResponse(c, { kitchen_id: kitchen.error });
    if (!validRelationship(db, kitchen.kitchenId, payload.value.schoolId)) return validationResponse(c, { school_id: 'Sekolah tidak terhubung dengan dapur Anda.' });
    const compResult = validateCompositions(body);
    if ('errors' in compResult) return validationResponse(c, compResult.errors);

    let menuId = 0;
    const tx = db.transaction(() => {
      const result = db.prepare(`
        INSERT INTO menus (kitchen_id, school_id, name, meal_type, menu_date, description, photo_url, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(kitchen.kitchenId, payload.value.schoolId, payload.value.name, payload.value.mealType, payload.value.menuDate, payload.value.description, payload.value.photoUrl, admin.id);
      menuId = Number(result.lastInsertRowid);
      replaceCompositions(db, menuId, compResult.value!);
    });
    try {
      tx();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal menyimpan menu.';
      return validationResponse(c, { compositions: message });
    }
    const menu = loadMenu(db, menuId);
    const compositions = getMenuCompositions(menuId, db);
    const nutrition = loadMenuNutrition(db, menuId);
    return c.json({ data: { ...menuView(menu), compositions, nutrition }, message: 'Menu berhasil dibuat.' }, 201);
  });

  const updateMenu = async (c: any) => {
    const admin = c.get('admin');
    const id = pathId(c.req.param('id'));
    if (id === null) return validationResponse(c, { id: 'ID menu tidak valid.' });
    const current = loadMenu(db, id);
    if (!current) return c.json({ message: 'Menu tidak ditemukan.' }, 404);
    const allowed = getAdminKitchenIds(db, admin.id, admin.role);
    if (allowed !== 'all' && !allowed.includes(current.kitchen_id)) {
      return c.json({ message: 'Anda tidak memiliki akses ke menu ini.' }, 403);
    }
    const body = await readJson(c);
    if (!body) return validationResponse(c, { body: 'Body JSON wajib diisi.' });
    const payload = menuPayload(body, current);
    if ('errors' in payload) return validationResponse(c, payload.errors);
    // Editing never changes the owning kitchen. Always reuse the kitchen the
    // menu was originally created for.
    if (!validRelationship(db, current.kitchen_id, payload.value.schoolId)) return validationResponse(c, { school_id: 'Sekolah tidak terhubung dengan dapur menu ini.' });
    const compositionsProvided = hasOwn(body, 'compositions') && Array.isArray(body.compositions);
    let validatedCompositions: Array<{ food_item_id: number; amount: number; unit: string }> | null = null;
    if (compositionsProvided) {
      const compResult = validateCompositions(body);
      if ('errors' in compResult) return validationResponse(c, compResult.errors);
      validatedCompositions = compResult.value!;
    }

    const tx = db.transaction(() => {
      db.prepare(`
        UPDATE menus SET school_id = ?, name = ?, meal_type = ?, menu_date = ?, description = ?, photo_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).run(payload.value.schoolId, payload.value.name, payload.value.mealType, payload.value.menuDate, payload.value.description, payload.value.photoUrl, id);
      if (validatedCompositions) {
        replaceCompositions(db, id, validatedCompositions);
      }
    });
    try {
      tx();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal memperbarui menu.';
      return validationResponse(c, { compositions: message });
    }
    const menu = loadMenu(db, id);
    const compositions = getMenuCompositions(id, db);
    const nutrition = loadMenuNutrition(db, id);
    return c.json({ data: { ...menuView(menu), compositions, nutrition }, message: 'Menu berhasil diperbarui.' });
  };
  app.put('/api/admin/menus/:id', updateMenu);
  app.patch('/api/admin/menus/:id', updateMenu);

  app.delete('/api/admin/menus/:id', (c) => {
    const admin = c.get('admin');
    const id = pathId(c.req.param('id'));
    if (id === null) return validationResponse(c, { id: 'ID menu tidak valid.' });
    const current = loadMenu(db, id);
    if (!current) return c.json({ message: 'Menu tidak ditemukan.' }, 404);
    const allowed = getAdminKitchenIds(db, admin.id, admin.role);
    if (allowed !== 'all' && !allowed.includes(current.kitchen_id)) {
      return c.json({ message: 'Anda tidak memiliki akses ke menu ini.' }, 403);
    }
    const tx = db.transaction(() => {
      // menu_compositions has ON DELETE CASCADE, so deleting the menu clears its
      // compositions in the same atomic step.
      return db.prepare('DELETE FROM menus WHERE id = ?').run(id);
    });
    const result = tx();
    return result.changes ? c.json({ message: 'Menu berhasil dihapus.' }) : c.json({ message: 'Menu tidak ditemukan.' }, 404);
  });
}
