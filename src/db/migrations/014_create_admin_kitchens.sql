-- Migration: Create admin_kitchens link table
-- Purpose: Track which MBG kitchens each admin is responsible for
--          (super_admins bypass this and may access all kitchens)

CREATE TABLE IF NOT EXISTS admin_kitchens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER NOT NULL,
  kitchen_id INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (admin_id, kitchen_id),
  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (kitchen_id) REFERENCES mbg_kitchens(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_admin_kitchens_admin_id ON admin_kitchens(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_kitchens_kitchen_id ON admin_kitchens(kitchen_id);
