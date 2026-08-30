-- Migration: Create food_items table
-- Purpose: Master list of food items with nutritional values per 100g

CREATE TABLE IF NOT EXISTS food_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  default_unit VARCHAR(20) NOT NULL DEFAULT 'g',
  calories_per_100g DECIMAL(10,2) NOT NULL,
  protein_per_100g DECIMAL(10,2) NOT NULL,
  carbohydrates_per_100g DECIMAL(10,2) NOT NULL,
  fat_per_100g DECIMAL(10,2) NOT NULL,
  fiber_per_100g DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_food_items_name ON food_items(name);
