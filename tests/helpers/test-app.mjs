import { createApp } from '../../dist/server.js';
import { createSession } from '../../dist/auth/session.js';
import { createTestDatabase, insertAdmin } from './test-database.mjs';

export function createTestApp() {
  const db = createTestDatabase();
  const app = createApp(db);
  return { app, db };
}

export function createTestAppWithAdmin(overrides = {}) {
  const { app, db } = createTestApp();
  const adminId = insertAdmin(db, overrides);
  const admin = db.prepare(`
    SELECT id, name, email, password_hash, role, status
    FROM admins
    WHERE id = ?
  `).get(adminId);

  return { app, db, admin };
}

export function createTestAppWithSession(overrides = {}) {
  const { app, db, admin } = createTestAppWithAdmin(overrides);
  const session = createSession(db, admin.id);

  return { app, db, admin, sessionCookie: `mbg_session=${session.token}` };
}
