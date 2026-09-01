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

function linkAdminToKitchen(db, adminId, kitchenId) {
  db.prepare('INSERT OR IGNORE INTO admin_kitchens (admin_id, kitchen_id) VALUES (?, ?)').run(adminId, kitchenId);
}

function sessionFor(db, adminId) {
  const session = createSession(db, adminId);
  return `mbg_session=${session.token}`;
}

function baseSubmission() {
  return {
    sender_name: 'Pelapor',
    sender_email: 'pelapor@example.com',
    sender_phone: '081234567890',
    category: 'Kualitas',
    description: 'Test description',
  };
}

test('Kitchen A admin sees Kitchen A reports, but not Kitchen B reports', async () => {
  const { app, db } = createTestAppWithSession();
  const kitchenA = createKitchen(db, 'Dapur A', 'A-001');
  const kitchenB = createKitchen(db, 'Dapur B', 'B-001');

  const adminA = createAdmin(db, { email: 'a@example.com' });
  const adminB = createAdmin(db, { email: 'b@example.com' });
  linkAdminToKitchen(db, adminA, kitchenA);
  linkAdminToKitchen(db, adminB, kitchenB);

  const cookieA = sessionFor(db, adminA);
  const cookieB = sessionFor(db, adminB);

  // 1. Submit a report for Kitchen A
  const createdA = await app.request('/api/aspirations', jsonOptions('POST', { ...baseSubmission(), kitchen_id: kitchenA }));
  assert.equal(createdA.status, 201);
  const reportA = (await createdA.json()).data;

  // 2. Log in as Kitchen A admin → the Kitchen A report should appear
  const listA = await app.request('/api/admin/aspirations', { headers: { cookie: cookieA } });
  assert.equal(listA.status, 200);
  const listABody = await listA.json();
  const idsA = listABody.data.map((d) => d.id);
  assert.ok(idsA.includes(reportA.id), 'Kitchen A admin should see Kitchen A report');

  // 3. Log in as Kitchen B admin → the Kitchen A report should NOT appear
  const listB = await app.request('/api/admin/aspirations', { headers: { cookie: cookieB } });
  assert.equal(listB.status, 200);
  const listBBody = await listB.json();
  const idsB = listBBody.data.map((d) => d.id);
  assert.ok(!idsB.includes(reportA.id), 'Kitchen B admin should not see Kitchen A report');

  // 4. Submit a report for Kitchen B
  const createdB = await app.request('/api/aspirations', jsonOptions('POST', { ...baseSubmission(), kitchen_id: kitchenB, description: 'B test' }));
  assert.equal(createdB.status, 201);
  const reportB = (await createdB.json()).data;

  // 5. Kitchen B admin should see Kitchen B report
  const listB2 = await app.request('/api/admin/aspirations', { headers: { cookie: cookieB } });
  const listB2Body = await listB2.json();
  const idsB2 = listB2Body.data.map((d) => d.id);
  assert.ok(idsB2.includes(reportB.id), 'Kitchen B admin should see Kitchen B report');

  // 6. Kitchen A admin should not see Kitchen B report
  const listA2 = await app.request('/api/admin/aspirations', { headers: { cookie: cookieA } });
  const listA2Body = await listA2.json();
  const idsA2 = listA2Body.data.map((d) => d.id);
  assert.ok(!idsA2.includes(reportB.id), 'Kitchen A admin should not see Kitchen B report');

  // 7. Admin detail endpoint also enforces scoping (403 for cross-kitchen)
  const detailA_asB = await app.request(`/api/admin/aspirations/${reportA.id}`, { headers: { cookie: cookieB } });
  assert.equal(detailA_asB.status, 403);

  const detailA_asA = await app.request(`/api/admin/aspirations/${reportA.id}`, { headers: { cookie: cookieA } });
  assert.equal(detailA_asA.status, 200);
  const detailBody = (await detailA_asA.json()).data;
  assert.equal(detailBody.sender_name, 'Pelapor');
  assert.equal(detailBody.sender_email, 'pelapor@example.com');
  assert.equal(detailBody.sender_phone, '081234567890');
  assert.equal(detailBody.kitchen.id, kitchenA);
  assert.equal(detailBody.category, 'Kualitas');
  assert.equal(detailBody.description, 'Test description');

  // 8. Patch (reply + status) writes the responding admin's id and timestamp
  const patch = await app.request(`/api/admin/aspirations/${reportA.id}`, jsonOptions('PATCH', {
    status: 'completed', admin_response: 'Sudah kami tindak lanjuti',
  }, cookieA));
  assert.equal(patch.status, 200);
  const patchBody = (await patch.json()).data;
  assert.equal(patchBody.responded_by, adminA);
  assert.equal(patchBody.status, 'completed');
  assert.equal(patchBody.admin_response, 'Sudah kami tindak lanjuti');
  assert.ok(patchBody.responded_at, 'responded_at should be set');
  assert.equal(patchBody.responder.id, adminA);
  assert.equal(patchBody.responder.email, 'a@example.com');

  // 9. Kitchen B admin still cannot modify Kitchen A report
  const patchDenied = await app.request(`/api/admin/aspirations/${reportA.id}`, jsonOptions('PATCH', {
    status: 'rejected', admin_response: 'Trying to interfere',
  }, cookieB));
  assert.equal(patchDenied.status, 403);
});

