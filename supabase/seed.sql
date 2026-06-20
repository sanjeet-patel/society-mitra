-- Demo society seed data (run after migrations)
-- Note: Requires a platform admin user to exist first.
-- After signing up with PLATFORM_ADMIN_EMAILS, run:
-- UPDATE profiles SET is_platform_admin = true WHERE email = 'admin@societymitra.info';

-- Demo society
INSERT INTO societies (id, name, slug, city, plan, family_limit, show_full_phone)
VALUES (
  'a0000000-0000-4000-8000-000000000001',
  'Green Valley Apartments',
  'greenvalley',
  'Pune',
  'free',
  100,
  false
) ON CONFLICT (slug) DO NOTHING;

-- Demo blocks
INSERT INTO blocks (id, society_id, name) VALUES
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Tower A'),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Tower B')
ON CONFLICT DO NOTHING;

-- Demo units
INSERT INTO units (id, society_id, block_id, unit_number, floor) VALUES
  ('c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'A-101', '1'),
  ('c0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'A-102', '1'),
  ('c0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', 'B-201', '2'),
  ('c0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', 'B-202', '2')
ON CONFLICT DO NOTHING;

-- Demo emergency contacts
INSERT INTO emergency_contacts (society_id, name, phone, contact_type, role_label, sort_order) VALUES
  ('a0000000-0000-4000-8000-000000000001', 'Police Station', '100', 'external', 'Emergency', 1),
  ('a0000000-0000-4000-8000-000000000001', 'Fire Department', '101', 'external', 'Emergency', 2),
  ('a0000000-0000-4000-8000-000000000001', 'Ambulance', '102', 'external', 'Emergency', 3),
  ('a0000000-0000-4000-8000-000000000001', 'City Hospital', '020-12345678', 'external', 'Hospital', 4),
  ('a0000000-0000-4000-8000-000000000001', 'Society President', '9876543210', 'society', 'President', 5),
  ('a0000000-0000-4000-8000-000000000001', 'Society Secretary', '9876543211', 'society', 'Secretary', 6),
  ('a0000000-0000-4000-8000-000000000001', 'Security Gate', '9876543212', 'society', 'Gate', 7);

-- Demo service providers
INSERT INTO service_providers (society_id, name, phone, category, description, is_verified) VALUES
  ('a0000000-0000-4000-8000-000000000001', 'Ramesh Plumbing', '9988776655', 'plumber', 'Available 24/7 for emergency leaks', true),
  ('a0000000-0000-4000-8000-000000000001', 'Suresh Electricals', '9988776644', 'electrician', 'Licensed electrician, 10+ years experience', true),
  ('a0000000-0000-4000-8000-000000000001', 'Aqua RO Services', '9988776633', 'ro_service', 'RO installation and AMC', true),
  ('a0000000-0000-4000-8000-000000000001', 'Quick Tanker', '9988776622', 'water_tanker', 'Water tanker delivery within 30 mins', false);

-- Demo announcements
-- Note: author_id must be set after a profile exists
