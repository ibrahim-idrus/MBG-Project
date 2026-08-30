import type Database from 'better-sqlite3';
import { createDatabase } from './database.js';

export const dummyKitchens = [
  { name: 'Dapur MBG Jakarta Pusat', code: 'JKT-001', address: 'Jl. Merdeka No. 10', village: 'Gambir', district: 'Gambir', city: 'Jakarta Pusat', province: 'DKI Jakarta', postal_code: '10110', capacity: 5000 },
  { name: 'Dapur MBG Jakarta Selatan', code: 'JKT-002', address: 'Jl. TB Simatupang No. 25', village: 'Cilandak', district: 'Cilandak', city: 'Jakarta Selatan', province: 'DKI Jakarta', postal_code: '12430', capacity: 4500 },
  { name: 'Dapur MBG Bandung Kota', code: 'BDG-001', address: 'Jl. Asia Afrika No. 50', village: 'Kebon Pisang', district: 'Sumur Bandung', city: 'Bandung', province: 'Jawa Barat', postal_code: '40111', capacity: 3500 },
] as const;

export const dummySchools = [
  { kitchen_code: 'JKT-001', name: 'SDN 01 Gambir', npsn: '20100001', address: 'Jl. Gambir Raya No. 5', village: 'Gambir', district: 'Gambir', city: 'Jakarta Pusat', province: 'DKI Jakarta', postal_code: '10110', student_count: 450 },
  { kitchen_code: 'JKT-001', name: 'SDN 02 Gambir', npsn: '20100002', address: 'Jl. Gambir Raya No. 12', village: 'Gambir', district: 'Gambir', city: 'Jakarta Pusat', province: 'DKI Jakarta', postal_code: '10110', student_count: 380 },
  { kitchen_code: 'JKT-002', name: 'SDN 01 Cilandak', npsn: '20200001', address: 'Jl. Cilandak Raya No. 20', village: 'Cilandak', district: 'Cilandak', city: 'Jakarta Selatan', province: 'DKI Jakarta', postal_code: '12430', student_count: 550 },
  { kitchen_code: 'BDG-001', name: 'SDN 01 Sumur Bandung', npsn: '20300001', address: 'Jl. Sumur Bandung No. 8', village: 'Kebon Pisang', district: 'Sumur Bandung', city: 'Bandung', province: 'Jawa Barat', postal_code: '40111', student_count: 350 },
] as const;

export function ensureDummyMasterData(db?: Database.Database): void {
  const database = db ?? createDatabase();
  const ownsDatabase = !db;
  try {
    const insertKitchen = database.prepare('INSERT OR IGNORE INTO mbg_kitchens (name, code, address, village, district, city, province, postal_code, capacity, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, \'active\')');
    for (const item of dummyKitchens) insertKitchen.run(item.name, item.code, item.address, item.village, item.district, item.city, item.province, item.postal_code, item.capacity);
    const insertSchool = database.prepare('INSERT OR IGNORE INTO schools (kitchen_id, name, npsn, address, village, district, city, province, postal_code, student_count, status) SELECT id, ?, ?, ?, ?, ?, ?, ?, ?, ?, \'active\' FROM mbg_kitchens WHERE code = ?');
    for (const item of dummySchools) insertSchool.run(item.name, item.npsn, item.address, item.village, item.district, item.city, item.province, item.postal_code, item.student_count, item.kitchen_code);
  } finally {
    if (ownsDatabase) database.close();
  }
}
