import test from 'node:test';
import assert from 'node:assert/strict';
import { createTestApp, createTestAppWithSession } from '../helpers/test-app.mjs';

test('unauthenticated browser requests cannot render admin pages', async (t) => {
  const { app, db } = createTestApp();
  t.after(() => db.close());

  const response = await app.request('/admin/menu');

  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), '/login?next=%2Fadmin%2Fmenu');
});

test('unauthenticated API requests receive a JSON 401', async (t) => {
  const { app, db } = createTestApp();
  t.after(() => db.close());

  const response = await app.request('/api/auth/me');

  assert.equal(response.status, 401);
  assert.match(response.headers.get('content-type') ?? '', /application\/json/);
  assert.equal(typeof (await response.json()).message, 'string');
});

test('an authenticated admin can access a protected page and /api/auth/me', async (t) => {
  const { app, db, sessionCookie } = createTestAppWithSession({ role: 'admin', status: 'active' });
  t.after(() => db.close());

  const page = await app.request('/admin', { headers: { cookie: sessionCookie } });
  assert.equal(page.status, 200);

  const me = await app.request('/api/auth/me', { headers: { cookie: sessionCookie } });
  assert.deepEqual(await me.json(), {
    data: { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' },
  });
});

test('all existing admin pages require an active session', async (t) => {
  const { app, db, sessionCookie } = createTestAppWithSession();
  t.after(() => db.close());

  for (const path of ['/admin', '/admin/keuangan', '/admin/keuangan/statistik', '/admin/menu', '/admin/menu/tambah', '/admin/aspirasi']) {
    const unauthorized = await app.request(path);
    assert.equal(unauthorized.status, 302, path);

    const authorized = await app.request(path, { headers: { cookie: sessionCookie } });
    assert.equal(authorized.status, 200, path);
  }
});

test('sidebar renders a POST logout form that revokes the session', async (t) => {
  const { app, db, sessionCookie } = createTestAppWithSession();
  t.after(() => db.close());

  const page = await app.request('/admin', { headers: { cookie: sessionCookie } });
  assert.match(await page.text(), /<form action="\/logout" method="post"/);

  const logout = await app.request('/logout', { method: 'POST', headers: { cookie: sessionCookie } });
  assert.equal(logout.status, 302);

  const afterLogout = await app.request('/admin', { headers: { cookie: sessionCookie } });
  assert.equal(afterLogout.status, 302);
  assert.equal(afterLogout.headers.get('location'), '/login?next=%2Fadmin');
});
