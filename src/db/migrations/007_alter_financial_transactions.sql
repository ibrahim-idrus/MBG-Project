-- Migration: Add kitchen_id to financial_transactions
-- Purpose: Link transactions to MBG kitchens

-- Create new table with kitchen_id
CREATE TABLE IF NOT EXISTS financial_transactions_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kitchen_id INTEGER NOT NULL DEFAULT 1,
  type VARCHAR(10) NOT NULL CHECK (type IN ('IN', 'OUT')),
  category VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  transaction_date DATE NOT NULL,
  description TEXT,
  document_url VARCHAR(500),
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (kitchen_id) REFERENCES mbg_kitchens(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Copy data from old table (assuming kitchen_id = 1 for existing data)
INSERT INTO financial_transactions_new (id, kitchen_id, type, category, title, amount, transaction_date, description, document_url, created_by, created_at, updated_at)
SELECT id, 1, type, category, title, amount, transaction_date, description, document_url, created_by, created_at, updated_at
FROM financial_transactions;

-- Drop old table
DROP TABLE financial_transactions;

-- Rename new table
ALTER TABLE financial_transactions_new RENAME TO financial_transactions;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_transactions_kitchen_id ON financial_transactions(kitchen_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON financial_transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON financial_transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON financial_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_created_by ON financial_transactions(created_by);
