import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, '../../data/mbg.db');

// All locations: Gunung Samarinda, Balikpapan Utara, Balikpapan, Kalimantan Timur
const VILLAGE = 'Gunung Samarinda';
const DISTRICT = 'Balikpapan Utara';
const CITY = 'Balikpapan';
const PROVINCE = 'Kalimantan Timur';
const POSTAL_CODE = '76116';

// Kitchen data - 20 MBG kitchens/offices
const kitchenData = [
  { name: 'Dapur MBG Gunung Samarinda 01', code: 'BPP-001', address: 'Jl. Gunung Samarinda Raya No. 10', capacity: 3000, slhs: true },
  { name: 'Dapur MBG Gunung Samarinda 02', code: 'BPP-002', address: 'Jl. Gunung Samarinda Raya No. 25', capacity: 2800, slhs: true },
  { name: 'Dapur MBG Gunung Samarinda 03', code: 'BPP-003', address: 'Jl. Gunung Samarinda Dalam No. 5', capacity: 2500, slhs: false },
  { name: 'Dapur MBG Gunung Samarinda 04', code: 'BPP-004', address: 'Jl. Gunung Samarinda Dalam No. 18', capacity: 3200, slhs: true },
  { name: 'Dapur MBG Gunung Samarinda 05', code: 'BPP-005', address: 'Jl. Gunung Samarinda Raya No. 42', capacity: 2700, slhs: false },
  { name: 'Kantor MBG Balikpapan Utara 01', code: 'BPP-006', address: 'Jl. Gunung Samarinda Raya No. 88', capacity: 1500, slhs: true },
  { name: 'Kantor MBG Balikpapan Utara 02', code: 'BPP-007', address: 'Jl. Gunung Samarinda Raya No. 105', capacity: 1800, slhs: false },
  { name: 'Dapur MBG Perumahan Samarinda 01', code: 'BPP-008', address: 'Jl. Perumahan Gunung Samarinda Blok A No. 3', capacity: 2200, slhs: true },
  { name: 'Dapur MBG Perumahan Samarinda 02', code: 'BPP-009', address: 'Jl. Perumahan Gunung Samarinda Blok C No. 7', capacity: 2400, slhs: true },
  { name: 'Dapur MBG Samarinda Indah 01', code: 'BPP-010', address: 'Jl. Samarinda Indah No. 12', capacity: 2600, slhs: false },
  { name: 'Dapur MBG Samarinda Indah 02', code: 'BPP-011', address: 'Jl. Samarinda Indah No. 28', capacity: 2100, slhs: true },
  { name: 'Kantor MBG Samarinda Sejahtera', code: 'BPP-012', address: 'Jl. Samarinda Sejahtera No. 5', capacity: 1600, slhs: false },
  { name: 'Dapur MBG Samarinda Makmur 01', code: 'BPP-013', address: 'Jl. Samarinda Makmur No. 15', capacity: 2900, slhs: true },
  { name: 'Dapur MBG Samarinda Makmur 02', code: 'BPP-014', address: 'Jl. Samarinda Makmur No. 33', capacity: 2300, slhs: false },
  { name: 'Dapur MBG Samarinda Baru 01', code: 'BPP-015', address: 'Jl. Samarinda Baru No. 8', capacity: 3100, slhs: true },
  { name: 'Dapur MBG Samarinda Baru 02', code: 'BPP-016', address: 'Jl. Samarinda Baru No. 22', capacity: 2000, slhs: true },
  { name: 'Kantor MBG Samarinda Permai', code: 'BPP-017', address: 'Jl. Samarinda Permai No. 10', capacity: 1700, slhs: false },
  { name: 'Dapur MBG Samarinda Jaya 01', code: 'BPP-018', address: 'Jl. Samarinda Jaya No. 6', capacity: 2800, slhs: true },
  { name: 'Dapur MBG Samarinda Jaya 02', code: 'BPP-019', address: 'Jl. Samarinda Jaya No. 19', capacity: 2500, slhs: false },
  { name: 'Dapur MBG Samarinda Sentosa', code: 'BPP-020', address: 'Jl. Samarinda Sentosa No. 14', capacity: 2700, slhs: true },
];

