-- Migration: Create schools table
-- Purpose: Schools receiving MBG services

CREATE TABLE IF NOT EXISTS schools (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kitchen_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  npsn VARCHAR(20) NOT NULL UNIQUE,
  address TEXT NOT NULL,
  village VARCHAR(255) NOT NULL,
  district VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  province VARCHAR(255) NOT NULL,
  postal_code VARCHAR(10) NOT NULL,
  student_count INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (kitchen_id) REFERENCES mbg_kitchens(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_schools_kitchen_id ON schools(kitchen_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_schools_npsn ON schools(npsn);
CREATE INDEX IF NOT EXISTS idx_schools_city ON schools(city);
CREATE INDEX IF NOT EXISTS idx_schools_province ON schools(province);
