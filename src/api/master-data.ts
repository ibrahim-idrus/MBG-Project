import type Database from 'better-sqlite3';
import { Hono } from 'hono';
import type { AuthEnv } from '../auth/middleware.js';
import { hasOwn, integerValue, likePattern, pagination, paginationResponse, pathId, readJson, requiredText, validationResponse, type JsonObject } from './common.js';

const KITCHEN_FIELDS = ['name', 'code', 'address', 'village', 'district', 'city', 'province', 'postal_code'] as const;
const SCHOOL_FIELDS = ['name', 'npsn', 'address', 'village', 'district', 'city', 'province', 'postal_code'] as const;

function kitchenView(row: any) {
  return { id: row.id, name: row.name, code: row.code, address: row.address, village: row.village, district: row.district, city: row.city, province: row.province, postal_code: row.postal_code, capacity: row.capacity, status: row.status, created_at: row.created_at, updated_at: row.updated_at };
}

function schoolView(row: any) {
  return { id: row.id, kitchen_id: row.kitchen_id, name: row.name, npsn: row.npsn, address: row.address, village: row.village, district: row.district, city: row.city, province: row.province, postal_code: row.postal_code, student_count: row.student_count, status: row.status, created_at: row.created_at, updated_at: row.updated_at, kitchen: row.kitchen_name === undefined ? undefined : { id: row.kitchen_id, name: row.kitchen_name, code: row.kitchen_code } };
}

function kitchen(db: Database.Database, id: number) { return db.prepare('SELECT * FROM mbg_kitchens WHERE id = ?').get(id) as any; }
function school(db: Database.Database, id: number) { return db.prepare('SELECT s.*, k.name AS kitchen_name, k.code AS kitchen_code FROM schools s JOIN mbg_kitchens k ON k.id = s.kitchen_id WHERE s.id = ?').get(id) as any; }

function textFields(body: JsonObject, current: any, fields: readonly string[], errors: Record<string, string>) {
  const values: Record<string, string | null> = {};
  for (const field of fields) {
    const raw = hasOwn(body, field) ? body[field] : current?.[field];
    const value = requiredText(raw);
    if (!value) errors[field] = `${field} wajib diisi.`;
    values[field] = value;
  }
  return values;
}

function kitchenPayload(body: JsonObject, current?: any): any {
  const errors: Record<string, string> = {};
  const fields = textFields(body, current, KITCHEN_FIELDS, errors);
  const capacityRaw = hasOwn(body, 'capacity') ? body.capacity : current?.capacity;
  const capacity = integerValue(capacityRaw);
  if (capacity === null || capacity <= 0) errors.capacity = 'Kapasitas harus berupa angka lebih besar dari 0.';
  const status = hasOwn(body, 'status') ? requiredText(body.status) : current?.status ?? 'active';
  if (!['active', 'inactive'].includes(status)) errors.status = 'Status tidak valid.';
  return Object.keys(errors).length ? { errors } : { value: { ...fields, capacity: capacity as number, status } };
}

function schoolPayload(body: JsonObject, current?: any): any {
  const errors: Record<string, string> = {};
  const fields = textFields(body, current, SCHOOL_FIELDS, errors);
  const kitchenRaw = hasOwn(body, 'kitchen_id') ? body.kitchen_id : current?.kitchen_id;
  const kitchenId = integerValue(kitchenRaw);
  if (kitchenId === null || kitchenId <= 0) errors.kitchen_id = 'Dapur MBG wajib dipilih.';
  const studentRaw = hasOwn(body, 'student_count') ? body.student_count : current?.student_count;
  const studentCount = integerValue(studentRaw);
  if (studentCount === null || studentCount < 0) errors.student_count = 'Jumlah siswa harus berupa angka nol atau lebih.';
  const status = hasOwn(body, 'status') ? requiredText(body.status) : current?.status ?? 'active';
  if (!['active', 'inactive'].includes(status)) errors.status = 'Status tidak valid.';
  return Object.keys(errors).length ? { errors } : { value: { ...fields, kitchenId: kitchenId as number, studentCount: studentCount as number, status } };
}

function duplicateResponse(c: any, field: string) { return c.json({ message: `${field} sudah digunakan.`, errors: { [field]: `${field} sudah digunakan.` } }, 409); }

