-- Society Mitra MVP Schema
-- Enums
CREATE TYPE member_role AS ENUM (
  'platform_admin',
  'society_admin',
  'block_admin',
  'owner',
  'tenant',
  'vendor'
);

CREATE TYPE member_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TYPE society_plan AS ENUM ('free', 'starter', 'professional', 'enterprise');

CREATE TYPE announcement_category AS ENUM (
  'water',
  'electricity',
  'maintenance',
  'security',
  'events',
  'general'
);

CREATE TYPE emergency_contact_type AS ENUM ('external', 'society');

CREATE TYPE service_category AS ENUM (
  'plumber',
  'electrician',
  'carpenter',
  'ro_service',
  'water_tanker',
  'ac_repair',
  'gas_repair',
  'internet',
  'pest_control'
);

-- Societies
CREATE TABLE societies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  city TEXT,
  plan society_plan NOT NULL DEFAULT 'free',
  family_limit INT,
  modules_enabled JSONB NOT NULL DEFAULT '{"visitor": false, "finance": false, "polls": false}'::jsonb,
  show_full_phone BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT societies_slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

-- Blocks (optional tower/block grouping)
CREATE TABLE blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (society_id, name)
);

-- Units (house numbers)
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  block_id UUID REFERENCES blocks(id) ON DELETE SET NULL,
  unit_number TEXT NOT NULL,
  floor TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (society_id, unit_number)
);

-- Profiles (linked to auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  email TEXT,
  blood_group TEXT,
  avatar_url TEXT,
  is_platform_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Society members
CREATE TABLE society_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
  block_id UUID REFERENCES blocks(id) ON DELETE SET NULL,
  role member_role NOT NULL DEFAULT 'owner',
  status member_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (society_id, profile_id)
);

-- Family members
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relation TEXT,
  age INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vehicles
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plate_number TEXT NOT NULL,
  vehicle_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tenants (per unit)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  occupation TEXT,
  police_verified BOOLEAN NOT NULL DEFAULT false,
  rental_start DATE,
  rental_end DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Announcements
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category announcement_category NOT NULL DEFAULT 'general',
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Emergency contacts
CREATE TABLE emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  contact_type emergency_contact_type NOT NULL DEFAULT 'external',
  role_label TEXT,
  whatsapp TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Service providers
CREATE TABLE service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  category service_category NOT NULL,
  description TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  avg_rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  review_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Service reviews
CREATE TABLE service_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider_id, reviewer_id)
);

-- Service inquiries
CREATE TABLE service_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Push subscriptions
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (profile_id, endpoint)
);

