import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, '../../data/mbg.db');

// Kitchen data
const kitchenData = [
  {
    name: 'Dapur MBG Jakarta Pusat',
    code: 'JKT-001',
    address: 'Jl. Merdeka No. 10',
    village: 'Gambir',
    district: 'Gambir',
    city: 'Jakarta Pusat',
    province: 'DKI Jakarta',
    postal_code: '10110',
    capacity: 5000,
  },
  {
    name: 'Dapur MBG Jakarta Selatan',
    code: 'JKT-002',
    address: 'Jl. TB Simatupang No. 25',
    village: 'Cilandak',
    district: 'Cilandak',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    postal_code: '12430',
    capacity: 4500,
  },
  {
    name: 'Dapur MBG Bandung Kota',
    code: 'BDG-001',
    address: 'Jl. Asia Afrika No. 50',
    village: 'Kebon Pisang',
    district: 'Sumur Bandung',
    city: 'Bandung',
    province: 'Jawa Barat',
    postal_code: '40111',
    capacity: 3500,
  },
];

// School data
const schoolData = [
  // Schools for Jakarta Pusat kitchen
  {
    kitchen_code: 'JKT-001',
    name: 'SDN 01 Gambir',
    npsn: '20100001',
    address: 'Jl. Gambir Raya No. 5',
    village: 'Gambir',
    district: 'Gambir',
    city: 'Jakarta Pusat',
    province: 'DKI Jakarta',
    postal_code: '10110',
    student_count: 450,
  },
  {
    kitchen_code: 'JKT-001',
    name: 'SDN 02 Gambir',
    npsn: '20100002',
    address: 'Jl. Gambir Raya No. 12',
    village: 'Gambir',
    district: 'Gambir',
    city: 'Jakarta Pusat',
    province: 'DKI Jakarta',
    postal_code: '10110',
    student_count: 380,
  },
  {
    kitchen_code: 'JKT-001',
    name: 'SDN 03 Menteng',
    npsn: '20100003',
    address: 'Jl. Menteng Raya No. 8',
    village: 'Menteng',
    district: 'Menteng',
    city: 'Jakarta Pusat',
    province: 'DKI Jakarta',
    postal_code: '10310',
    student_count: 520,
  },
  {
    kitchen_code: 'JKT-001',
    name: 'SDN 01 Tanah Abang',
    npsn: '20100004',
    address: 'Jl. Tanah Abang No. 15',
    village: 'Bendungan Hilir',
    district: 'Tanah Abang',
    city: 'Jakarta Pusat',
    province: 'DKI Jakarta',
    postal_code: '10210',
    student_count: 410,
  },
  // Schools for Jakarta Selatan kitchen
  {
    kitchen_code: 'JKT-002',
    name: 'SDN 01 Cilandak',
    npsn: '20200001',
    address: 'Jl. Cilandak Raya No. 20',
    village: 'Cilandak',
    district: 'Cilandak',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    postal_code: '12430',
    student_count: 550,
  },
  {
    kitchen_code: 'JKT-002',
    name: 'SDN 02 Cilandak',
    npsn: '20200002',
    address: 'Jl. Cilandak Raya No. 35',
    village: 'Cilandak',
    district: 'Cilandak',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    postal_code: '12430',
    student_count: 480,
  },
  {
    kitchen_code: 'JKT-002',
    name: 'SDN 01 Jagakarsa',
    npsn: '20200003',
    address: 'Jl. Jagakarsa Raya No. 10',
    village: 'Jagakarsa',
    district: 'Jagakarsa',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    postal_code: '12620',
    student_count: 620,
  },
  // Schools for Bandung kitchen
  {
    kitchen_code: 'BDG-001',
    name: 'SDN 01 Sumur Bandung',
    npsn: '20300001',
    address: 'Jl. Sumur Bandung No. 8',
    village: 'Kebon Pisang',
    district: 'Sumur Bandung',
    city: 'Bandung',
    province: 'Jawa Barat',
    postal_code: '40111',
    student_count: 350,
  },
  {
    kitchen_code: 'BDG-001',
    name: 'SDN 02 Sumur Bandung',
    npsn: '20300002',
    address: 'Jl. Sumur Bandung No. 15',
    village: 'Kebon Pisang',
    district: 'Sumur Bandung',
    city: 'Bandung',
    province: 'Jawa Barat',
    postal_code: '40111',
    student_count: 420,
  },
  {
    kitchen_code: 'BDG-001',
    name: 'SDN 01 Coblong',
    npsn: '20300003',
    address: 'Jl. Dago No. 12',
    village: 'Coblong',
    district: 'Coblong',
    city: 'Bandung',
    province: 'Jawa Barat',
    postal_code: '40135',
    student_count: 390,
  },
];

export function seedKitchensAndSchools(): void {
  console.log('Seeding kitchens and schools...');
  
  const db = new Database(DB_PATH);
  
  // Check if kitchens already exist
  const kitchenCount = db.prepare('SELECT COUNT(*) as count FROM mbg_kitchens').get() as { count: number };
  
  if (kitchenCount.count === 0) {
    console.log('Seeding kitchen data...');
    const insertKitchen = db.prepare(`
      INSERT INTO mbg_kitchens (name, code, address, village, district, city, province, postal_code, capacity, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `);
    
    for (const kitchen of kitchenData) {
      insertKitchen.run(kitchen.name, kitchen.code, kitchen.address, kitchen.village, kitchen.district, kitchen.city, kitchen.province, kitchen.postal_code, kitchen.capacity);
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
      // Get kitchen_id by code
      const kitchen = db.prepare('SELECT id FROM mbg_kitchens WHERE code = ?').get(school.kitchen_code) as { id: number };
      
      insertSchool.run(kitchen.id, school.name, school.npsn, school.address, school.village, school.district, school.city, school.province, school.postal_code, school.student_count);
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
