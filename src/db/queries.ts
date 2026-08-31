import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, '../../data/mbg.db');

// ponytail: single shared connection, reopen if closed
let _db: Database.Database | null = null;
function db(): Database.Database {
  if (!_db) _db = new Database(DB_PATH);
  return _db;
}

// Shared helper: get IN/OUT totals
function getFinancialTotals() {
  const totalIn = db().prepare('SELECT COALESCE(SUM(amount), 0) as total FROM financial_transactions WHERE type = ?').get('IN') as { total: number };
  const totalOut = db().prepare('SELECT COALESCE(SUM(amount), 0) as total FROM financial_transactions WHERE type = ?').get('OUT') as { total: number };
  return { totalIn: totalIn.total, totalOut: totalOut.total };
}

// Dashboard queries
export function getDashboardStats() {
  const { totalIn, totalOut } = getFinancialTotals();
  const pendingAspirations = db().prepare('SELECT COUNT(*) as count FROM aspirations WHERE status = ?').get('pending') as { count: number };
  
  return {
    danaDiterima: totalIn,
    totalPengeluaran: totalOut,
    sisaDana: totalIn - totalOut,
    laporanBaru: pendingAspirations.count,
  };
}

export function getRecentAspirations(limit: number = 5) {
  return db().prepare(`
    SELECT id, sender_name, category, description, status, created_at
    FROM aspirations
    ORDER BY created_at DESC
    LIMIT ?
  `).all(limit);
}

// Finance queries
export function getFinanceStats() {
  const { totalIn, totalOut } = getFinancialTotals();
  
  return {
    saldoKas: totalIn - totalOut,
    pemasukanBulanIni: totalIn,
    pengeluaranBulanIni: totalOut,
  };
}

export function getTransactions(limit: number = 10) {
  return db().prepare(`
    SELECT id, type, category, title, amount, transaction_date, description, document_url
    FROM financial_transactions
    ORDER BY transaction_date DESC
    LIMIT ?
  `).all(limit);
}

// Menu queries
export function getMenuStats() {
  const totalMenus = db().prepare('SELECT COUNT(*) as count FROM menus').get() as { count: number };
  const avgCalories = db().prepare(`
    SELECT COALESCE(AVG(total_calories), 0) as avg 
    FROM (
      SELECT SUM(mc.calories) as total_calories 
      FROM menus m 
      LEFT JOIN menu_compositions mc ON m.id = mc.menu_id 
      GROUP BY m.id
    )
  `).get() as { avg: number };
  const avgProtein = db().prepare(`
    SELECT COALESCE(AVG(total_protein), 0) as avg 
    FROM (
      SELECT SUM(mc.protein) as total_protein 
      FROM menus m 
      LEFT JOIN menu_compositions mc ON m.id = mc.menu_id 
      GROUP BY m.id
    )
  `).get() as { avg: number };
  
  return {
    totalMenus: totalMenus.count,
    avgCalories: Math.round(avgCalories.avg),
    avgProtein: Math.round(avgProtein.avg),
  };
}

export function getMenusByDate(date: string) {
  return db().prepare(`
    SELECT m.id, m.name, m.meal_type, m.description, m.photo_url, m.menu_date,
           k.name as kitchen_name, s.name as school_name,
           COALESCE(SUM(mc.calories), 0) as total_calories,
           COALESCE(SUM(mc.protein), 0) as total_protein,
           COALESCE(SUM(mc.carbohydrates), 0) as total_carbohydrates,
           COALESCE(SUM(mc.fat), 0) as total_fat,
           COALESCE(SUM(mc.fiber), 0) as total_fiber
    FROM menus m
    LEFT JOIN mbg_kitchens k ON m.kitchen_id = k.id
    LEFT JOIN schools s ON m.school_id = s.id
    LEFT JOIN menu_compositions mc ON m.id = mc.menu_id
    WHERE m.menu_date = ?
    GROUP BY m.id, m.name, m.meal_type, m.description, m.photo_url, m.menu_date, k.name, s.name
    ORDER BY m.meal_type
  `).all(date);
}

