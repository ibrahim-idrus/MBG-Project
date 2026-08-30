-- Migration: Add SLHS field to mbg_kitchens
-- Purpose: Track Sanitary Hygiene Feasibility Certificate status

ALTER TABLE mbg_kitchens ADD COLUMN slhs BOOLEAN NOT NULL DEFAULT FALSE;
