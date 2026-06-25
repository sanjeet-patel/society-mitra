-- Optional labels assigned by society admins (President, Secretary, etc.)
ALTER TABLE society_members
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN society_members.tags IS 'Society-assigned member labels (e.g. President, Secretary)';
