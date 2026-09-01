import test from 'node:test';
import assert from 'node:assert/strict';
import { createTestAppWithSession } from '../helpers/test-app.mjs';

function jsonOptions(method, body, cookie) {
  return {
    method,
    headers: {
      'content-type': 'application/json',
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
  };
}

function addLocations(db) {
  const kitchen = db.prepare(`
    INSERT INTO mbg_kitchens (name, code, address, village, district, city, province, postal_code, capacity)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('Dapur Utama', 'DPR-001', 'Jalan Utama', 'Gambir', 'Gambir', 'Jakarta Pusat', 'DKI Jakarta', '10110', 1000);
  const otherKitchen = db.prepare(`
    INSERT INTO mbg_kitchens (name, code, address, village, district, city, province, postal_code, capacity)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('Dapur Lain', 'DPR-002', 'Jalan Lain', 'Menteng', 'Menteng', 'Jakarta Pusat', 'DKI Jakarta', '10310', 500);
  const school = db.prepare(`
    INSERT INTO schools (kitchen_id, name, npsn, address, village, district, city, province, postal_code, student_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(kitchen.lastInsertRowid, 'SDN Gambir', '10000001', 'Jalan Sekolah', 'Gambir', 'Gambir', 'Jakarta Pusat', 'DKI Jakarta', '10110', 300);
  return { kitchenId: Number(kitchen.lastInsertRowid), otherKitchenId: Number(otherKitchen.lastInsertRowid), schoolId: Number(school.lastInsertRowid) };
}

test('menu CRUD validates kitchen-school relationship and uses session admin as creator', async () => {
  const { app, db, sessionCookie, admin } = createTestAppWithSession();
  const { kitchenId, otherKitchenId, schoolId } = addLocations(db);

  // The admin must be linked to a kitchen before they can create menus.
  db.prepare('INSERT INTO admin_kitchens (admin_id, kitchen_id) VALUES (?, ?)').run(admin.id, kitchenId);

  // Seed a food item for compositions
  db.prepare(`INSERT INTO food_items (name, default_unit, calories_per_100g, protein_per_100g, carbohydrates_per_100g, fat_per_100g, fiber_per_100g) VALUES (?, ?, ?, ?, ?, ?, ?)`).run('Nasi Putih', 'g', 130, 2.7, 28.2, 0.3, 0.4);
  const foodItemId = db.prepare('SELECT id FROM food_items WHERE name = ?').get('Nasi Putih').id;

  // The school only belongs to the first kitchen, so picking the school
  // against otherKitchenId (or any other kitchen) must fail validation.
  const unexpected = db.prepare(`
    INSERT INTO schools (kitchen_id, name, npsn, address, village, district, city, province, postal_code, student_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(otherKitchenId, 'SDN Other', '10000099', 'Jalan', 'V', 'D', 'C', 'P', '00000', 1);
  const otherSchoolId = Number(unexpected.lastInsertRowid);

  const invalid = await app.request('/api/admin/menus', jsonOptions('POST', {
    name: 'Menu Salah Relasi', school_id: otherSchoolId,
    meal_type: 'lunch', menu_date: '2026-08-30', compositions: [{ food_item_id: foodItemId, amount: 150, unit: 'g' }],
  }, sessionCookie));
  assert.equal(invalid.status, 400);

  const created = await app.request('/api/admin/menus', jsonOptions('POST', {
    name: 'Nasi Ayam', school_id: schoolId,
    meal_type: 'lunch', menu_date: '2026-08-30', description: 'Nasi ayam lezat',
    compositions: [{ food_item_id: foodItemId, amount: 150, unit: 'g' }],
  }, sessionCookie));
  assert.equal(created.status, 201);
  const createdBody = await created.json();
  assert.equal(createdBody.data.created_by, admin.id);
  assert.equal(createdBody.data.kitchen.id, kitchenId);
  assert.equal(createdBody.data.school.id, schoolId);
  assert.ok(Array.isArray(createdBody.data.compositions));
  assert.equal(createdBody.data.compositions.length, 1);

  const listed = await app.request('/api/admin/menus?page=1&per_page=10&search=Nasi&meal_type=lunch&kitchen_id=' + kitchenId, {
    headers: { cookie: sessionCookie },
  });
  assert.equal(listed.status, 200);
  const listBody = await listed.json();
  assert.equal(listBody.data.length, 1);
  assert.equal(listBody.pagination.total, 1);

  const menuId = createdBody.data.id;
  const updated = await app.request(`/api/admin/menus/${menuId}`, jsonOptions('PATCH', {
    name: 'Nasi Ayam Update', school_id: schoolId,
    meal_type: 'dinner', menu_date: '2026-08-30',
  }, sessionCookie));
  assert.equal(updated.status, 400);

  const deleted = await app.request(`/api/admin/menus/${menuId}`, { method: 'DELETE', headers: { cookie: sessionCookie } });
  assert.equal(deleted.status, 200);
  const missing = await app.request(`/api/admin/menus/${menuId}`, { headers: { cookie: sessionCookie } });
  assert.equal(missing.status, 404);
});

test('finance CRUD and statistics aggregate in SQLite with year and kitchen filters', async () => {
  const { app, db, sessionCookie } = createTestAppWithSession();
  const { kitchenId, otherKitchenId } = addLocations(db);

  for (const tx of [
    { kitchen_id: kitchenId, type: 'IN', category: 'Dana', title: 'Dana Januari', amount: 1000, transaction_date: '2026-01-10' },
    { kitchen_id: kitchenId, type: 'OUT', category: 'Bahan', title: 'Belanja Januari', amount: 300, transaction_date: '2026-01-11' },
    { kitchen_id: kitchenId, type: 'OUT', category: 'Gaji', title: 'Gaji Februari', amount: 200, transaction_date: '2026-02-11' },
    { kitchen_id: otherKitchenId, type: 'IN', category: 'Dana', title: 'Dana Lain', amount: 9000, transaction_date: '2025-01-11' },
  ]) {
    const response = await app.request('/api/admin/finance/transactions', jsonOptions('POST', { ...tx, created_by: 999 }, sessionCookie));
    assert.equal(response.status, 201);
  }

  const stats = await app.request(`/api/admin/finance/statistics?year=2026&kitchen_id=${kitchenId}`, { headers: { cookie: sessionCookie } });
  assert.equal(stats.status, 200);
  const statsBody = await stats.json();
  assert.deepEqual(statsBody.data.summary, { total_income: 1000, total_expenses: 500, balance: 500 });
  assert.equal(statsBody.data.monthly.length, 12);
  assert.deepEqual(statsBody.data.monthly[0], { month: 1, income: 1000, expenses: 300 });
  assert.deepEqual(statsBody.data.monthly[1], { month: 2, income: 0, expenses: 200 });
  assert.equal(statsBody.data.monthly[11].income, 0);
  assert.deepEqual(statsBody.data.expense_by_category, [
    { category: 'Bahan', total: 300 }, { category: 'Gaji', total: 200 },
  ]);
  assert.equal(statsBody.data.recent_transactions.length, 3);

  const listed = await app.request('/api/admin/finance/transactions?type=OUT&sort=amount_desc', { headers: { cookie: sessionCookie } });
  const listBody = await listed.json();
  assert.equal(listBody.data.length, 2);
  assert.equal(listBody.data[0].amount, 300);
});

test('admin API returns JSON 401 without a session', async () => {
  const { app } = createTestAppWithSession();
  const response = await app.request('/api/admin/menus', { headers: { accept: 'application/json' } });
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { message: 'Unauthorized' });
});

test('public submissions require full contact info and are scoped by kitchen while admins can respond from session identity', async () => {
  const { app, db, sessionCookie, admin } = createTestAppWithSession();
  const { kitchenId } = addLocations(db);
  // Link the admin to the test kitchen so they can manage reports addressed to it
  db.prepare('INSERT INTO admin_kitchens (admin_id, kitchen_id) VALUES (?, ?)').run(admin.id, kitchenId);

  const invalid = await app.request('/api/aspirations', jsonOptions('POST', {
    sender_name: 'Warga', category: 'Menu', description: 'Mohon tambah buah.',
  }));
  assert.equal(invalid.status, 400);
  const invalidBody = await invalid.json();
  assert.ok(invalidBody.errors.sender_phone);
  assert.ok(invalidBody.errors.kitchen_id);

  const created = await app.request('/api/aspirations', jsonOptions('POST', {
    sender_name: 'Warga',
    sender_email: 'warga@example.com',
    sender_phone: '081234567890',
    kitchen_id: kitchenId,
    category: 'Menu',
    description: 'Mohon tambah buah.',
  }));
  assert.equal(created.status, 201);
  const id = (await created.json()).data.id;

  // Public users must not be able to read or list feedback after submission
  const publicDetail = await app.request(`/api/aspirations/${id}`);
  assert.equal(publicDetail.status, 404);
  const publicList = await app.request('/api/aspirations');
  assert.equal(publicList.status, 404);

  const response = await app.request(`/api/admin/aspirations/${id}`, jsonOptions('PATCH', {
    status: 'completed', admin_response: 'Sudah ditindaklanjuti.', responded_by: 9999,
  }, sessionCookie));
  assert.equal(response.status, 200);
  const responseBody = await response.json();
  assert.equal(responseBody.data.responded_by, admin.id);
  assert.equal(responseBody.data.status, 'completed');
  assert.equal(responseBody.data.admin_response, 'Sudah ditindaklanjuti.');
  assert.equal(responseBody.data.kitchen.id, kitchenId);

  // Admin must see sender contact info they need to follow up
  const adminDetail = await app.request(`/api/admin/aspirations/${id}`, { headers: { cookie: sessionCookie } });
  const adminBody = await adminDetail.json();
  assert.equal(adminBody.data.sender_email, 'warga@example.com');
  assert.equal(adminBody.data.sender_phone, '081234567890');
  assert.equal(db.prepare('SELECT responded_by FROM aspirations WHERE id = ?').get(id).responded_by, admin.id);
});

test('kitchen and school CRUD enforces school kitchen foreign key', async () => {
  const { app, db, sessionCookie } = createTestAppWithSession();
  const createdKitchen = await app.request('/api/admin/kitchens', jsonOptions('POST', {
    name: 'Dapur Baru', code: 'NEW-001', address: 'Alamat', village: 'Desa', district: 'Kecamatan', city: 'Kota', province: 'Provinsi', postal_code: '12345', capacity: 200,
  }, sessionCookie));
  assert.equal(createdKitchen.status, 201);
  const kitchenId = (await createdKitchen.json()).data.id;

  const invalidSchool = await app.request('/api/admin/schools', jsonOptions('POST', {
    kitchen_id: 99999, name: 'Sekolah', npsn: '99999999', address: 'Alamat', village: 'Desa', district: 'Kecamatan', city: 'Kota', province: 'Provinsi', postal_code: '12345', student_count: 20,
  }, sessionCookie));
  assert.equal(invalidSchool.status, 400);

  const createdSchool = await app.request('/api/admin/schools', jsonOptions('POST', {
    kitchen_id: kitchenId, name: 'Sekolah Baru', npsn: '99999999', address: 'Alamat', village: 'Desa', district: 'Kecamatan', city: 'Kota', province: 'Provinsi', postal_code: '12345', student_count: 20,
  }, sessionCookie));
  assert.equal(createdSchool.status, 201);
  const schoolId = (await createdSchool.json()).data.id;
  const detail = await app.request(`/api/admin/kitchens/${kitchenId}`, { headers: { cookie: sessionCookie } });
  assert.equal((await detail.json()).data.schools.length, 1);

  const deletedKitchen = await app.request(`/api/admin/kitchens/${kitchenId}`, { method: 'DELETE', headers: { cookie: sessionCookie } });
  assert.equal(deletedKitchen.status, 409);
  const deletedSchool = await app.request(`/api/admin/schools/${schoolId}`, { method: 'DELETE', headers: { cookie: sessionCookie } });
  assert.equal(deletedSchool.status, 200);
  const deletedKitchenAfter = await app.request(`/api/admin/kitchens/${kitchenId}`, { method: 'DELETE', headers: { cookie: sessionCookie } });
  assert.equal(deletedKitchenAfter.status, 200);
  assert.equal(db.prepare('SELECT COUNT(*) AS count FROM schools WHERE id = ?').get(schoolId).count, 0);
});
