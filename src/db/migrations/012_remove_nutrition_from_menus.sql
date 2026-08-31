-- Migration: Remove nutrition columns from menus
-- Purpose: Normalize nutrition data into menu_compositions

CREATE TABLE IF NOT EXISTS menus_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kitchen_id INTEGER NOT NULL,
  school_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  composition TEXT,
  meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'snack')),
  menu_date DATE NOT NULL,
  photo_url VARCHAR(500),
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

-- Copy data from old table
INSERT INTO menus_new (id, kitchen_id, school_id, name, description, composition, meal_type, menu_date, photo_url, calories, protein, carbohydrates, fat, fiber, created_by, created_at, updated_at)
SELECT id, kitchen_id, school_id, name, description, composition, meal_type, menu_date, photo_url, calories, protein, carbohydrates, fat, fiber, created_by, created_at, updated_at
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
