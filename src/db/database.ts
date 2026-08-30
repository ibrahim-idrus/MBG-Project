import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DEFAULT_DATABASE_PATH = join(__dirname, '../../data/mbg.db');

export function createDatabase(dbPath?: string): Database.Database {
  const databasePath = dbPath ?? process.env.DATABASE_PATH ?? DEFAULT_DATABASE_PATH;

  if (databasePath !== ':memory:') {
    mkdirSync(dirname(databasePath), { recursive: true });
  }

  const db = new Database(databasePath);
  db.pragma('foreign_keys = ON');
  return db;
}
