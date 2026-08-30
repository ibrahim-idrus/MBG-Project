-- Migration: Create menu_compositions table
-- Purpose: Link menus to food items with quantities and calculated nutrition

CREATE TABLE IF NOT EXISTS menu_compositions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  menu_id INTEGER NOT NULL,
  food_item_id INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20) NOT NULL DEFAULT 'g',
  calories DECIMAL(10,2) NOT NULL,
  protein DECIMAL(10,2) NOT NULL,
  carbohydrates DECIMAL(10,2) NOT NULL,
  fat DECIMAL(10,2) NOT NULL,
  fiber DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_menu_compositions_menu_id ON menu_compositions(menu_id);
CREATE INDEX IF NOT EXISTS idx_menu_compositions_food_item_id ON menu_compositions(food_item_id);
