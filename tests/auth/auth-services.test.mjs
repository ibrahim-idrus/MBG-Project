import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { hashPassword, verifyPassword } from '../../dist/auth/password.js';
import {
  isSafeNextPath,
  validateLogin,
  validateRegistration,
} from '../../dist/auth/validation.js';
import {
  createSession,
  findSessionAdmin,
  revokeSession,
} from '../../dist/auth/session.js';
import { createTestDatabase, insertAdmin } from '../helpers/test-database.mjs';

test('password hashing uses bcrypt and verifies only the matching password', async () => {
  const hash = await hashPassword('password123');

  assert.notEqual(hash, 'password123');
  assert.match(hash, /^\$2[aby]\$/);
  assert.equal(await verifyPassword('password123', hash), true);
  assert.equal(await verifyPassword('wrong-password', hash), false);
});

test('registration validation normalizes email and rejects short or mismatched passwords', () => {
  assert.deepEqual(validateRegistration({ name: '  Baim  ', email: ' BAIM@EXAMPLE.COM ', password: 'short', confirm_password: 'different' }), {
    ok: false,
    errors: { password: 'Kata sandi minimal 8 karakter.', confirm_password: 'Konfirmasi kata sandi tidak cocok.' }
  });
  assert.deepEqual(validateRegistration({ name: '  Baim  ', email: ' BAIM@EXAMPLE.COM ', password: 'password123', confirm_password: 'password123' }), {
    ok: true,
    value: { name: 'Baim', email: 'baim@example.com', password: 'password123' }
  });
});

test('registration validation rejects missing name and malformed email', () => {
  assert.deepEqual(validateRegistration({ name: '  ', email: 'not-an-email', password: 'password123', confirm_password: 'password123' }), {
    ok: false,
    errors: { name: 'Nama wajib diisi.', email: 'Format email tidak valid.' }
  });
});

test('login validation normalizes email and preserves the submitted password', () => {
  assert.deepEqual(validateLogin({ email: ' ADMIN@EXAMPLE.COM ', password: 'password123' }), {
    ok: true,
    value: { email: 'admin@example.com', password: 'password123' }
  });
});

test('login validation rejects missing email and password', () => {
  assert.deepEqual(validateLogin({ email: '  ', password: '' }), {
    ok: false,
    errors: { email: 'Email wajib diisi.', password: 'Kata sandi wajib diisi.' }
  });
});

test('safe next paths stay on the same origin and reject malformed or external values', () => {
  for (const value of ['/', '/admin', '/admin?tab=menu', '/admin#summary']) {
    assert.equal(isSafeNextPath(value), true, value);
  }

  for (const value of [null, '', '//evil.example', 'https://evil.example', 'javascript:alert(1)', '/\\evil.example', '/[malformed']) {
    assert.equal(isSafeNextPath(value), false, String(value));
  }
});

test('createSession stores only the SHA-256 token hash and expires after seven days', () => {
  const db = createTestDatabase();
  const now = new Date('2026-08-30T00:00:00.000Z');

  try {
    const adminId = insertAdmin(db);
    const { token, expiresAt } = createSession(db, adminId, now);
    const stored = db.prepare('SELECT token_hash, expires_at, created_at FROM auth_sessions WHERE admin_id = ?').get(adminId);

    assert.match(token, /^[a-f0-9]{64}$/);
    assert.equal(expiresAt.toISOString(), '2026-09-06T00:00:00.000Z');
    assert.deepEqual(stored, {
      token_hash: createHash('sha256').update(token).digest('hex'),
      expires_at: '2026-09-06T00:00:00.000Z',
      created_at: '2026-08-30T00:00:00.000Z',
    });
    assert.notEqual(stored.token_hash, token);
  } finally {
    db.close();
  }
});

test('session token authorizes only an active admin and never exposes a password hash', () => {
  const db = createTestDatabase();
  const now = new Date('2026-08-30T00:00:00.000Z');

  try {
    const adminId = insertAdmin(db, { status: 'active', role: 'admin' });
    const { token } = createSession(db, adminId, now);

    assert.deepEqual(findSessionAdmin(db, token, new Date('2026-08-30T00:01:00.000Z')), {
      id: adminId,
      name: 'Admin',
      email: 'admin@example.com',
      role: 'admin'
    });
    assert.equal(findSessionAdmin(db, token, new Date('2026-09-06T00:00:00.000Z')), null);
    assert.equal(findSessionAdmin(db, 'not-a-session-token', now), null);
  } finally {
    db.close();
  }
});

test('session lookup permits active super admins but rejects inactive admins', () => {
  const db = createTestDatabase();
  const now = new Date('2026-08-30T00:00:00.000Z');

  try {
    const superAdminId = insertAdmin(db, {
      name: 'Super Admin',
      email: 'super@example.com',
      role: 'super_admin',
      status: 'active',
    });
    const inactiveAdminId = insertAdmin(db, {
      name: 'Inactive Admin',
      email: 'inactive@example.com',
      role: 'admin',
      status: 'inactive',
    });
    const superAdminSession = createSession(db, superAdminId, now);
    const inactiveAdminSession = createSession(db, inactiveAdminId, now);

    assert.deepEqual(findSessionAdmin(db, superAdminSession.token, now), {
      id: superAdminId,
      name: 'Super Admin',
      email: 'super@example.com',
      role: 'super_admin',
    });
    assert.equal(findSessionAdmin(db, inactiveAdminSession.token, now), null);
  } finally {
    db.close();
  }
});

test('revokeSession prevents a previously valid session from authorizing', () => {
  const db = createTestDatabase();
  const now = new Date('2026-08-30T00:00:00.000Z');

  try {
    const adminId = insertAdmin(db);
    const { token } = createSession(db, adminId, now);

    revokeSession(db, token);

    assert.equal(findSessionAdmin(db, token, now), null);
    assert.equal(db.prepare('SELECT revoked_at FROM auth_sessions WHERE admin_id = ?').get(adminId).revoked_at !== null, true);
  } finally {
    db.close();
  }
});
