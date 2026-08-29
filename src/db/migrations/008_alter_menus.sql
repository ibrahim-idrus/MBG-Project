-- Migration: Add kitchen_id and school_id to menus
-- Purpose: Link menus to MBG kitchens and schools

-- Create new table with kitchen_id and school_id
CREATE TABLE IF NOT EXISTS menus_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kitchen_id INTEGER NOT NULL DEFAULT 1,
  school_id INTEGER NOT NULL DEFAULT 1,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'snack')),
  menu_date DATE NOT NULL,
  photo_url VARCHAR(500),
  composition TEXT,
  calories DECIMAL(10,2),
  protein DECIMAL(10,2),
  carbohydrates DECIMAL(10,2),
  fat DECIMAL(10,2),
  fiber DECIMAL(10,2),
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (kitchen_id) REFERENCES mbg_kitchens(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Copy data from old table (assuming kitchen_id = 1 and school_id = 1 for existing data)
INSERT INTO menus_new (id, kitchen_id, school_id, name, description, meal_type, menu_date, photo_url, composition, calories, protein, carbohydrates, fat, fiber, created_by, created_at, updated_at)
SELECT id, 1, 1, name, description, meal_type, menu_date, photo_url, NULL, calories, protein, carbohydrates, fat, fiber, created_by, created_at, updated_at
FROM menus;

-- Drop old table
DROP TABLE menus;

-- Rename new table
ALTER TABLE menus_new RENAME TO menus;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_menus_kitchen_id ON menus(kitchen_id);
CREATE INDEX IF NOT EXISTS idx_menus_school_id ON menus(school_id);
CREATE INDEX IF NOT EXISTS idx_menus_meal_type ON menus(meal_type);
CREATE INDEX IF NOT EXISTS idx_menus_date ON menus(menu_date);
CREATE INDEX IF NOT EXISTS idx_menus_created_by ON menus(created_by);
