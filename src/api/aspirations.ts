import type Database from 'better-sqlite3';
import { Hono } from 'hono';
import type { AuthEnv } from '../auth/middleware.js';
import {
  hasOwn,
  integerValue,
  likePattern,
  pagination,
  paginationResponse,
  pathId,
  readJson,
  requiredText,
  validationResponse,
  type JsonObject,
} from './common.js';
import { publicAdmin } from './common.js';

const STATUSES = ['pending', 'in_progress', 'completed', 'rejected'] as const;

const PHONE_PATTERN = /^[+0-9()\-\s]{6,32}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicView(row: any) {
  return {
    id: row.id,
    sender_name: row.sender_name,
    sender_email: row.sender_email,
    sender_phone: row.sender_phone,
    kitchen_id: row.kitchen_id,
    kitchen: row.kitchen_id == null
      ? null
      : { id: row.kitchen_id, name: row.kitchen_name, code: row.kitchen_code },
    category: row.category,
    description: row.description,
    photo_url: row.photo_url,
    status: row.status,
    admin_response: row.admin_response,
    responded_at: row.responded_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function adminView(row: any) {
  return {
    ...publicView(row),
    responded_by: row.responded_by,
    responder: row.responded_by
      ? publicAdmin({
          id: row.responded_by,
          name: row.responder_name,
          email: row.responder_email,
          role: row.responder_role,
        })
      : null,
  };
}

function loadAspiration(db: Database.Database, id: number) {
  return db
    .prepare(
      `SELECT f.*, a.name AS responder_name, a.email AS responder_email, a.role AS responder_role,
              k.name AS kitchen_name, k.code AS kitchen_code
         FROM aspirations f
         LEFT JOIN admins a ON a.id = f.responded_by
         LEFT JOIN mbg_kitchens k ON k.id = f.kitchen_id
         WHERE f.id = ?`
    )
    .get(id) as any;
}

function getAdminKitchenIds(db: Database.Database, adminId: number, role: string): number[] | 'all' {
  if (role === 'super_admin') return 'all';
  const rows = db
    .prepare('SELECT kitchen_id FROM admin_kitchens WHERE admin_id = ?')
    .all(adminId) as { kitchen_id: number }[];
  return rows.map((row) => row.kitchen_id);
}

function publicPayload(body: JsonObject) {
  const errors: Record<string, string> = {};
  const senderName = requiredText(body.sender_name);
  const senderEmail = hasOwn(body, 'sender_email')
    ? body.sender_email === null || body.sender_email === ''
      ? null
      : requiredText(body.sender_email)
    : null;
  const senderPhone = requiredText(body.sender_phone);
  const kitchenId = integerValue(body.kitchen_id);
  const category = requiredText(body.category);
  const description = requiredText(body.description);

  if (!senderName) errors.sender_name = 'Nama wajib diisi.';
  if (senderEmail !== null && !EMAIL_PATTERN.test(senderEmail)) errors.sender_email = 'Email tidak valid.';
  if (!senderPhone) errors.sender_phone = 'Nomor telepon wajib diisi.';
  else if (!PHONE_PATTERN.test(senderPhone)) errors.sender_phone = 'Nomor telepon tidak valid.';
  if (kitchenId === null || kitchenId <= 0) errors.kitchen_id = 'Dapur MBG wajib dipilih.';
  if (!category) errors.category = 'Kategori wajib diisi.';
  if (!description) errors.description = 'Aspirasi wajib diisi.';

  if (Object.keys(errors).length) return { errors };
  return {
    value: {
      senderName: senderName as string,
      senderEmail,
      senderPhone: senderPhone as string,
      kitchenId: kitchenId as number,
      category: category as string,
      description: description as string,
      photoUrl: typeof body.photo_url === 'string' && body.photo_url.trim() ? body.photo_url.trim() : null,
    },
  };
}

export function registerAspirationRoutes(app: Hono<AuthEnv>, db: Database.Database) {
  // Public kitchen list for the feedback form
  app.get('/api/kitchens', (c) => {
    const rows = db
      .prepare(
        `SELECT id, name, code, city, province
           FROM mbg_kitchens
           WHERE status = 'active'
           ORDER BY name ASC`
      )
      .all();
    return c.json({ data: rows });
  });

  // Public create (no auth required)
  app.post('/api/aspirations', async (c) => {
    const body = await readJson(c);
    if (!body) return validationResponse(c, { body: 'Body JSON wajib diisi.' });
    const payload = publicPayload(body);
    if ('errors' in payload) return validationResponse(c, payload.errors);
    if (!db.prepare('SELECT 1 FROM mbg_kitchens WHERE id = ? AND status = \'active\'').get(payload.value.kitchenId)) {
      return validationResponse(c, { kitchen_id: 'Dapur MBG tidak ditemukan atau tidak aktif.' });
    }
    const result = db
      .prepare(
        `INSERT INTO aspirations (sender_name, sender_email, sender_phone, kitchen_id, category, description, photo_url, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`
      )
      .run(
        payload.value.senderName,
        payload.value.senderEmail,
        payload.value.senderPhone,
        payload.value.kitchenId,
        payload.value.category,
        payload.value.description,
        payload.value.photoUrl
      );
    const created = loadAspiration(db, Number(result.lastInsertRowid));
    return c.json({ data: publicView(created), message: 'Aspirasi berhasil dikirim.' }, 201);
  });

  // Admin list scoped to the admin's kitchens
  app.get('/api/admin/aspirations', (c) => {
    const admin = c.get('admin');
    const allowed = getAdminKitchenIds(db, admin.id, admin.role);
    const { page, perPage, offset } = pagination(c);
    const filters: string[] = [];
    const params: unknown[] = [];
    if (allowed !== 'all') {
      if (allowed.length === 0) {
        return c.json({ data: [], pagination: paginationResponse(page, perPage, 0) });
      }
      filters.push(`f.kitchen_id IN (${allowed.map(() => '?').join(',')})`);
      params.push(...allowed);
    }
    const search = c.req.query('search');
    if (search) {
      filters.push(`(f.sender_name LIKE ? ESCAPE '\\' OR f.description LIKE ? ESCAPE '\\' OR f.category LIKE ? ESCAPE '\\' OR f.sender_email LIKE ? ESCAPE '\\' OR f.sender_phone LIKE ? ESCAPE '\\')`);
      const pattern = likePattern(search);
      params.push(pattern, pattern, pattern, pattern, pattern);
    }
    if (c.req.query('category')) { filters.push('f.category = ?'); params.push(c.req.query('category')); }
    if (c.req.query('status')) { filters.push('f.status = ?'); params.push(c.req.query('status')); }
    if (c.req.query('kitchen_id')) {
      const kitchenId = integerValue(c.req.query('kitchen_id'));
      if (kitchenId === null || kitchenId <= 0) return validationResponse(c, { kitchen_id: 'ID dapur tidak valid.' });
      if (allowed !== 'all' && !allowed.includes(kitchenId)) return validationResponse(c, { kitchen_id: 'Anda tidak memiliki akses ke dapur tersebut.' });
      filters.push('f.kitchen_id = ?');
      params.push(kitchenId);
    }
    const clause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const total = (db.prepare(`SELECT COUNT(*) AS count FROM aspirations f ${clause}`).get(...params) as any).count as number;
    const sort = c.req.query('sort') === 'oldest' ? 'ASC' : 'DESC';
    const rows = db
      .prepare(
        `SELECT f.*, a.name AS responder_name, a.email AS responder_email, a.role AS responder_role,
                k.name AS kitchen_name, k.code AS kitchen_code
           FROM aspirations f
           LEFT JOIN admins a ON a.id = f.responded_by
           LEFT JOIN mbg_kitchens k ON k.id = f.kitchen_id
           ${clause}
           ORDER BY f.created_at ${sort}, f.id ${sort}
           LIMIT ? OFFSET ?`
      )
      .all(...params, perPage, offset);
    return c.json({ data: rows.map(adminView), pagination: paginationResponse(page, perPage, total) });
  });

  app.get('/api/admin/aspirations/:id', (c) => {
    const admin = c.get('admin');
    const id = pathId(c.req.param('id'));
    if (id === null) return validationResponse(c, { id: 'ID aspirasi tidak valid.' });
    const row = loadAspiration(db, id);
    if (!row) return c.json({ message: 'Aspirasi tidak ditemukan.' }, 404);
    if (row.kitchen_id !== null) {
      const allowed = getAdminKitchenIds(db, admin.id, admin.role);
      if (allowed !== 'all' && !allowed.includes(row.kitchen_id)) {
        return c.json({ message: 'Anda tidak memiliki akses ke aspirasi ini.' }, 403);
      }
    }
    return c.json({ data: adminView(row) });
  });

  app.patch('/api/admin/aspirations/:id', async (c) => {
    const admin = c.get('admin');
    const id = pathId(c.req.param('id'));
    if (id === null) return validationResponse(c, { id: 'ID aspirasi tidak valid.' });
    const current = loadAspiration(db, id);
    if (!current) return c.json({ message: 'Aspirasi tidak ditemukan.' }, 404);
    if (current.kitchen_id !== null) {
      const allowed = getAdminKitchenIds(db, admin.id, admin.role);
      if (allowed !== 'all' && !allowed.includes(current.kitchen_id)) {
        return c.json({ message: 'Anda tidak memiliki akses ke aspirasi ini.' }, 403);
      }
    }
    const body = await readJson(c);
    if (!body) return validationResponse(c, { body: 'Body JSON wajib diisi.' });
    const errors: Record<string, string> = {};
    const status = hasOwn(body, 'status') ? requiredText(body.status) : current.status;
    if (!status || !STATUSES.includes(status as any)) errors.status = 'Status aspirasi tidak valid.';
    const responseProvided = hasOwn(body, 'admin_response');
    let response: string | null;
    if (responseProvided) {
      if (body.admin_response === null) response = null;
      else response = requiredText(body.admin_response);
    } else {
      response = current.admin_response;
    }
    if (responseProvided && body.admin_response !== null && !response) {
      errors.admin_response = 'Tanggapan wajib diisi atau null.';
    }
    if (Object.keys(errors).length) return validationResponse(c, errors);
    const respondedBy = responseProvided ? (response ? admin.id : null) : current.responded_by;
    const respondedAt = responseProvided ? (response ? new Date().toISOString() : null) : current.responded_at;
    db.prepare(
      `UPDATE aspirations
          SET status = ?, admin_response = ?, responded_by = ?, responded_at = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`
    ).run(status, response, respondedBy, respondedAt, id);
    return c.json({ data: adminView(loadAspiration(db, id)), message: 'Aspirasi berhasil diperbarui.' });
  });
}