-- Audit events
CREATE TABLE audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID REFERENCES societies(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_societies_slug ON societies(slug);
CREATE INDEX idx_society_members_society ON society_members(society_id);
CREATE INDEX idx_society_members_profile ON society_members(profile_id);
CREATE INDEX idx_society_members_status ON society_members(society_id, status);
CREATE INDEX idx_units_society ON units(society_id);
CREATE INDEX idx_announcements_society ON announcements(society_id, created_at DESC);
CREATE INDEX idx_emergency_contacts_society ON emergency_contacts(society_id, sort_order);
CREATE INDEX idx_service_providers_society ON service_providers(society_id, category);
CREATE INDEX idx_profiles_search ON profiles USING gin(
  to_tsvector('english', coalesce(full_name, '') || ' ' || coalesce(phone, '') || ' ' || coalesce(email, ''))
);
CREATE INDEX idx_vehicles_plate ON vehicles(plate_number);
CREATE INDEX idx_units_number ON units(unit_number);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER societies_updated_at BEFORE UPDATE ON societies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER society_members_updated_at BEFORE UPDATE ON society_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER announcements_updated_at BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Review rating aggregate trigger
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE service_providers SET
    avg_rating = (SELECT COALESCE(AVG(rating), 0) FROM service_reviews WHERE provider_id = COALESCE(NEW.provider_id, OLD.provider_id)),
    review_count = (SELECT COUNT(*) FROM service_reviews WHERE provider_id = COALESCE(NEW.provider_id, OLD.provider_id))
  WHERE id = COALESCE(NEW.provider_id, OLD.provider_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER service_review_rating AFTER INSERT OR UPDATE OR DELETE ON service_reviews
  FOR EACH ROW EXECUTE FUNCTION update_provider_rating();

-- RLS helper functions
CREATE OR REPLACE FUNCTION get_my_profile_id()
RETURNS UUID AS $$
  SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT is_platform_admin FROM profiles WHERE user_id = auth.uid()),
    false
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_society_member(p_society_id UUID, p_roles member_role[] DEFAULT NULL)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM society_members sm
    JOIN profiles p ON p.id = sm.profile_id
    WHERE sm.society_id = p_society_id
      AND p.user_id = auth.uid()
      AND sm.status = 'approved'
      AND (p_roles IS NULL OR sm.role = ANY(p_roles))
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_society_admin(p_society_id UUID)
RETURNS BOOLEAN AS $$
  SELECT is_society_member(p_society_id, ARRAY['society_admin', 'block_admin']::member_role[])
    OR is_platform_admin();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Enable RLS
ALTER TABLE societies ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE society_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- Societies policies
CREATE POLICY "Public can read society basic info"
  ON societies FOR SELECT
  USING (true);

CREATE POLICY "Platform admin can insert societies"
  ON societies FOR INSERT
  WITH CHECK (is_platform_admin());

CREATE POLICY "Platform admin can update societies"
  ON societies FOR UPDATE
  USING (is_platform_admin());

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (user_id = auth.uid() OR is_platform_admin());

CREATE POLICY "Members can read peer profiles in same society"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM society_members sm1
      JOIN society_members sm2 ON sm1.society_id = sm2.society_id
      WHERE sm1.profile_id = profiles.id
        AND sm2.profile_id = get_my_profile_id()
        AND sm1.status = 'approved'
        AND sm2.status = 'approved'
    )
  );

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (user_id = auth.uid());

-- Society members policies
CREATE POLICY "Members can read society members"
  ON society_members FOR SELECT
  USING (
    is_society_member(society_id)
    OR profile_id = get_my_profile_id()
    OR is_platform_admin()
  );

CREATE POLICY "Users can request to join"
  ON society_members FOR INSERT
  WITH CHECK (profile_id = get_my_profile_id() AND status = 'pending');

CREATE POLICY "Admins can manage members"
  ON society_members FOR UPDATE
  USING (is_society_admin(society_id));

CREATE POLICY "Admins can delete members"
  ON society_members FOR DELETE
  USING (is_society_admin(society_id));

-- Units policies
CREATE POLICY "Members can read units"
  ON units FOR SELECT
  USING (is_society_member(society_id) OR is_platform_admin());

CREATE POLICY "Admins can manage units"
  ON units FOR ALL
  USING (is_society_admin(society_id));

-- Blocks policies
CREATE POLICY "Members can read blocks"
  ON blocks FOR SELECT
  USING (is_society_member(society_id) OR is_platform_admin());

CREATE POLICY "Admins can manage blocks"
  ON blocks FOR ALL
  USING (is_society_admin(society_id));

-- Family members policies
CREATE POLICY "Members can read family in directory"
  ON family_members FOR SELECT
  USING (
    profile_id = get_my_profile_id()
    OR EXISTS (
      SELECT 1 FROM society_members sm1
      JOIN society_members sm2 ON sm1.society_id = sm2.society_id
      WHERE sm1.profile_id = family_members.profile_id
        AND sm2.profile_id = get_my_profile_id()
        AND sm1.status = 'approved'
        AND sm2.status = 'approved'
    )
  );

CREATE POLICY "Users manage own family"
  ON family_members FOR ALL
  USING (profile_id = get_my_profile_id());

