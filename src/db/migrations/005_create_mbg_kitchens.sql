-- Migration: Create mbg_kitchens table
-- Purpose: MBG operational kitchens/offices

CREATE TABLE IF NOT EXISTS mbg_kitchens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  address TEXT NOT NULL,
  village VARCHAR(255) NOT NULL,
  district VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  province VARCHAR(255) NOT NULL,
  postal_code VARCHAR(10) NOT NULL,
  capacity INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_mbg_kitchens_code ON mbg_kitchens(code);
CREATE INDEX IF NOT EXISTS idx_mbg_kitchens_city ON mbg_kitchens(city);
CREATE INDEX IF NOT EXISTS idx_mbg_kitchens_province ON mbg_kitchens(province);
