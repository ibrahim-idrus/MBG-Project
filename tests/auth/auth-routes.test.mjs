import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { hashPassword } from '../../dist/auth/password.js';
import { createTestApp, createTestAppWithAdmin } from '../helpers/test-app.mjs';

function formBody(values) {
  return new URLSearchParams(values);
}

function formHeaders() {
  return { 'content-type': 'application/x-www-form-urlencoded' };
}

test('register creates an active admin, starts a session, and redirects to the dashboard', async (t) => {
  const { app, db } = createTestApp();
  t.after(() => db.close());

  const response = await app.request('/register', {
    method: 'POST',
    body: formBody({ name: 'New Admin', email: 'NEW@EXAMPLE.COM', password: 'password123', confirm_password: 'password123' }),
    headers: formHeaders(),
  });

  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), '/admin');
  assert.match(response.headers.get('set-cookie') ?? '', /mbg_session=/);
  assert.deepEqual(db.prepare('SELECT role, status FROM admins WHERE email = ?').get('new@example.com'), {
    role: 'admin',
    status: 'active',
  });
});

test('register maps the existing fullname field to the admin name', async (t) => {
  const { app, db } = createTestApp();
  t.after(() => db.close());

  const response = await app.request('/register', {
    method: 'POST',
    body: formBody({ fullname: '  Form Admin  ', email: 'FORM@EXAMPLE.COM', password: 'password123', confirm_password: 'password123' }),
    headers: formHeaders(),
  });

  assert.equal(response.status, 302);
  assert.deepEqual(db.prepare('SELECT name, email FROM admins').get(), {
    name: 'Form Admin',
    email: 'form@example.com',
  });
});

test('register renders validation errors without creating an account', async (t) => {
  const { app, db } = createTestApp();
  t.after(() => db.close());

  const response = await app.request('/register', {
    method: 'POST',
    body: formBody({ fullname: ' ', email: 'not-an-email', password: 'short', confirm_password: 'different' }),
    headers: formHeaders(),
  });

  assert.equal(response.status, 400);
  const body = await response.text();
  assert.match(body, /Nama wajib diisi/);
  assert.match(body, /Format email tidak valid/);
  assert.match(body, /Kata sandi minimal 8 karakter/);
  assert.match(body, /Konfirmasi kata sandi tidak cocok/);
  assert.match(body, /action="\/register"/);
  assert.equal(db.prepare('SELECT COUNT(*) AS count FROM admins').get().count, 0);
  assert.equal(response.headers.get('set-cookie'), null);
});

test('register translates duplicate email errors into a safe validation response', async (t) => {
  const { app, db } = createTestApp();
  t.after(() => db.close());

  const values = { name: 'First Admin', email: 'admin@example.com', password: 'password123', confirm_password: 'password123' };
  const first = await app.request('/register', { method: 'POST', body: formBody(values), headers: formHeaders() });
  assert.equal(first.status, 302);

  const duplicate = await app.request('/register', { method: 'POST', body: formBody(values), headers: formHeaders() });

  assert.equal(duplicate.status, 400);
  assert.match(await duplicate.text(), /Email sudah terdaftar/);
  assert.equal(db.prepare('SELECT COUNT(*) AS count FROM admins').get().count, 1);
  assert.equal(duplicate.headers.get('set-cookie'), null);
});

test('login rejects invalid credentials without revealing whether email exists', async (t) => {
  const { app, db } = createTestAppWithAdmin();
  t.after(() => db.close());

  const response = await app.request('/login', {
    method: 'POST',
    body: formBody({ email: 'admin@example.com', password: 'wrongpass' }),
    headers: formHeaders(),
  });

  assert.equal(response.status, 401);
  const body = await response.text();
  assert.match(body, /Email atau kata sandi tidak valid/);
  assert.doesNotMatch(body, /password_hash/);
  assert.match(body, /action="\/login"/);
});

test('login uses one generic error for unknown, incorrect, and inactive accounts', async (t) => {
  const cases = [
    { name: 'unknown email', email: 'missing@example.com', password: 'password123' },
    { name: 'incorrect password', email: 'admin@example.com', password: 'wrongpass' },
    { name: 'inactive account', email: 'admin@example.com', password: 'password123', status: 'inactive' },
  ];

  for (const currentCase of cases) {
    const { app, db } = createTestAppWithAdmin({ status: currentCase.status ?? 'active' });
    try {
      db.prepare('UPDATE admins SET password_hash = ? WHERE email = ?').run(await hashPassword('password123'), 'admin@example.com');
      const response = await app.request('/login', {
        method: 'POST',
        body: formBody({ email: currentCase.email, password: currentCase.password }),
        headers: formHeaders(),
      });

      assert.equal(response.status, 401, currentCase.name);
      assert.match(await response.text(), /Email atau kata sandi tidak valid/, currentCase.name);
      assert.equal(db.prepare('SELECT COUNT(*) AS count FROM auth_sessions').get().count, 0, currentCase.name);
    } finally {
      db.close();
    }
  }
});

