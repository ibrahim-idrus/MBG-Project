-- Migration: Add sender_phone and kitchen_id to aspirations
-- Purpose: Capture reporter contact details and the target MBG kitchen

-- Add new columns to the existing aspirations table
ALTER TABLE aspirations ADD COLUMN sender_phone VARCHAR(32);
ALTER TABLE aspirations ADD COLUMN kitchen_id INTEGER;

-- SQLite does not support adding a foreign key via ALTER TABLE, so rebuild
-- the aspirations table with the kitchen_id FK in place.
CREATE TABLE IF NOT EXISTS aspirations_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_name VARCHAR(255) NOT NULL,
  sender_email VARCHAR(255),
  sender_phone VARCHAR(32),
  kitchen_id INTEGER,
  category VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  photo_url VARCHAR(500),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  admin_response TEXT,
  responded_by INTEGER,
  responded_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (kitchen_id) REFERENCES mbg_kitchens(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (responded_by) REFERENCES admins(id) ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO aspirations_new (
  id, sender_name, sender_email, sender_phone, kitchen_id, category, description,
  photo_url, status, admin_response, responded_by, responded_at, created_at, updated_at
)
SELECT
  id, sender_name, sender_email, sender_phone, kitchen_id, category, description,
  photo_url, status, admin_response, responded_by, responded_at, created_at, updated_at
FROM aspirations;

DROP TABLE aspirations;
ALTER TABLE aspirations_new RENAME TO aspirations;

-- Re-create indexes on the rebuilt table
CREATE INDEX IF NOT EXISTS idx_aspirations_status ON aspirations(status);
CREATE INDEX IF NOT EXISTS idx_aspirations_category ON aspirations(category);
CREATE INDEX IF NOT EXISTS idx_aspirations_created_at ON aspirations(created_at);
CREATE INDEX IF NOT EXISTS idx_aspirations_responded_by ON aspirations(responded_by);
CREATE INDEX IF NOT EXISTS idx_aspirations_kitchen_id ON aspirations(kitchen_id);
