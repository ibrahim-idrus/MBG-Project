import type Database from 'better-sqlite3';
import { Hono } from 'hono';
import type { AuthEnv } from '../auth/middleware.js';
import { decimalValue, hasOwn, integerValue, likePattern, pagination, paginationResponse, pathId, readJson, requiredText, validDate, validationResponse, type JsonObject } from './common.js';

const TYPES = ['IN', 'OUT'] as const;

function transactionView(row: any) {
  return {
    id: row.id,
    kitchen_id: row.kitchen_id,
    type: row.type,
    category: row.category,
    title: row.title,
    amount: row.amount,
    transaction_date: row.transaction_date,
    description: row.description,
    document_url: row.document_url,
    created_by: row.created_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
    kitchen: row.kitchen_name === undefined ? undefined : { id: row.kitchen_id, name: row.kitchen_name, code: row.kitchen_code },
    creator: row.creator_name === undefined ? undefined : { id: row.created_by, name: row.creator_name, email: row.creator_email, role: row.creator_role },
  };
}
function loadTransaction(db: Database.Database, id: number) {
  return db.prepare(`
    SELECT t.*, k.name AS kitchen_name, k.code AS kitchen_code,
      a.name AS creator_name, a.email AS creator_email, a.role AS creator_role
    FROM financial_transactions t
    JOIN mbg_kitchens k ON k.id = t.kitchen_id
    JOIN admins a ON a.id = t.created_by
    WHERE t.id = ?
  `).get(id) as any;
}

function transactionPayload(body: JsonObject, current?: any) {
  const errors: Record<string, string> = {};
  const value = (key: string) => hasOwn(body, key) ? body[key] : current?.[key];
  const kitchenId = integerValue(value('kitchen_id'));
  const type = requiredText(value('type'));
  const category = requiredText(value('category'));
  const title = requiredText(value('title'));
  const amount = decimalValue(value('amount'));
  const date = validDate(value('transaction_date'));
  if (kitchenId === null || kitchenId <= 0) errors.kitchen_id = 'Dapur MBG wajib dipilih.';
  if (!type || !TYPES.includes(type as any)) errors.type = 'Tipe transaksi harus IN atau OUT.';
  if (!category) errors.category = 'Kategori wajib diisi.';
  if (!title) errors.title = 'Judul transaksi wajib diisi.';
  if (amount === null || amount <= 0) errors.amount = 'Nominal harus berupa angka lebih besar dari 0.';
  if (!date) errors.transaction_date = 'Tanggal transaksi tidak valid.';
  if (Object.keys(errors).length) return { errors };
  return {
    value: {
      kitchenId: kitchenId as number,
      type: type as string,
      category: category as string,
      title: title as string,
      amount: amount as number,
      date: date as string,
      description: hasOwn(body, 'description') ? body.description === null ? null : String(body.description).trim() || null : current?.description ?? null,
      documentUrl: hasOwn(body, 'document_url') ? body.document_url === null ? null : String(body.document_url).trim() || null : current?.document_url ?? null,
    },
  };
}

function kitchenExists(db: Database.Database, kitchenId: number): boolean {
  return Boolean(db.prepare('SELECT 1 FROM mbg_kitchens WHERE id = ?').get(kitchenId));
}

