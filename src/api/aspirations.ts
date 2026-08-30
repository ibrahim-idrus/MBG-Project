import type Database from 'better-sqlite3';
import { Hono } from 'hono';
import type { AuthEnv } from '../auth/middleware.js';
import { hasOwn, likePattern, pagination, paginationResponse, pathId, readJson, requiredText, validationResponse, type JsonObject } from './common.js';

const STATUSES = ['pending', 'in_progress', 'completed', 'rejected'] as const;

function publicView(row: any) {
  return { id: row.id, sender_name: row.sender_name, category: row.category, description: row.description, photo_url: row.photo_url, status: row.status, admin_response: row.admin_response, responded_at: row.responded_at, created_at: row.created_at, updated_at: row.updated_at };
}
function adminView(row: any) {
  return { ...publicView(row), sender_email: row.sender_email, responded_by: row.responded_by, responder: row.responder_name ? { id: row.responded_by, name: row.responder_name, email: row.responder_email, role: row.responder_role } : null };
}

function loadAspiration(db: Database.Database, id: number) {
  return db.prepare(`
    SELECT f.*, a.name AS responder_name, a.email AS responder_email, a.role AS responder_role
    FROM aspirations f LEFT JOIN admins a ON a.id = f.responded_by WHERE f.id = ?
  `).get(id) as any;
}

function publicPayload(body: JsonObject) {
  const errors: Record<string, string> = {};
  const senderName = requiredText(body.sender_name);
  const category = requiredText(body.category);
  const description = requiredText(body.description);
  if (!senderName) errors.sender_name = 'Nama wajib diisi.';
  if (!category) errors.category = 'Kategori wajib diisi.';
  if (!description) errors.description = 'Aspirasi wajib diisi.';
  if (body.sender_email !== undefined && body.sender_email !== null && (typeof body.sender_email !== 'string' || !/^\S+@\S+\.\S+$/.test(body.sender_email.trim()))) errors.sender_email = 'Email tidak valid.';
  if (Object.keys(errors).length) return { errors };
  return { value: { senderName, senderEmail: typeof body.sender_email === 'string' ? body.sender_email.trim() || null : null, category, description, photoUrl: typeof body.photo_url === 'string' ? body.photo_url.trim() || null : null } };
}

