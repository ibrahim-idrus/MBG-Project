-- Migration: Create aspirations table
-- Purpose: Store public feedback/aspirations

CREATE TABLE IF NOT EXISTS aspirations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_name VARCHAR(255) NOT NULL,
  sender_email VARCHAR(255),
  category VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  photo_url VARCHAR(500),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  admin_response TEXT,
  responded_by INTEGER,
  responded_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (responded_by) REFERENCES admins(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_aspirations_status ON aspirations(status);
CREATE INDEX IF NOT EXISTS idx_aspirations_category ON aspirations(category);
CREATE INDEX IF NOT EXISTS idx_aspirations_created_at ON aspirations(created_at);
CREATE INDEX IF NOT EXISTS idx_aspirations_responded_by ON aspirations(responded_by);
