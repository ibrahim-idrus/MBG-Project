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

  const invalid = await app.request('/api/admin/menus', jsonOptions('POST', {
    name: 'Menu Salah Relasi', kitchen_id: otherKitchenId, school_id: schoolId,
    meal_type: 'lunch', menu_date: '2026-08-30', calories: 500, created_by: 9999,
  }, sessionCookie));
  assert.equal(invalid.status, 400);

  const created = await app.request('/api/admin/menus', jsonOptions('POST', {
    name: 'Nasi Ayam', kitchen_id: kitchenId, school_id: schoolId,
    meal_type: 'lunch', menu_date: '2026-08-30', composition: 'Nasi, ayam, sayur',
    calories: 500, protein: 25, carbohydrates: 60, fat: 15, fiber: 5, created_by: 9999,
  }, sessionCookie));
  assert.equal(created.status, 201);
  const createdBody = await created.json();
  assert.equal(createdBody.data.created_by, admin.id);
  assert.equal(createdBody.data.kitchen.id, kitchenId);
  assert.equal(createdBody.data.school.id, schoolId);

  const listed = await app.request('/api/admin/menus?page=1&per_page=10&search=Nasi&meal_type=lunch&kitchen_id=' + kitchenId, {
    headers: { cookie: sessionCookie },
  });
  assert.equal(listed.status, 200);
  const listBody = await listed.json();
  assert.equal(listBody.data.length, 1);
  assert.equal(listBody.pagination.total, 1);

  const menuId = createdBody.data.id;
  const updated = await app.request(`/api/admin/menus/${menuId}`, jsonOptions('PATCH', {
    name: 'Nasi Ayam Update', kitchen_id: kitchenId, school_id: schoolId,
    meal_type: 'dinner', menu_date: '2026-08-30', created_by: 123,
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

test('public aspirations never expose sender email while admin can respond from session identity', async () => {
  const { app, db, sessionCookie, admin } = createTestAppWithSession();
  const created = await app.request('/api/aspirations', jsonOptions('POST', {
    sender_name: 'Warga', sender_email: 'warga@example.com', category: 'Menu', description: 'Mohon tambah buah.',
  }));
  assert.equal(created.status, 201);
  const id = (await created.json()).data.id;

  const publicDetail = await app.request(`/api/aspirations/${id}`);
  assert.equal(publicDetail.status, 200);
  const publicBody = await publicDetail.json();
  assert.equal(publicBody.data.sender_name, 'Warga');
  assert.equal('sender_email' in publicBody.data, false);

  const response = await app.request(`/api/admin/aspirations/${id}`, jsonOptions('PATCH', {
    status: 'completed', admin_response: 'Sudah ditindaklanjuti.', responded_by: 9999,
  }, sessionCookie));
  assert.equal(response.status, 200);
  const responseBody = await response.json();
  assert.equal(responseBody.data.responded_by, admin.id);
  assert.equal(responseBody.data.status, 'completed');

  const publicList = await app.request('/api/aspirations');
  assert.equal('sender_email' in (await publicList.json()).data[0], false);
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