// School data - 20 schools
const schoolData = [
  { kitchen_code: 'BPP-001', name: 'SDN 001 Gunung Samarinda', npsn: '60100001', address: 'Jl. Gunung Samarinda Raya No. 15', student_count: 320 },
  { kitchen_code: 'BPP-001', name: 'SDN 002 Gunung Samarinda', npsn: '60100002', address: 'Jl. Gunung Samarinda Raya No. 30', student_count: 280 },
  { kitchen_code: 'BPP-002', name: 'SDN 003 Gunung Samarinda', npsn: '60100003', address: 'Jl. Gunung Samarinda Dalam No. 8', student_count: 350 },
  { kitchen_code: 'BPP-002', name: 'SDN 004 Gunung Samarinda', npsn: '60100004', address: 'Jl. Gunung Samarinda Dalam No. 22', student_count: 410 },
  { kitchen_code: 'BPP-003', name: 'SDN 005 Gunung Samarinda', npsn: '60100005', address: 'Jl. Gunung Samarinda Raya No. 50', student_count: 290 },
  { kitchen_code: 'BPP-003', name: 'SDN 006 Gunung Samarinda', npsn: '60100006', address: 'Jl. Gunung Samarinda Raya No. 65', student_count: 370 },
  { kitchen_code: 'BPP-004', name: 'SDN 007 Gunung Samarinda', npsn: '60100007', address: 'Jl. Perumahan Gunung Samarinda Blok A No. 10', student_count: 440 },
  { kitchen_code: 'BPP-004', name: 'SDN 008 Gunung Samarinda', npsn: '60100008', address: 'Jl. Perumahan Gunung Samarinda Blok B No. 5', student_count: 310 },
  { kitchen_code: 'BPP-005', name: 'SDN 009 Gunung Samarinda', npsn: '60100009', address: 'Jl. Samarinda Indah No. 18', student_count: 260 },
  { kitchen_code: 'BPP-005', name: 'SDN 010 Gunung Samarinda', npsn: '60100010', address: 'Jl. Samarinda Indah No. 35', student_count: 330 },
  { kitchen_code: 'BPP-008', name: 'SDN 011 Gunung Samarinda', npsn: '60100011', address: 'Jl. Samarinda Sejahtera No. 12', student_count: 380 },
  { kitchen_code: 'BPP-008', name: 'SDN 012 Gunung Samarinda', npsn: '60100012', address: 'Jl. Samarinda Sejahtera No. 28', student_count: 300 },
  { kitchen_code: 'BPP-009', name: 'SDN 013 Gunung Samarinda', npsn: '60100013', address: 'Jl. Samarinda Makmur No. 10', student_count: 420 },
  { kitchen_code: 'BPP-009', name: 'SDN 014 Gunung Samarinda', npsn: '60100014', address: 'Jl. Samarinda Makmur No. 25', student_count: 350 },
  { kitchen_code: 'BPP-010', name: 'SDN 015 Gunung Samarinda', npsn: '60100015', address: 'Jl. Samarinda Baru No. 12', student_count: 290 },
  { kitchen_code: 'BPP-010', name: 'SDN 016 Gunung Samarinda', npsn: '60100016', address: 'Jl. Samarinda Baru No. 30', student_count: 360 },
  { kitchen_code: 'BPP-013', name: 'SDN 017 Gunung Samarinda', npsn: '60100017', address: 'Jl. Samarinda Permai No. 15', student_count: 400 },
  { kitchen_code: 'BPP-013', name: 'SDN 018 Gunung Samarinda', npsn: '60100018', address: 'Jl. Samarinda Jaya No. 8', student_count: 340 },
  { kitchen_code: 'BPP-015', name: 'SDN 019 Gunung Samarinda', npsn: '60100019', address: 'Jl. Samarinda Jaya No. 25', student_count: 270 },
  { kitchen_code: 'BPP-015', name: 'SDN 020 Gunung Samarinda', npsn: '60100020', address: 'Jl. Samarinda Sentosa No. 20', student_count: 310 },
];

export function seedKitchensAndSchools(): void {
  console.log('Seeding kitchens and schools...');

  const db = new Database(DB_PATH);

  // Check if kitchens already exist
  const kitchenCount = db.prepare('SELECT COUNT(*) as count FROM mbg_kitchens').get() as { count: number };

  if (kitchenCount.count === 0) {
    console.log('Seeding kitchen data...');
    const insertKitchen = db.prepare(`
      INSERT INTO mbg_kitchens (name, code, address, village, district, city, province, postal_code, capacity, status, slhs)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
    `);

    for (const kitchen of kitchenData) {
      insertKitchen.run(kitchen.name, kitchen.code, kitchen.address, VILLAGE, DISTRICT, CITY, PROVINCE, POSTAL_CODE, kitchen.capacity, kitchen.slhs ? 1 : 0);
    }

    console.log(`✓ ${kitchenData.length} kitchens seeded`);
  } else {
    console.log(`Kitchen data already exists (${kitchenCount.count} items), skipping...`);
  }

  // Check if schools already exist
  const schoolCount = db.prepare('SELECT COUNT(*) as count FROM schools').get() as { count: number };

  if (schoolCount.count === 0) {
    console.log('Seeding school data...');
    const insertSchool = db.prepare(`
      INSERT INTO schools (kitchen_id, name, npsn, address, village, district, city, province, postal_code, student_count, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `);

    for (const school of schoolData) {
      const kitchen = db.prepare('SELECT id FROM mbg_kitchens WHERE code = ?').get(school.kitchen_code) as { id: number };

      insertSchool.run(kitchen.id, school.name, school.npsn, school.address, VILLAGE, DISTRICT, CITY, PROVINCE, POSTAL_CODE, school.student_count);
    }

    console.log(`✓ ${schoolData.length} schools seeded`);
  } else {
    console.log(`School data already exists (${schoolCount.count} items), skipping...`);
  }

  db.close();
  console.log('Kitchens and schools seed completed!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedKitchensAndSchools();
}