export function getMenusByWeek(startDate: string, endDate: string) {
  return db().prepare(`
    SELECT m.id, m.name, m.meal_type, m.description, m.photo_url, m.menu_date,
           m.kitchen_id, m.school_id,
           k.name as kitchen_name, k.code as kitchen_code,
           s.name as school_name,
           COALESCE(SUM(mc.calories), 0) as total_calories,
           COALESCE(SUM(mc.protein), 0) as total_protein,
           COALESCE(SUM(mc.carbohydrates), 0) as total_carbohydrates,
           COALESCE(SUM(mc.fat), 0) as total_fat,
           COALESCE(SUM(mc.fiber), 0) as total_fiber
    FROM menus m
    LEFT JOIN mbg_kitchens k ON m.kitchen_id = k.id
    LEFT JOIN schools s ON m.school_id = s.id
    LEFT JOIN menu_compositions mc ON m.id = mc.menu_id
    WHERE m.menu_date >= ? AND m.menu_date <= ?
    GROUP BY m.id, m.name, m.meal_type, m.description, m.photo_url, m.menu_date, m.kitchen_id, m.school_id, k.name, k.code, s.name
    ORDER BY m.menu_date, CASE m.meal_type WHEN 'breakfast' THEN 1 WHEN 'lunch' THEN 2 WHEN 'snack' THEN 3 END
  `).all(startDate, endDate);
}

export function getMenuDetail(menuId: number) {
  return db().prepare(`
    SELECT m.id, m.name, m.meal_type, m.description, m.photo_url, m.menu_date,
           m.kitchen_id, m.school_id,
           k.name as kitchen_name,
           s.name as school_name,
           COALESCE(SUM(mc.calories), 0) as total_calories,
           COALESCE(SUM(mc.protein), 0) as total_protein,
           COALESCE(SUM(mc.carbohydrates), 0) as total_carbohydrates,
           COALESCE(SUM(mc.fat), 0) as total_fat,
           COALESCE(SUM(mc.fiber), 0) as total_fiber
    FROM menus m
    LEFT JOIN mbg_kitchens k ON m.kitchen_id = k.id
    LEFT JOIN schools s ON m.school_id = s.id
    LEFT JOIN menu_compositions mc ON m.id = mc.menu_id
    WHERE m.id = ?
    GROUP BY m.id
  `).get(menuId);
}

export function getMenuCompositions(menuId: number, database?: Database.Database) {
  return (database ?? db()).prepare(`
    SELECT mc.id, mc.amount, mc.unit, mc.calories, mc.protein, mc.carbohydrates, mc.fat, mc.fiber,
           fi.name as food_item_name, fi.default_unit
    FROM menu_compositions mc
    JOIN food_items fi ON mc.food_item_id = fi.id
    WHERE mc.menu_id = ?
    ORDER BY fi.name
  `).all(menuId);
}

// Aspiration queries
export function getAspirationStats() {
  const total = db().prepare('SELECT COUNT(*) as count FROM aspirations').get() as { count: number };
  const pending = db().prepare('SELECT COUNT(*) as count FROM aspirations WHERE status = ?').get('pending') as { count: number };
  const inProgress = db().prepare('SELECT COUNT(*) as count FROM aspirations WHERE status = ?').get('in_progress') as { count: number };
  const completed = db().prepare('SELECT COUNT(*) as count FROM aspirations WHERE status = ?').get('completed') as { count: number };
  
  return {
    total: total.count,
    belumDitanggapi: pending.count,
    dalamProses: inProgress.count,
    selesai: completed.count,
  };
}

export function getAspirations(limit: number = 20) {
  return db().prepare(`
    SELECT id, sender_name, sender_email, category, description, photo_url,
           status, admin_response, responded_by, responded_at, created_at
    FROM aspirations
    ORDER BY created_at DESC
    LIMIT ?
  `).all(limit);
}

// Kitchen queries
export function getKitchens() {
  return db().prepare(`
    SELECT id, name, code, address, village, district, city, province, postal_code, capacity, status, slhs
    FROM mbg_kitchens
    ORDER BY name
  `).all();
}

export function getActiveKitchens() {
  return db().prepare(`
    SELECT id, name, city || ', ' || province as location
    FROM mbg_kitchens
    WHERE status = 'active'
    ORDER BY name
  `).all();
}

export function getKitchenById(id: number) {
  return db().prepare(`
    SELECT id, name, code, address, village, district, city, province, postal_code, capacity, status, slhs
    FROM mbg_kitchens
    WHERE id = ?
  `).get(id);
}