export function registerMasterDataRoutes(app: Hono<AuthEnv>, db: Database.Database) {
  app.get('/api/admin/kitchens', (c) => {
    const { page, perPage, offset } = pagination(c);
    const search = c.req.query('search');
    const where = search ? 'WHERE name LIKE ? ESCAPE \'\\\' OR code LIKE ? ESCAPE \'\\\' OR city LIKE ? ESCAPE \'\\\'' : '';
    const params = search ? [likePattern(search), likePattern(search), likePattern(search)] : [];
    const total = (db.prepare(`SELECT COUNT(*) AS count FROM mbg_kitchens ${where}`).get(...params) as any).count as number;
    const rows = db.prepare(`SELECT * FROM mbg_kitchens ${where} ORDER BY name ASC LIMIT ? OFFSET ?`).all(...params, perPage, offset);
    return c.json({ data: rows.map(kitchenView), pagination: paginationResponse(page, perPage, total) });
  });

  app.get('/api/admin/kitchens/:id', (c) => {
    const id = pathId(c.req.param('id'));
    if (id === null) return validationResponse(c, { id: 'ID dapur tidak valid.' });
    const row = kitchen(db, id);
    if (!row) return c.json({ message: 'Dapur MBG tidak ditemukan.' }, 404);
    const schools = db.prepare('SELECT * FROM schools WHERE kitchen_id = ? ORDER BY name ASC').all(id).map(schoolView);
    return c.json({ data: { ...kitchenView(row), schools } });
  });

  app.post('/api/admin/kitchens', async (c) => {
    const body = await readJson(c);
    if (!body) return validationResponse(c, { body: 'Body JSON wajib diisi.' });
    const payload = kitchenPayload(body);
    if ('errors' in payload) return validationResponse(c, payload.errors);
    try {
      const result = db.prepare(`INSERT INTO mbg_kitchens (name, code, address, village, district, city, province, postal_code, capacity, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(payload.value.name, payload.value.code, payload.value.address, payload.value.village, payload.value.district, payload.value.city, payload.value.province, payload.value.postal_code, payload.value.capacity, payload.value.status);
      return c.json({ data: kitchenView(kitchen(db, Number(result.lastInsertRowid))), message: 'Dapur MBG berhasil dibuat.' }, 201);
    } catch (error) { if (error instanceof Error && /UNIQUE constraint failed: mbg_kitchens\.code|idx_mbg_kitchens_code/i.test(error.message)) return duplicateResponse(c, 'code'); throw error; }
  });

  const updateKitchen = async (c: any) => {
    const id = pathId(c.req.param('id'));
    if (id === null) return validationResponse(c, { id: 'ID dapur tidak valid.' });
    const current = kitchen(db, id);
    if (!current) return c.json({ message: 'Dapur MBG tidak ditemukan.' }, 404);
    const body = await readJson(c);
    if (!body) return validationResponse(c, { body: 'Body JSON wajib diisi.' });
    const payload = kitchenPayload(body, current);
    if ('errors' in payload) return validationResponse(c, payload.errors);
    try {
      db.prepare(`UPDATE mbg_kitchens SET name = ?, code = ?, address = ?, village = ?, district = ?, city = ?, province = ?, postal_code = ?, capacity = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(payload.value.name, payload.value.code, payload.value.address, payload.value.village, payload.value.district, payload.value.city, payload.value.province, payload.value.postal_code, payload.value.capacity, payload.value.status, id);
      return c.json({ data: kitchenView(kitchen(db, id)), message: 'Dapur MBG berhasil diperbarui.' });
    } catch (error) { if (error instanceof Error && /UNIQUE constraint failed: mbg_kitchens\.code|idx_mbg_kitchens_code/i.test(error.message)) return duplicateResponse(c, 'code'); throw error; }
  };
  app.put('/api/admin/kitchens/:id', updateKitchen);
  app.patch('/api/admin/kitchens/:id', updateKitchen);

  app.delete('/api/admin/kitchens/:id', (c) => {
    const id = pathId(c.req.param('id'));
    if (id === null) return validationResponse(c, { id: 'ID dapur tidak valid.' });
    if (!kitchen(db, id)) return c.json({ message: 'Dapur MBG tidak ditemukan.' }, 404);
    const references = (db.prepare('SELECT (SELECT COUNT(*) FROM schools WHERE kitchen_id = ?) + (SELECT COUNT(*) FROM menus WHERE kitchen_id = ?) + (SELECT COUNT(*) FROM financial_transactions WHERE kitchen_id = ?) AS count').get(id, id, id) as any).count as number;
    if (references > 0) return c.json({ message: 'Dapur tidak dapat dihapus karena masih memiliki data terkait.' }, 409);
    db.prepare('DELETE FROM mbg_kitchens WHERE id = ?').run(id);
    return c.json({ message: 'Dapur MBG berhasil dihapus.' });
  });

  app.get('/api/admin/schools', (c) => {
    const { page, perPage, offset } = pagination(c);
    const where: string[] = [];
    const params: unknown[] = [];
    const search = c.req.query('search');
    if (search) { where.push('(s.name LIKE ? ESCAPE \'\\\' OR s.npsn LIKE ? ESCAPE \'\\\' OR s.city LIKE ? ESCAPE \'\\\')'); const pattern = likePattern(search); params.push(pattern, pattern, pattern); }
    if (c.req.query('kitchen_id')) { where.push('s.kitchen_id = ?'); params.push(c.req.query('kitchen_id')); }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const total = (db.prepare(`SELECT COUNT(*) AS count FROM schools s ${clause}`).get(...params) as any).count as number;
    const rows = db.prepare(`SELECT s.*, k.name AS kitchen_name, k.code AS kitchen_code FROM schools s JOIN mbg_kitchens k ON k.id = s.kitchen_id ${clause} ORDER BY s.name ASC LIMIT ? OFFSET ?`).all(...params, perPage, offset);
    return c.json({ data: rows.map(schoolView), pagination: paginationResponse(page, perPage, total) });
  });

  app.get('/api/admin/schools/:id', (c) => {
    const id = pathId(c.req.param('id'));
    if (id === null) return validationResponse(c, { id: 'ID sekolah tidak valid.' });
    const row = school(db, id);
    return row ? c.json({ data: schoolView(row) }) : c.json({ message: 'Sekolah tidak ditemukan.' }, 404);
  });

  app.post('/api/admin/schools', async (c) => {
    const body = await readJson(c);
    if (!body) return validationResponse(c, { body: 'Body JSON wajib diisi.' });
    const payload = schoolPayload(body);
    if ('errors' in payload) return validationResponse(c, payload.errors);
    if (!kitchen(db, payload.value.kitchenId)) return validationResponse(c, { kitchen_id: 'Dapur MBG tidak ditemukan.' });
    try {
      const result = db.prepare(`INSERT INTO schools (kitchen_id, name, npsn, address, village, district, city, province, postal_code, student_count, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(payload.value.kitchenId, payload.value.name, payload.value.npsn, payload.value.address, payload.value.village, payload.value.district, payload.value.city, payload.value.province, payload.value.postal_code, payload.value.studentCount, payload.value.status);
      return c.json({ data: schoolView(school(db, Number(result.lastInsertRowid))), message: 'Sekolah berhasil dibuat.' }, 201);
    } catch (error) { if (error instanceof Error && /UNIQUE constraint failed: schools\.npsn|idx_schools_npsn/i.test(error.message)) return duplicateResponse(c, 'npsn'); throw error; }
  });

  const updateSchool = async (c: any) => {
    const id = pathId(c.req.param('id'));
    if (id === null) return validationResponse(c, { id: 'ID sekolah tidak valid.' });
    const current = school(db, id);
    if (!current) return c.json({ message: 'Sekolah tidak ditemukan.' }, 404);
    const body = await readJson(c);
    if (!body) return validationResponse(c, { body: 'Body JSON wajib diisi.' });
    const payload = schoolPayload(body, current);
    if ('errors' in payload) return validationResponse(c, payload.errors);
    if (!kitchen(db, payload.value.kitchenId)) return validationResponse(c, { kitchen_id: 'Dapur MBG tidak ditemukan.' });
    try {
      db.prepare(`UPDATE schools SET kitchen_id = ?, name = ?, npsn = ?, address = ?, village = ?, district = ?, city = ?, province = ?, postal_code = ?, student_count = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(payload.value.kitchenId, payload.value.name, payload.value.npsn, payload.value.address, payload.value.village, payload.value.district, payload.value.city, payload.value.province, payload.value.postal_code, payload.value.studentCount, payload.value.status, id);
      return c.json({ data: schoolView(school(db, id)), message: 'Sekolah berhasil diperbarui.' });
    } catch (error) { if (error instanceof Error && /UNIQUE constraint failed: schools\.npsn|idx_schools_npsn/i.test(error.message)) return duplicateResponse(c, 'npsn'); throw error; }
  };
  app.put('/api/admin/schools/:id', updateSchool);
  app.patch('/api/admin/schools/:id', updateSchool);

  app.delete('/api/admin/schools/:id', (c) => {
    const id = pathId(c.req.param('id'));
    if (id === null) return validationResponse(c, { id: 'ID sekolah tidak valid.' });
    if (!school(db, id)) return c.json({ message: 'Sekolah tidak ditemukan.' }, 404);
    const references = (db.prepare('SELECT COUNT(*) AS count FROM menus WHERE school_id = ?').get(id) as any).count as number;
    if (references > 0) return c.json({ message: 'Sekolah tidak dapat dihapus karena masih memiliki menu terkait.' }, 409);
    db.prepare('DELETE FROM schools WHERE id = ?').run(id);
    return c.json({ message: 'Sekolah berhasil dihapus.' });
  });
}
