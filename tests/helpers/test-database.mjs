import { createDatabase } from '../../dist/db/database.js';
import { runMigrations } from '../../dist/db/migrate.js';

export function createTestDatabase() {
  const db = createDatabase(':memory:');
  runMigrations(db);
  return db;
}

export function insertAdmin(db, overrides = {}) {
  const admin = {
    name: 'Admin',
    email: 'admin@example.com',
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