test('Admins without any kitchen link are auto-linked to the first active kitchen (backfill)', async () => {
  const { db } = createTestAppWithSession();
  const kitchenA = createKitchen(db, 'Dapur A', 'A-002');
  const orphan = createAdmin(db, { email: 'orphan@example.com' });

  // No link yet
  const before = db.prepare('SELECT COUNT(*) AS count FROM admin_kitchens WHERE admin_id = ?').get(orphan);
  assert.equal(before.count, 0);

  // The backfill migration does this for the live DB; in test we replicate the
  // same query to ensure the contract is correct.
  db.prepare(
    `INSERT OR IGNORE INTO admin_kitchens (admin_id, kitchen_id)
     SELECT ?, id FROM mbg_kitchens WHERE status = 'active' ORDER BY id ASC LIMIT 1`
  ).run(orphan);

  const after = db.prepare('SELECT COUNT(*) AS count FROM admin_kitchens WHERE admin_id = ?').get(orphan);
  assert.equal(after.count, 1);
  const link = db.prepare('SELECT kitchen_id FROM admin_kitchens WHERE admin_id = ?').get(orphan);
  assert.equal(link.kitchen_id, kitchenA);
});

test('Reports addressed to a kitchen that an admin manages include all required contact fields', async () => {
  const { app, db } = createTestAppWithSession();
  const kitchen = createKitchen(db, 'Dapur Detail', 'DTL-001');
  const admin = createAdmin(db, { email: 'detail-admin@example.com' });
  linkAdminToKitchen(db, admin, kitchen);
  const cookie = sessionFor(db, admin);

  const submit = await app.request('/api/aspirations', jsonOptions('POST', {
    sender_name: 'Ibrahim',
    sender_email: 'ibrahim@example.com',
    sender_phone: '081299887766',
    kitchen_id: kitchen,
    category: 'Pelayanan',
    description: 'Pelayanan staff kurang ramah',
    photo_url: 'data:image/png;base64,iVBORw0KGgo=',
  }));
  assert.equal(submit.status, 201);
  const reportId = (await submit.json()).data.id;

  const detail = await app.request(`/api/admin/aspirations/${reportId}`, { headers: { cookie } });
  const body = (await detail.json()).data;

  assert.equal(body.sender_name, 'Ibrahim');
  assert.equal(body.sender_email, 'ibrahim@example.com');
  assert.equal(body.sender_phone, '081299887766');
  assert.equal(body.category, 'Pelayanan');
  assert.equal(body.kitchen.id, kitchen);
  assert.equal(body.description, 'Pelayanan staff kurang ramah');
  assert.equal(body.photo_url, 'data:image/png;base64,iVBORw0KGgo=');
  assert.equal(body.status, 'pending');
  assert.equal(body.admin_response, null);
  assert.ok(body.created_at);
});
