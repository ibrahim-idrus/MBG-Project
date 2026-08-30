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
  const avgCalories = db().prepare('SELECT COALESCE(AVG(calories), 0) as avg FROM menus WHERE calories IS NOT NULL').get() as { avg: number };
  const avgProtein = db().prepare('SELECT COALESCE(AVG(protein), 0) as avg FROM menus WHERE protein IS NOT NULL').get() as { avg: number };
  
  return {
    totalMenus: totalMenus.count,
    avgCalories: Math.round(avgCalories.avg),
    avgProtein: Math.round(avgProtein.avg),
  };
}

export function getMenusByDate(date: string) {
  return db().prepare(`
    SELECT m.id, m.name, m.meal_type, m.description, m.composition, m.photo_url,
           m.calories, m.protein, m.carbohydrates, m.fat, m.fiber,
           k.name as kitchen_name, s.name as school_name
    FROM menus m
    LEFT JOIN mbg_kitchens k ON m.kitchen_id = k.id
    LEFT JOIN schools s ON m.school_id = s.id
    WHERE m.menu_date = ?
    ORDER BY m.meal_type
  `).all(date);
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
    SELECT id, name, code, address, village, district, city, province, postal_code, capacity, status
    FROM mbg_kitchens
    ORDER BY name
  `).all();
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