test('login starts a session, records the login time, and redirects to a safe local path', async (t) => {
  const { app, db, admin } = createTestAppWithAdmin();
  t.after(() => db.close());
  db.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').run(await hashPassword('password123'), admin.id);

  const response = await app.request('/login', {
    method: 'POST',
    body: formBody({ email: ' ADMIN@EXAMPLE.COM ', password: 'password123', next: '/admin/menu' }),
    headers: formHeaders(),
  });

  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), '/admin/menu');
  assert.match(response.headers.get('set-cookie') ?? '', /mbg_session=/);
  assert.notEqual(db.prepare('SELECT last_login_at FROM admins WHERE id = ?').get(admin.id).last_login_at, null);
  assert.equal(db.prepare('SELECT COUNT(*) AS count FROM auth_sessions WHERE admin_id = ?').get(admin.id).count, 1);
});

test('login falls back to the dashboard for an unsafe external next path', async (t) => {
  const { app, db, admin } = createTestAppWithAdmin();
  t.after(() => db.close());
  db.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').run(await hashPassword('password123'), admin.id);

  const response = await app.request('/login', {
    method: 'POST',
    body: formBody({ email: 'admin@example.com', password: 'password123', next: 'https://evil.example' }),
    headers: formHeaders(),
  });

  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), '/admin');
});

test('auth forms post to their route endpoints', async (t) => {
  const { app, db } = createTestApp();
  t.after(() => db.close());

  const [login, register] = await Promise.all([app.request('/login'), app.request('/register')]);

  assert.match(await login.text(), /<form action="\/login" method="post"/);
  assert.match(await register.text(), /<form action="\/register" method="post"/);
});

test('logout revokes the current session and sends an expired replacement cookie', async (t) => {
  const { app, db, admin } = createTestAppWithAdmin();
  t.after(() => db.close());
  db.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').run(await hashPassword('password123'), admin.id);

  const login = await app.request('/login', {
    method: 'POST',
    body: formBody({ email: 'admin@example.com', password: 'password123' }),
    headers: formHeaders(),
  });
  const sessionCookie = login.headers.get('set-cookie');
  assert.match(sessionCookie ?? '', /mbg_session=/);
  const token = sessionCookie.match(/mbg_session=([^;]+)/)[1];

  const logout = await app.request('/logout', {
    method: 'POST',
    headers: { cookie: sessionCookie },
  });

  assert.equal(logout.status, 302);
  assert.equal(logout.headers.get('location'), '/login');
  const expiredCookie = logout.headers.get('set-cookie') ?? '';
  assert.match(expiredCookie, /mbg_session=;/);
  assert.match(expiredCookie, /Expires=Thu, 01 Jan 1970 00:00:00 GMT/);
  const tokenHash = createHash('sha256').update(token).digest('hex');
  assert.notEqual(db.prepare('SELECT revoked_at FROM auth_sessions WHERE token_hash = ?').get(tokenHash).revoked_at, null);
});

test('auth cookies are HTTP-only, lax, rooted, and secure only over HTTPS', async (t) => {
  const { app, db } = createTestApp();
  t.after(() => db.close());

  const httpResponse = await app.request('http://mbg.test/register', {
    method: 'POST',
    body: formBody({ name: 'HTTP Admin', email: 'http@example.com', password: 'password123', confirm_password: 'password123' }),
    headers: formHeaders(),
  });
  const httpCookie = httpResponse.headers.get('set-cookie') ?? '';
  assert.match(httpCookie, /HttpOnly/);
  assert.match(httpCookie, /SameSite=Lax/);
  assert.match(httpCookie, /Path=\//);
  assert.doesNotMatch(httpCookie, /Secure/);

  const httpsResponse = await app.request('https://mbg.test/register', {
    method: 'POST',
    body: formBody({ name: 'HTTPS Admin', email: 'https@example.com', password: 'password123', confirm_password: 'password123' }),
    headers: formHeaders(),
  });
  assert.match(httpsResponse.headers.get('set-cookie') ?? '', /Secure/);
});
