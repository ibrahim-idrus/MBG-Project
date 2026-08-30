import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type Database from 'better-sqlite3';
import { createDatabase } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MIGRATIONS_DIR = join(__dirname, '../../src/db/migrations');
const MIGRATION_FILES = [
  '001_create_admins.sql',
  '002_create_financial_transactions.sql',
  '003_create_menus.sql',
  '004_create_aspirations.sql',
  '005_create_mbg_kitchens.sql',
  '006_create_schools.sql',
  '007_alter_financial_transactions.sql',
  '008_alter_menus.sql',
  '009_create_auth_sessions.sql',
];

export function runMigrations(db?: Database.Database): void {
  console.log('Running migrations...');
  const database = db ?? createDatabase();
  const ownsDatabase = db === undefined;

  try {
    // Enable WAL mode for better performance
    database.pragma('journal_mode = WAL');

    // Create migrations tracking table
    database.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get list of executed migrations
    const executedMigrations = database.prepare('SELECT name FROM migrations').all() as { name: string }[];
    const executedNames = new Set(executedMigrations.map(m => m.name));

    // Run pending migrations
    for (const file of MIGRATION_FILES) {
      if (!executedNames.has(file)) {
        console.log(`Running migration: ${file}`);

        const migrationPath = join(MIGRATIONS_DIR, file);
        const sql = readFileSync(migrationPath, 'utf-8');

        database.exec(sql);

        // Record migration
        database.prepare('INSERT INTO migrations (name) VALUES (?)').run(file);

        console.log(`✓ ${file}`);
      }
    }

    console.log('Migrations completed!');
  } finally {
    if (ownsDatabase) {
      database.close();
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
}
