import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, '../../data/mbg.db');
const MIGRATIONS_DIR = join(__dirname, '../../src/db/migrations');

export function runMigrations(): void {
  console.log('Running migrations...');
  
  const db = new Database(DB_PATH);
  
  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');
  
  // Create migrations tracking table
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Get list of executed migrations
  const executedMigrations = db.prepare('SELECT name FROM migrations').all() as { name: string }[];
  const executedNames = new Set(executedMigrations.map(m => m.name));
  
  // Read migration files
  const migrationFiles = [
    '001_create_admins.sql',
    '002_create_financial_transactions.sql',
    '003_create_menus.sql',
    '004_create_aspirations.sql',
    '005_create_mbg_kitchens.sql',
    '006_create_schools.sql',
    '007_alter_financial_transactions.sql',
    '008_alter_menus.sql',
    '009_add_slhs_to_mbg_kitchens.sql',
    '010_create_food_items.sql',
    '011_create_menu_compositions.sql',
    '012_remove_nutrition_from_menus.sql',
  ];
  
  // Run pending migrations
  for (const file of migrationFiles) {
    if (!executedNames.has(file)) {
      console.log(`Running migration: ${file}`);
      
      const migrationPath = join(MIGRATIONS_DIR, file);
      const sql = readFileSync(migrationPath, 'utf-8');
      
      db.exec(sql);
      
      // Record migration
      db.prepare('INSERT INTO migrations (name) VALUES (?)').run(file);
      
      console.log(`✓ ${file}`);
    }
  }
  
  db.close();
  console.log('Migrations completed!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
}