export function getKitchenFinancialSummary(kitchenId: number, year?: number, month?: number) {
  let whereClause = 'WHERE kitchen_id = ?';
  const params: (number | string)[] = [kitchenId];

  if (year) {
    whereClause += " AND strftime('%Y', transaction_date) = ?";
    params.push(String(year));
  }
  if (month) {
    whereClause += " AND strftime('%m', transaction_date) = ?";
    params.push(String(month).padStart(2, '0'));
  }

  const totalIn = db().prepare(`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM financial_transactions
    ${whereClause} AND type = 'IN'
  `).get(...params) as { total: number };

  const totalOut = db().prepare(`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM financial_transactions
    ${whereClause} AND type = 'OUT'
  `).get(...params) as { total: number };

  return {
    totalIn: totalIn.total,
    totalOut: totalOut.total,
    remaining: totalIn.total - totalOut.total,
  };
}

export function getKitchenTransactions(
  kitchenId: number,
  options: {
    page?: number;
    limit?: number;
    type?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    sort?: 'newest' | 'oldest';
  } = {}
) {
  const {
    page = 1,
    limit = 10,
    type,
    category,
    dateFrom,
    dateTo,
    sort = 'newest',
  } = options;

  let whereClause = 'WHERE t.kitchen_id = ?';
  const params: (number | string)[] = [kitchenId];

  if (type && (type === 'IN' || type === 'OUT')) {
    whereClause += ' AND t.type = ?';
    params.push(type);
  }
  if (category) {
    whereClause += ' AND t.category = ?';
    params.push(category);
  }
  if (dateFrom) {
    whereClause += ' AND t.transaction_date >= ?';
    params.push(dateFrom);
  }
  if (dateTo) {
    whereClause += ' AND t.transaction_date <= ?';
    params.push(dateTo);
  }

  const orderClause = sort === 'oldest' ? 'ASC' : 'DESC';
  const offset = (page - 1) * limit;

  const countRow = db().prepare(`
    SELECT COUNT(*) as total
    FROM financial_transactions t
    ${whereClause}
  `).get(...params) as { total: number };

  const rows = db().prepare(`
    SELECT t.id, t.type, t.category, t.title, t.amount, t.transaction_date, t.document_url
    FROM financial_transactions t
    ${whereClause}
    ORDER BY t.transaction_date ${orderClause}, t.id DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  return {
    data: rows,
    pagination: {
      page,
      limit,
      total: countRow.total,
      totalPages: Math.ceil(countRow.total / limit),
    },
  };
}

export function getTransactionDetail(transactionId: number) {
  return db().prepare(`
    SELECT t.id, t.type, t.category, t.title, t.amount, t.transaction_date,
           t.description, t.document_url,
           k.name as kitchen_name, k.city as kitchen_city, k.province as kitchen_province
    FROM financial_transactions t
    JOIN mbg_kitchens k ON t.kitchen_id = k.id
    WHERE t.id = ?
  `).get(transactionId);
}

export function getTransactionCategories(kitchenId: number) {
  return db().prepare(`
    SELECT DISTINCT category
    FROM financial_transactions
    WHERE kitchen_id = ?
    ORDER BY category
  `).all(kitchenId) as { category: string }[];
}

export function getSchoolsByKitchenId(kitchenId: number) {
  return db().prepare(`
    SELECT id, name, npsn, address, student_count, status
    FROM schools
    WHERE kitchen_id = ?
    ORDER BY name
  `).all(kitchenId);
}

// School queries
export function getSchools(kitchenId?: number) {
  let query = `
    SELECT s.id, s.name, s.npsn, s.address, s.village, s.district, s.city, s.province, s.postal_code, s.student_count, s.status,
           s.kitchen_id, k.name as kitchen_name, k.code as kitchen_code
    FROM schools s
    LEFT JOIN mbg_kitchens k ON s.kitchen_id = k.id
  `;
  
  if (kitchenId) {
    query += ' WHERE s.kitchen_id = ?';
    return db().prepare(query).all(kitchenId);
  }
  
  query += ' ORDER BY s.name';
  return db().prepare(query).all();
}

export function getSchoolById(id: number) {
  return db().prepare(`
    SELECT s.id, s.name, s.npsn, s.address, s.village, s.district, s.city, s.province, s.postal_code, s.student_count, s.status,
           s.kitchen_id, k.name as kitchen_name, k.code as kitchen_code
    FROM schools s
    LEFT JOIN mbg_kitchens k ON s.kitchen_id = k.id
    WHERE s.id = ?
  `).get(id);
}
