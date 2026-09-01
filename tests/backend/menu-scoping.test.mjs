import test from 'node:test';
import assert from 'node:assert/strict';
import { createTestAppWithSession } from '../helpers/test-app.mjs';
import { createSession } from '../../dist/auth/session.js';

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

function createAdmin(db, overrides = {}) {
  const admin = {
    name: 'Admin',
    email: `admin-${Math.random().toString(36).slice(2)}@example.com`,
    password_hash: 'test-password-hash',
    role: 'admin',
    status: 'active',
    ...overrides,
  };
  const result = db.prepare(`
    INSERT INTO admins (name, email, password_hash, role, status)
    VALUES (?, ?, ?, ?, ?)
  `).run(admin.name, admin.email, admin.password_hash, admin.role, admin.status);
  return Number(result.lastInsertRowid);
}

function createKitchen(db, name, code) {
  const result = db.prepare(`
    INSERT INTO mbg_kitchens (name, code, address, village, district, city, province, postal_code, capacity)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, code, 'Jl. Test', 'Village', 'District', 'City', 'Province', '12345', 1000);
  return Number(result.lastInsertRowid);
}

function createSchool(db, kitchenId, name, npsnSuffix) {
  const result = db.prepare(`
    INSERT INTO schools (kitchen_id, name, npsn, address, village, district, city, province, postal_code, student_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(kitchenId, name, `7000000${npsnSuffix}`, 'Jl. Sekolah', 'Village', 'District', 'City', 'Province', '12345', 200);
  return Number(result.lastInsertRowid);
}

function createFoodItem(db, name, suffix) {
  const result = db.prepare(`
    INSERT INTO food_items (name, default_unit, calories_per_100g, protein_per_100g, carbohydrates_per_100g, fat_per_100g, fiber_per_100g)
    VALUES (?, 'g', ?, ?, ?, ?, ?)
  `).run(name + suffix, 100 + suffix, 5, 10, 2, 1);
  return Number(result.lastInsertRowid);
}

function linkAdminToKitchen(db, adminId, kitchenId) {
  db.prepare('INSERT OR IGNORE INTO admin_kitchens (admin_id, kitchen_id) VALUES (?, ?)').run(adminId, kitchenId);
}

function sessionFor(db, adminId) {
  const session = createSession(db, adminId);
  return `mbg_session=${session.token}`;
}

function fixture(db) {
  // Kitchen A and Kitchen B, each with one school, plus four food items.
  const kitchenA = createKitchen(db, 'Kitchen A', 'A-100');
  const kitchenB = createKitchen(db, 'Kitchen B', 'B-100');
  const schoolA = createSchool(db, kitchenA, 'SDN A', '1');
  const schoolB = createSchool(db, kitchenB, 'SDN B', '2');
  const items = [
    createFoodItem(db, 'Nasi', 1),
    createFoodItem(db, 'Ayam', 2),
    createFoodItem(db, 'Sayur', 3),
    createFoodItem(db, 'Buah', 4),
  ];
  return { kitchenA, kitchenB, schoolA, schoolB, items };
}

// 1 + 2 + 3: Admin login → linked kitchen → create menu → kitchen_id inherited
test('Admin login → admin_kitchens link → create menu → backend records the admin kitchen', async () => {
  const { app, db, sessionCookie, admin } = createTestAppWithSession();
  const { kitchenA, schoolA, items } = fixture(db);
  linkAdminToKitchen(db, admin.id, kitchenA);

  const res = await app.request('/api/admin/menus', jsonOptions('POST', {
    name: 'Ayam Goreng',
    school_id: schoolA,
    meal_type: 'lunch',
    menu_date: '2026-09-02',
    compositions: items.map((foodId, idx) => ({ food_item_id: foodId, amount: 100 + idx, unit: 'g' })),
  }, sessionCookie));
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.data.created_by, admin.id);
  assert.equal(body.data.kitchen.id, kitchenA, 'menu inherits the admin kitchen');
  assert.equal(body.data.compositions.length, 4);
});

// 4 + 5 + 6: Add 4 items, all remain present after submit and after reload.
test('Menu created with 4 compositions keeps all 4 after submit and after reload', async () => {
  const { app, db, sessionCookie, admin } = createTestAppWithSession();
  const { kitchenA, schoolA, items } = fixture(db);
  linkAdminToKitchen(db, admin.id, kitchenA);

  const create = await app.request('/api/admin/menus', jsonOptions('POST', {
    name: '4 Komponen',
    school_id: schoolA,
    meal_type: 'lunch',
    menu_date: '2026-09-02',
    compositions: items.map((foodId) => ({ food_item_id: foodId, amount: 100, unit: 'g' })),
  }, sessionCookie));
  assert.equal(create.status, 201);
  const menuId = (await create.json()).data.id;

  // Reload the menu detail to make sure all four compositions are persisted.
  const detail = await app.request(`/api/admin/menus/${menuId}`, { headers: { cookie: sessionCookie } });
  assert.equal(detail.status, 200);
  const detailBody = await detail.json();
  assert.equal(detailBody.data.compositions.length, 4);
  const foodIds = detailBody.data.compositions.map((c) => c.food_item_id).sort();
  assert.deepEqual(foodIds, items.slice().sort());
});

// 7: Edit menu → can add/remove compositions without deleting the others.
test('Editing a menu only replaces compositions when the body includes the array', async () => {
  const { app, db, sessionCookie, admin } = createTestAppWithSession();
  const { kitchenA, schoolA, items } = fixture(db);
  linkAdminToKitchen(db, admin.id, kitchenA);

  const create = await app.request('/api/admin/menus', jsonOptions('POST', {
    name: 'Editable',
    school_id: schoolA,
    meal_type: 'lunch',
    menu_date: '2026-09-02',
    compositions: items.map((foodId) => ({ food_item_id: foodId, amount: 100, unit: 'g' })),
  }, sessionCookie));
  assert.equal(create.status, 201);
  const menuId = (await create.json()).data.id;

  // PATCH without compositions should not touch the composition rows at all.
  const noComp = await app.request(`/api/admin/menus/${menuId}`, jsonOptions('PATCH', {
    name: 'Editable (renamed)',
    school_id: schoolA,
    meal_type: 'snack',
    menu_date: '2026-09-02',
  }, sessionCookie));
  assert.equal(noComp.status, 200);
  const afterRename = await app.request(`/api/admin/menus/${menuId}`, { headers: { cookie: sessionCookie } });
  const afterRenameBody = await afterRename.json();
  assert.equal(afterRenameBody.data.name, 'Editable (renamed)');
  assert.equal(afterRenameBody.data.compositions.length, 4, 'compositions survive a rename');

  // PATCH with a composition array of length 2 should fully replace.
  const reduce = await app.request(`/api/admin/menus/${menuId}`, jsonOptions('PATCH', {
    name: 'Editable',
    school_id: schoolA,
    meal_type: 'snack',
    menu_date: '2026-09-02',
    compositions: [
      { food_item_id: items[0], amount: 80, unit: 'g' },
      { food_item_id: items[2], amount: 60, unit: 'g' },
    ],
  }, sessionCookie));
  assert.equal(reduce.status, 200);
  const afterReduce = await app.request(`/api/admin/menus/${menuId}`, { headers: { cookie: sessionCookie } });
  const afterReduceBody = await afterReduce.json();
  assert.equal(afterReduceBody.data.compositions.length, 2);
  const remainingFoodIds = afterReduceBody.data.compositions.map((c) => c.food_item_id).sort();
  assert.deepEqual(remainingFoodIds, [items[0], items[2]].sort());

  // Adding items back via PATCH should preserve both old and new entries.
  const expand = await app.request(`/api/admin/menus/${menuId}`, jsonOptions('PATCH', {
    name: 'Editable',
    school_id: schoolA,
    meal_type: 'snack',
    menu_date: '2026-09-02',
    compositions: [
      { food_item_id: items[0], amount: 80, unit: 'g' },
      { food_item_id: items[1], amount: 50, unit: 'g' },
      { food_item_id: items[2], amount: 60, unit: 'g' },
      { food_item_id: items[3], amount: 30, unit: 'g' },
    ],
  }, sessionCookie));
  assert.equal(expand.status, 200);
  const afterExpand = await app.request(`/api/admin/menus/${menuId}`, { headers: { cookie: sessionCookie } });
  const afterExpandBody = await afterExpand.json();
  assert.equal(afterExpandBody.data.compositions.length, 4);
});

// 8: Admin cannot create a menu in a kitchen they don't belong to.
test('Admin cannot create a menu for a kitchen they are not linked to', async () => {
  const { app, db } = createTestAppWithSession();
  const { kitchenA, kitchenB, schoolA, schoolB, items } = fixture(db);
  // Two separate admins, each linked to a single kitchen.
  const adminA = createAdmin(db, { email: 'a@x.com' });
  linkAdminToKitchen(db, adminA, kitchenA);
  const cookieA = sessionFor(db, adminA);

  // Admin A tries to use Kitchen B's school — must fail (school belongs to B).
  const wrongSchool = await app.request('/api/admin/menus', jsonOptions('POST', {
    name: 'Hijack',
    school_id: schoolB,
    meal_type: 'lunch',
    menu_date: '2026-09-02',
    compositions: [{ food_item_id: items[0], amount: 100, unit: 'g' }],
  }, cookieA));
  assert.equal(wrongSchool.status, 400);

  // Even if Admin A tries to override the kitchen via the body, the backend
  // must reject it because Admin A is not linked to Kitchen B.
  const smuggle = await app.request('/api/admin/menus', jsonOptions('POST', {
    name: 'Smuggle',
    kitchen_id: kitchenB,
    school_id: schoolA,
    meal_type: 'lunch',
    menu_date: '2026-09-02',
    compositions: [{ food_item_id: items[0], amount: 100, unit: 'g' }],
  }, cookieA));
  assert.equal(smuggle.status, 400, 'cross-kitchen kitchen_id is rejected');

  // When Admin A specifies their own linked kitchen, it should succeed.
  const ownKitchen = await app.request('/api/admin/menus', jsonOptions('POST', {
    name: 'Own Kitchen',
    kitchen_id: kitchenA,
    school_id: schoolA,
    meal_type: 'lunch',
    menu_date: '2026-09-02',
    compositions: [{ food_item_id: items[0], amount: 100, unit: 'g' }],
  }, cookieA));
  assert.equal(ownKitchen.status, 201);
  const ownKitchenBody = await ownKitchen.json();
  assert.equal(ownKitchenBody.data.kitchen.id, kitchenA, 'backend uses the requested linked kitchen');

  // Cross-kitchen edit/delete is rejected.
  // Create a menu as a brand-new admin linked to kitchenB then try to edit
  // it with Admin A.
  const adminB = createAdmin(db, { email: 'b@x.com' });
  linkAdminToKitchen(db, adminB, kitchenB);
  const cookieB = sessionFor(db, adminB);
  const other = await app.request('/api/admin/menus', jsonOptions('POST', {
    name: 'Belongs to B',
    school_id: schoolB,
    meal_type: 'lunch',
    menu_date: '2026-09-02',
    compositions: [{ food_item_id: items[0], amount: 100, unit: 'g' }],
  }, cookieB));
  assert.equal(other.status, 201);
  const otherMenuId = (await other.json()).data.id;

  const editDenied = await app.request(`/api/admin/menus/${otherMenuId}`, jsonOptions('PATCH', {
    name: 'Hijacked by A',
    school_id: schoolB,
    meal_type: 'lunch',
    menu_date: '2026-09-02',
  }, cookieA));
  assert.equal(editDenied.status, 403);

  const deleteDenied = await app.request(`/api/admin/menus/${otherMenuId}`, { method: 'DELETE', headers: { cookie: cookieA } });
  assert.equal(deleteDenied.status, 403);
});

// 9 + 10 + 11: Public user menu filtering — Kitchen A, Kitchen B, School A.
test('Public /api/menus filters by kitchen or school — no implicit cross-location leak', async () => {
  const { app, db } = createTestAppWithSession();
  const { kitchenA, kitchenB, schoolA, schoolB, items } = fixture(db);
  // Two separate admins, each linked to a single kitchen. This is the
  // realistic model: one admin per kitchen so the resolveAdminKitchen
  // check has unambiguous input.
  const adminA = createAdmin(db, { email: 'filter-a@x.com' });
  const adminB = createAdmin(db, { email: 'filter-b@x.com' });
  linkAdminToKitchen(db, adminA, kitchenA);
  linkAdminToKitchen(db, adminB, kitchenB);
  const cookieA = sessionFor(db, adminA);
  const cookieB = sessionFor(db, adminB);

  // Seed two menus, one per kitchen.
  const menuA = await app.request('/api/admin/menus', jsonOptions('POST', {
    name: 'Menu Kitchen A',
    school_id: schoolA,
    meal_type: 'lunch',
    menu_date: '2026-09-03',
    compositions: [{ food_item_id: items[0], amount: 100, unit: 'g' }],
  }, cookieA));
  assert.equal(menuA.status, 201);
  const menuB = await app.request('/api/admin/menus', jsonOptions('POST', {
    name: 'Menu Kitchen B',
    school_id: schoolB,
    meal_type: 'lunch',
    menu_date: '2026-09-03',
    compositions: [{ food_item_id: items[1], amount: 100, unit: 'g' }],
  }, cookieB));
  assert.equal(menuB.status, 201);
  const menuAId = (await menuA.json()).data.id;
  const menuBId = (await menuB.json()).data.id;

  // A request with no kitchen/school context must NOT return anything.
  const noContext = await app.request('/api/menus?date=2026-09-03');
  assert.equal(noContext.status, 400);

  // Kitchen A → only Menu A.
  const kitchenAFetch = await app.request('/api/menus?date=2026-09-03&kitchen_id=' + kitchenA);
  assert.equal(kitchenAFetch.status, 200);
  const kitchenABody = await kitchenAFetch.json();
  const kitchenAIds = kitchenABody.data.map((d) => d.id);
  assert.ok(kitchenAIds.includes(menuAId));
  assert.ok(!kitchenAIds.includes(menuBId));

  // Kitchen B → only Menu B.
  const kitchenBFetch = await app.request('/api/menus?date=2026-09-03&kitchen_id=' + kitchenB);
  assert.equal(kitchenBFetch.status, 200);
  const kitchenBBody = await kitchenBFetch.json();
  const kitchenBIds = kitchenBBody.data.map((d) => d.id);
  assert.ok(kitchenBIds.includes(menuBId));
  assert.ok(!kitchenBIds.includes(menuAId));

  // School A → only the menu tied to school A.
  const schoolAFetch = await app.request('/api/menus?date=2026-09-03&school_id=' + schoolA);
  assert.equal(schoolAFetch.status, 200);
  const schoolABody = await schoolAFetch.json();
  const schoolAIds = schoolABody.data.map((d) => d.id);
  assert.ok(schoolAIds.includes(menuAId));
  assert.ok(!schoolAIds.includes(menuBId));
});

// Bonus: a menu save is atomic — if any composition row fails, no menu row stays.
test('Menu create rolls back atomically when a composition references an unknown food item', async () => {
  const { app, db, sessionCookie, admin } = createTestAppWithSession();
  const { kitchenA, schoolA, items } = fixture(db);
  linkAdminToKitchen(db, admin.id, kitchenA);

  const before = db.prepare('SELECT COUNT(*) AS count FROM menus').get().count;
  const bad = await app.request('/api/admin/menus', jsonOptions('POST', {
    name: 'Atomic Test',
    school_id: schoolA,
    meal_type: 'lunch',
    menu_date: '2026-09-04',
    compositions: [
      { food_item_id: items[0], amount: 100, unit: 'g' },
      { food_item_id: 999999, amount: 100, unit: 'g' }, // does not exist
    ],
  }, sessionCookie));
  assert.equal(bad.status, 400);
  const after = db.prepare('SELECT COUNT(*) AS count FROM menus').get().count;
  assert.equal(after, before, 'no partial menu row left behind');
});
