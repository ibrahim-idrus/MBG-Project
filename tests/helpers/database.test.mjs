import test from 'node:test';
import assert from 'node:assert/strict';
import { createDatabase } from '../../dist/db/database.js';
import { runMigrations } from '../../dist/db/migrate.js';

test('database enables foreign keys and exposes the auth session table after migrations', () => {
  const db = createDatabase(':memory:');
  runMigrations(db);
  assert.equal(db.pragma('foreign_keys', { simple: true }), 1);
  assert.deepEqual(db.prepare("SELECT name FROM sqlite_master WHERE name = 'auth_sessions'").get(), { name: 'auth_sessions' });
  db.close();
});
