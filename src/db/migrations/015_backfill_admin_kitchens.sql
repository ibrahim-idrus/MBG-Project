-- Migration: Backfill admin_kitchens links and assign orphan aspirations
-- Purpose: Ensure every existing admin is linked to at least one MBG kitchen
--          and that every aspiration is addressed to a specific kitchen so
--          the admin scoping logic can route reports correctly.

-- Pick the first available active kitchen as the default target
-- (CTE pattern keeps the migration idempotent and readable).
WITH first_kitchen AS (
  SELECT id FROM mbg_kitchens
  WHERE status = 'active'
  ORDER BY id ASC
  LIMIT 1
)
INSERT OR IGNORE INTO admin_kitchens (admin_id, kitchen_id, created_at)
SELECT a.id, (SELECT id FROM first_kitchen), CURRENT_TIMESTAMP
  FROM admins a
 WHERE a.status = 'active'
   AND NOT EXISTS (
     SELECT 1 FROM admin_kitchens ak WHERE ak.admin_id = a.id
   );

-- Assign any aspiration that is missing a kitchen to the same default kitchen.
UPDATE aspirations
   SET kitchen_id = (SELECT id FROM mbg_kitchens WHERE status = 'active' ORDER BY id ASC LIMIT 1),
       updated_at = CURRENT_TIMESTAMP
 WHERE kitchen_id IS NULL
   AND EXISTS (SELECT 1 FROM mbg_kitchens WHERE status = 'active' LIMIT 1);