-- Vehicles policies
CREATE POLICY "Members can read vehicles in directory"
  ON vehicles FOR SELECT
  USING (
    profile_id = get_my_profile_id()
    OR EXISTS (
      SELECT 1 FROM society_members sm1
      JOIN society_members sm2 ON sm1.society_id = sm2.society_id
      WHERE sm1.profile_id = vehicles.profile_id
        AND sm2.profile_id = get_my_profile_id()
        AND sm1.status = 'approved'
        AND sm2.status = 'approved'
    )
  );

CREATE POLICY "Users manage own vehicles"
  ON vehicles FOR ALL
  USING (profile_id = get_my_profile_id());

-- Tenants policies
CREATE POLICY "Members can read tenants"
  ON tenants FOR SELECT
  USING (is_society_member(society_id));

CREATE POLICY "Admins and owners manage tenants"
  ON tenants FOR ALL
  USING (is_society_admin(society_id));

-- Announcements policies
CREATE POLICY "Members can read announcements"
  ON announcements FOR SELECT
  USING (is_society_member(society_id));

CREATE POLICY "Admins can create announcements"
  ON announcements FOR INSERT
  WITH CHECK (is_society_admin(society_id) AND author_id = get_my_profile_id());

CREATE POLICY "Admins can update announcements"
  ON announcements FOR UPDATE
  USING (is_society_admin(society_id));

CREATE POLICY "Admins can delete announcements"
  ON announcements FOR DELETE
  USING (is_society_admin(society_id));

-- Emergency contacts policies
CREATE POLICY "Members can read emergency contacts"
  ON emergency_contacts FOR SELECT
  USING (is_society_member(society_id));

CREATE POLICY "Admins manage emergency contacts"
  ON emergency_contacts FOR ALL
  USING (is_society_admin(society_id));

-- Service providers policies
CREATE POLICY "Members can read service providers"
  ON service_providers FOR SELECT
  USING (is_society_member(society_id));

CREATE POLICY "Members can add service providers"
  ON service_providers FOR INSERT
  WITH CHECK (is_society_member(society_id));

CREATE POLICY "Admins can update service providers"
  ON service_providers FOR UPDATE
  USING (is_society_admin(society_id) OR profile_id = get_my_profile_id());

CREATE POLICY "Admins can delete service providers"
  ON service_providers FOR DELETE
  USING (is_society_admin(society_id));

-- Service reviews policies
CREATE POLICY "Members can read reviews"
  ON service_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM service_providers sp
      WHERE sp.id = service_reviews.provider_id
        AND is_society_member(sp.society_id)
    )
  );

CREATE POLICY "Members can create reviews"
  ON service_reviews FOR INSERT
  WITH CHECK (reviewer_id = get_my_profile_id());

CREATE POLICY "Users can update own reviews"
  ON service_reviews FOR UPDATE
  USING (reviewer_id = get_my_profile_id());

-- Service inquiries policies
CREATE POLICY "Members can read own inquiries"
  ON service_inquiries FOR SELECT
  USING (
    requester_id = get_my_profile_id()
    OR EXISTS (
      SELECT 1 FROM service_providers sp
      WHERE sp.id = service_inquiries.provider_id
        AND is_society_admin(sp.society_id)
    )
  );

CREATE POLICY "Members can create inquiries"
  ON service_inquiries FOR INSERT
  WITH CHECK (requester_id = get_my_profile_id());

-- Push subscriptions policies
CREATE POLICY "Users manage own push subscriptions"
  ON push_subscriptions FOR ALL
  USING (profile_id = get_my_profile_id());

-- Audit events policies
CREATE POLICY "Admins can read audit events"
  ON audit_events FOR SELECT
  USING (is_society_admin(society_id) OR is_platform_admin());

CREATE POLICY "System can insert audit events"
  ON audit_events FOR INSERT
  WITH CHECK (actor_id = get_my_profile_id() OR is_platform_admin());

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('announcements', 'announcements', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Storage policies
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Announcement images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'announcements');

CREATE POLICY "Admins can upload announcement images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'announcements' AND auth.role() = 'authenticated');