export function registerAspirationRoutes(app: Hono<AuthEnv>, db: Database.Database) {
  app.get('/api/aspirations', (c) => {
    const { page, perPage, offset } = pagination(c);
    const where: string[] = [];
    const params: unknown[] = [];
    const search = c.req.query('search');
    if (search) { where.push('(sender_name LIKE ? ESCAPE \'\\\' OR description LIKE ? ESCAPE \'\\\' OR category LIKE ? ESCAPE \'\\\')'); const pattern = likePattern(search); params.push(pattern, pattern, pattern); }
    if (c.req.query('category')) { where.push('category = ?'); params.push(c.req.query('category')); }
    if (c.req.query('status')) { where.push('status = ?'); params.push(c.req.query('status')); }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const total = (db.prepare(`SELECT COUNT(*) AS count FROM aspirations ${clause}`).get(...params) as any).count as number;
    const sort = c.req.query('sort') === 'oldest' ? 'ASC' : 'DESC';
    const rows = db.prepare(`SELECT * FROM aspirations ${clause} ORDER BY created_at ${sort}, id ${sort} LIMIT ? OFFSET ?`).all(...params, perPage, offset);
    return c.json({ data: rows.map(publicView), pagination: paginationResponse(page, perPage, total) });
  });

  app.get('/api/aspirations/:id', (c) => {
    const id = pathId(c.req.param('id'));
    if (id === null) return validationResponse(c, { id: 'ID aspirasi tidak valid.' });
    const row = loadAspiration(db, id);
    return row ? c.json({ data: publicView(row) }) : c.json({ message: 'Aspirasi tidak ditemukan.' }, 404);
  });

  app.post('/api/aspirations', async (c) => {
    const body = await readJson(c);
    if (!body) return validationResponse(c, { body: 'Body JSON wajib diisi.' });
    const payload = publicPayload(body);
    if ('errors' in payload) return validationResponse(c, payload.errors);
    const result = db.prepare(`INSERT INTO aspirations (sender_name, sender_email, category, description, photo_url, status) VALUES (?, ?, ?, ?, ?, 'pending')`).run(payload.value.senderName, payload.value.senderEmail, payload.value.category, payload.value.description, payload.value.photoUrl);
    return c.json({ data: publicView(loadAspiration(db, Number(result.lastInsertRowid))), message: 'Aspirasi berhasil dikirim.' }, 201);
  });

  app.get('/api/admin/aspirations', (c) => {
    const { page, perPage, offset } = pagination(c);
    const where: string[] = [];
    const params: unknown[] = [];
    const search = c.req.query('search');
    if (search) { where.push('(f.sender_name LIKE ? ESCAPE \'\\\' OR f.description LIKE ? ESCAPE \'\\\' OR f.category LIKE ? ESCAPE \'\\\')'); const pattern = likePattern(search); params.push(pattern, pattern, pattern); }
    if (c.req.query('category')) { where.push('f.category = ?'); params.push(c.req.query('category')); }
    if (c.req.query('status')) { where.push('f.status = ?'); params.push(c.req.query('status')); }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const total = (db.prepare(`SELECT COUNT(*) AS count FROM aspirations f ${clause}`).get(...params) as any).count as number;
    const sort = c.req.query('sort') === 'oldest' ? 'ASC' : 'DESC';
    const rows = db.prepare(`SELECT f.*, a.name AS responder_name, a.email AS responder_email, a.role AS responder_role FROM aspirations f LEFT JOIN admins a ON a.id = f.responded_by ${clause} ORDER BY f.created_at ${sort}, f.id ${sort} LIMIT ? OFFSET ?`).all(...params, perPage, offset);
    return c.json({ data: rows.map(adminView), pagination: paginationResponse(page, perPage, total) });
  });

  app.get('/api/admin/aspirations/:id', (c) => {
    const id = pathId(c.req.param('id'));
    if (id === null) return validationResponse(c, { id: 'ID aspirasi tidak valid.' });
    const row = loadAspiration(db, id);
    return row ? c.json({ data: adminView(row) }) : c.json({ message: 'Aspirasi tidak ditemukan.' }, 404);
  });

  app.patch('/api/admin/aspirations/:id', async (c) => {
    const id = pathId(c.req.param('id'));
    if (id === null) return validationResponse(c, { id: 'ID aspirasi tidak valid.' });
    const current = loadAspiration(db, id);
    if (!current) return c.json({ message: 'Aspirasi tidak ditemukan.' }, 404);
    const body = await readJson(c);
    if (!body) return validationResponse(c, { body: 'Body JSON wajib diisi.' });
    const errors: Record<string, string> = {};
    const status = hasOwn(body, 'status') ? requiredText(body.status) : current.status;
    if (!status || !STATUSES.includes(status as any)) errors.status = 'Status aspirasi tidak valid.';
    const responseProvided = hasOwn(body, 'admin_response');
    const response = responseProvided ? body.admin_response === null ? null : requiredText(body.admin_response) : current.admin_response;
    if (responseProvided && body.admin_response !== null && !response) errors.admin_response = 'Tanggapan wajib diisi atau null.';
    if (Object.keys(errors).length) return validationResponse(c, errors);
    const admin = c.get('admin');
    const respondedBy = responseProvided ? response ? admin.id : null : current.responded_by;
    const respondedAt = responseProvided ? response ? new Date().toISOString() : null : current.responded_at;
    db.prepare(`UPDATE aspirations SET status = ?, admin_response = ?, responded_by = ?, responded_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(status, response, respondedBy, respondedAt, id);
    return c.json({ data: adminView(loadAspiration(db, id)), message: 'Aspirasi berhasil diperbarui.' });
  });
}
