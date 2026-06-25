-- One account per house/unit, dynamic service categories, vendor profiles, classifieds

CREATE TYPE classified_ad_type AS ENUM ('sale', 'rent', 'advertise');
CREATE TYPE classified_ad_status AS ENUM ('active', 'closed', 'sold');

-- Dynamic service categories (global + society-specific)
CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  label TEXT NOT NULL,
  society_id UUID REFERENCES societies(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Global categories use slug-only uniqueness; society categories use (society_id, slug)
CREATE UNIQUE INDEX idx_service_categories_global_slug
  ON service_categories (slug) WHERE society_id IS NULL;

CREATE UNIQUE INDEX idx_service_categories_society_slug
  ON service_categories (society_id, slug) WHERE society_id IS NOT NULL;

INSERT INTO service_categories (slug, label, sort_order) VALUES
  ('kirana', 'Kirana / Grocery', 1),
  ('milk', 'Milk Delivery', 2),
  ('water', 'Water Tanker', 3),
  ('ro', 'RO Service', 4),
  ('electrician', 'Electrician', 5),
  ('plumber', 'Plumber', 6),
  ('carpenter', 'Carpenter', 7),
  ('ac_repair', 'AC Repair', 8),
  ('gas_repair', 'Gas Repair', 9),
  ('internet', 'Internet', 10),
  ('pest_control', 'Pest Control', 11),
  ('laundry', 'Laundry', 12),
  ('salon', 'Salon / Beauty', 13),
  ('doctor', 'Doctor / Clinic', 14),
  ('other', 'Other', 99);

-- Extend service providers
ALTER TABLE service_providers
  ADD COLUMN category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,
  ADD COLUMN short_description TEXT,
  ADD COLUMN full_description TEXT,
  ADD COLUMN service_hours TEXT,
  ADD COLUMN services_offered TEXT[] DEFAULT '{}';

-- Map legacy enum values to new categories
UPDATE service_providers sp SET category_id = sc.id
FROM service_categories sc
WHERE sc.society_id IS NULL
  AND sc.slug = CASE sp.category::text
    WHEN 'ro_service' THEN 'ro'
    WHEN 'water_tanker' THEN 'water'
    ELSE sp.category::text
  END;

UPDATE service_providers SET short_description = LEFT(description, 160)
WHERE description IS NOT NULL AND short_description IS NULL;

UPDATE service_providers SET full_description = description
WHERE description IS NOT NULL AND full_description IS NULL;

-- Classified ads
CREATE TABLE classified_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  ad_type classified_ad_type NOT NULL,
  price NUMERIC(12, 2),
  contact_phone TEXT,
  status classified_ad_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_classified_ads_society ON classified_ads(society_id, created_at DESC);
CREATE INDEX idx_classified_ads_type ON classified_ads(society_id, ad_type);
CREATE INDEX idx_service_providers_category ON service_providers(category_id);

-- One login account per house/unit (pending or approved)
CREATE UNIQUE INDEX idx_one_account_per_unit
  ON society_members (society_id, unit_id)
  WHERE unit_id IS NOT NULL AND status IN ('pending', 'approved');

CREATE TRIGGER classified_ads_updated_at BEFORE UPDATE ON classified_ads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS: service_categories
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active categories"
  ON service_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Platform admin manages global categories"
  ON service_categories FOR ALL
  USING (society_id IS NULL AND is_platform_admin())
  WITH CHECK (society_id IS NULL AND is_platform_admin());

CREATE POLICY "Society admin manages society categories"
  ON service_categories FOR ALL
  USING (society_id IS NOT NULL AND is_society_admin(society_id))
  WITH CHECK (society_id IS NOT NULL AND is_society_admin(society_id));

-- RLS: classified_ads
ALTER TABLE classified_ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read classified ads"
  ON classified_ads FOR SELECT
  USING (is_society_member(society_id));

CREATE POLICY "Members can post classified ads"
  ON classified_ads FOR INSERT
  WITH CHECK (is_society_member(society_id) AND author_id = get_my_profile_id());

CREATE POLICY "Authors can update own classified ads"
  ON classified_ads FOR UPDATE
  USING (author_id = get_my_profile_id() OR is_society_admin(society_id));

CREATE POLICY "Authors and admins can delete classified ads"
  ON classified_ads FOR DELETE
  USING (author_id = get_my_profile_id() OR is_society_admin(society_id));