export function registerFinanceRoutes(app: Hono<AuthEnv>, db: Database.Database) {
  app.get('/api/admin/finance/transactions', (c) => {
    const { page, perPage, offset } = pagination(c);
    const where: string[] = [];
    const params: unknown[] = [];
    const search = c.req.query('search');
    if (search) { where.push('(t.title LIKE ? ESCAPE \'\\\' OR t.category LIKE ? ESCAPE \'\\\' OR t.description LIKE ? ESCAPE \'\\\')'); const pattern = likePattern(search); params.push(pattern, pattern, pattern); }
    if (c.req.query('type')) { where.push('t.type = ?'); params.push(c.req.query('type')); }
    if (c.req.query('category')) { where.push('t.category = ?'); params.push(c.req.query('category')); }
    if (c.req.query('kitchen_id')) { where.push('t.kitchen_id = ?'); params.push(c.req.query('kitchen_id')); }
    if (c.req.query('date')) { where.push('t.transaction_date = ?'); params.push(c.req.query('date')); }
    if (c.req.query('date_from')) { where.push('t.transaction_date >= ?'); params.push(c.req.query('date_from')); }
    if (c.req.query('date_to')) { where.push('t.transaction_date <= ?'); params.push(c.req.query('date_to')); }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const total = (db.prepare(`SELECT COUNT(*) AS count FROM financial_transactions t ${clause}`).get(...params) as any).count as number;
    const sort = c.req.query('sort');
    const order = sort === 'amount_desc' ? 't.amount DESC, t.id DESC' : sort === 'amount_asc' ? 't.amount ASC, t.id ASC' : sort === 'oldest' ? 't.transaction_date ASC, t.id ASC' : 't.transaction_date DESC, t.id DESC';
    const rows = db.prepare(`
      SELECT t.*, k.name AS kitchen_name, k.code AS kitchen_code,
        a.name AS creator_name, a.email AS creator_email, a.role AS creator_role
      FROM financial_transactions t JOIN mbg_kitchens k ON k.id = t.kitchen_id JOIN admins a ON a.id = t.created_by
      ${clause} ORDER BY ${order} LIMIT ? OFFSET ?
    `).all(...params, perPage, offset);
    return c.json({ data: rows.map(transactionView), pagination: paginationResponse(page, perPage, total) });
  });

  app.get('/api/admin/finance/transactions/:id', (c) => {
    const id = pathId(c.req.param('id'));
    if (id === null) return validationResponse(c, { id: 'ID transaksi tidak valid.' });
    const row = loadTransaction(db, id);
    return row ? c.json({ data: transactionView(row) }) : c.json({ message: 'Transaksi tidak ditemukan.' }, 404);
  });

  app.post('/api/admin/finance/transactions', async (c) => {
    const body = await readJson(c);
    if (!body) return validationResponse(c, { body: 'Body JSON wajib diisi.' });
    const payload = transactionPayload(body);
    if ('errors' in payload) return validationResponse(c, payload.errors);
    if (!kitchenExists(db, payload.value.kitchenId)) return validationResponse(c, { kitchen_id: 'Dapur MBG tidak ditemukan.' });
    const admin = c.get('admin');
    const result = db.prepare(`
      INSERT INTO financial_transactions (kitchen_id, type, category, title, amount, transaction_date, description, document_url, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(payload.value.kitchenId, payload.value.type, payload.value.category, payload.value.title, payload.value.amount, payload.value.date, payload.value.description, payload.value.documentUrl, admin.id);
    return c.json({ data: transactionView(loadTransaction(db, Number(result.lastInsertRowid))), message: 'Transaksi berhasil dibuat.' }, 201);
  });

  const updateTransaction = async (c: any) => {
    const id = pathId(c.req.param('id'));
    if (id === null) return validationResponse(c, { id: 'ID transaksi tidak valid.' });
    const current = loadTransaction(db, id);
    if (!current) return c.json({ message: 'Transaksi tidak ditemukan.' }, 404);
    const body = await readJson(c);
    if (!body) return validationResponse(c, { body: 'Body JSON wajib diisi.' });
    const payload = transactionPayload(body, current);
    if ('errors' in payload) return validationResponse(c, payload.errors);
    if (!kitchenExists(db, payload.value.kitchenId)) return validationResponse(c, { kitchen_id: 'Dapur MBG tidak ditemukan.' });
    db.prepare(`
      UPDATE financial_transactions SET kitchen_id = ?, type = ?, category = ?, title = ?, amount = ?, transaction_date = ?, description = ?, document_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(payload.value.kitchenId, payload.value.type, payload.value.category, payload.value.title, payload.value.amount, payload.value.date, payload.value.description, payload.value.documentUrl, id);
    return c.json({ data: transactionView(loadTransaction(db, id)), message: 'Transaksi berhasil diperbarui.' });
  };
  app.put('/api/admin/finance/transactions/:id', updateTransaction);
  app.patch('/api/admin/finance/transactions/:id', updateTransaction);

  app.delete('/api/admin/finance/transactions/:id', (c) => {
    const id = pathId(c.req.param('id'));
    if (id === null) return validationResponse(c, { id: 'ID transaksi tidak valid.' });
    const result = db.prepare('DELETE FROM financial_transactions WHERE id = ?').run(id);
    return result.changes ? c.json({ message: 'Transaksi berhasil dihapus.' }) : c.json({ message: 'Transaksi tidak ditemukan.' }, 404);
  });

  const statistics = (c: any) => {
    const yearRaw = c.req.query('year');
    const year = yearRaw ? Number(yearRaw) : new Date().getUTCFullYear();
    if (!/^\d{4}$/.test(String(year)) || !Number.isInteger(year) || year < 1900 || year > 9999) return validationResponse(c, { year: 'Tahun tidak valid.' });
    const kitchenIdRaw = c.req.query('kitchen_id');
    const kitchenId = kitchenIdRaw ? integerValue(kitchenIdRaw) : null;
    if (kitchenIdRaw && (kitchenId === null || kitchenId <= 0)) return validationResponse(c, { kitchen_id: 'ID dapur tidak valid.' });
    if (kitchenId !== null && !kitchenExists(db, kitchenId)) return validationResponse(c, { kitchen_id: 'Dapur MBG tidak ditemukan.' });
    const start = `${year}-01-01`;
    const end = `${year + 1}-01-01`;
    const kitchenClause = kitchenId === null ? '' : ' AND kitchen_id = ?';
    const kitchenParams = kitchenId === null ? [] : [kitchenId];
    const summary = db.prepare(`SELECT COALESCE(SUM(CASE WHEN type = 'IN' THEN amount ELSE 0 END), 0) AS total_income, COALESCE(SUM(CASE WHEN type = 'OUT' THEN amount ELSE 0 END), 0) AS total_expenses FROM financial_transactions WHERE transaction_date >= ? AND transaction_date < ?${kitchenClause}`).get(start, end, ...kitchenParams) as any;
    const monthlyRows = db.prepare(`SELECT CAST(strftime('%m', transaction_date) AS INTEGER) AS month, COALESCE(SUM(CASE WHEN type = 'IN' THEN amount ELSE 0 END), 0) AS income, COALESCE(SUM(CASE WHEN type = 'OUT' THEN amount ELSE 0 END), 0) AS expenses FROM financial_transactions WHERE transaction_date >= ? AND transaction_date < ?${kitchenClause} GROUP BY month`).all(start, end, ...kitchenParams) as any[];
    const monthlyMap = new Map(monthlyRows.map((row) => [row.month, row]));
    const monthly = Array.from({ length: 12 }, (_, index) => { const row = monthlyMap.get(index + 1); return { month: index + 1, income: row?.income ?? 0, expenses: row?.expenses ?? 0 }; });
    const categories = db.prepare(`SELECT category, COALESCE(SUM(amount), 0) AS total FROM financial_transactions WHERE type = 'OUT' AND transaction_date >= ? AND transaction_date < ?${kitchenClause} GROUP BY category ORDER BY total DESC, category ASC`).all(start, end, ...kitchenParams);
    const recent = db.prepare(`SELECT t.*, k.name AS kitchen_name, k.code AS kitchen_code, a.name AS creator_name, a.email AS creator_email, a.role AS creator_role FROM financial_transactions t JOIN mbg_kitchens k ON k.id = t.kitchen_id JOIN admins a ON a.id = t.created_by WHERE t.transaction_date >= ? AND t.transaction_date < ?${kitchenClause} ORDER BY t.transaction_date DESC, t.id DESC LIMIT 5`).all(start, end, ...kitchenParams).map(transactionView);
    const top = db.prepare(`SELECT t.*, k.name AS kitchen_name, k.code AS kitchen_code, a.name AS creator_name, a.email AS creator_email, a.role AS creator_role FROM financial_transactions t JOIN mbg_kitchens k ON k.id = t.kitchen_id JOIN admins a ON a.id = t.created_by WHERE t.type = 'OUT' AND t.transaction_date >= ? AND t.transaction_date < ?${kitchenClause} ORDER BY t.amount DESC, t.id DESC LIMIT 5`).all(start, end, ...kitchenParams).map(transactionView);
    const totalIncome = Number(summary.total_income);
    const totalExpenses = Number(summary.total_expenses);
    return c.json({ data: { summary: { total_income: totalIncome, total_expenses: totalExpenses, balance: totalIncome - totalExpenses }, monthly, expense_by_category: categories, recent_transactions: recent, top_transactions: top }, filters: { year, kitchen_id: kitchenId } });
  };
  app.get('/api/admin/finance/statistics', statistics);
  app.get('/api/admin/statistics/finance', statistics);
  app.get('/api/admin/financial-statistics', statistics);
}
