-- Demo society seed data (run after migrations)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

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

-- Demo service providers (after global categories exist from migration)
INSERT INTO service_providers (
  society_id, name, phone, category, category_id,
  short_description, full_description, description, is_verified
)
SELECT
  'a0000000-0000-4000-8000-000000000001',
  v.name,
  v.phone,
  v.legacy_category::service_category,
  sc.id,
  v.short_desc,
  v.full_desc,
  v.full_desc,
  v.is_verified
FROM (VALUES
  ('Ramesh Plumbing', '9988776655', 'plumber', 'plumber', 'Available 24/7 for emergency leaks', 'Licensed plumber serving Green Valley. Emergency leaks, pipe installation, bathroom fittings.', true),
  ('Suresh Electricals', '9988776644', 'electrician', 'electrician', 'Licensed electrician, 10+ years experience', 'Residential electrical work, wiring, MCB, fan and light installation.', true),
  ('Aqua RO Services', '9988776633', 'ro_service', 'ro', 'RO installation and AMC', 'RO purifier sales, installation, filter change, and annual maintenance contracts.', true),
  ('Quick Tanker', '9988776622', 'water_tanker', 'water', 'Water tanker delivery within 30 mins', 'Drinking and utility water tanker delivery for towers A and B.', false)
) AS v(name, phone, legacy_category, category_slug, short_desc, full_desc, is_verified)
JOIN service_categories sc ON sc.slug = v.category_slug AND sc.society_id IS NULL;

-- Demo auth users (mobile + password sign-in only)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    'd0000000-0000-4000-8000-000000000001',
    'authenticated',
    'authenticated',
    '9999999999@societymitra.auth',
    extensions.crypt('demo-admin', extensions.gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"phone":"9999999999","full_name":"Platform Super Admin"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'd0000000-0000-4000-8000-000000000002',
    'authenticated',
    'authenticated',
    '9876501234@societymitra.auth',
    extensions.crypt('demo-tenant', extensions.gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"phone":"9876501234","full_name":"Demo Society Admin"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at,
  provider_id
) VALUES
  (
    'd0000000-0000-4000-8000-000000000011',
    'd0000000-0000-4000-8000-000000000001',
    '{"sub":"d0000000-0000-4000-8000-000000000001","email":"9999999999@societymitra.auth"}'::jsonb,
    'email',
    now(),
    now(),
    now(),
    'd0000000-0000-4000-8000-000000000001'
  ),
  (
    'd0000000-0000-4000-8000-000000000012',
    'd0000000-0000-4000-8000-000000000002',
    '{"sub":"d0000000-0000-4000-8000-000000000002","email":"9876501234@societymitra.auth"}'::jsonb,
    'email',
    now(),
    now(),
    now(),
    'd0000000-0000-4000-8000-000000000002'
  )
ON CONFLICT (id) DO NOTHING;

UPDATE profiles
SET is_platform_admin = true, full_name = 'Platform Super Admin', phone = '9999999999', email = NULL
WHERE user_id = 'd0000000-0000-4000-8000-000000000001';

UPDATE profiles
SET full_name = 'Demo Society Admin', phone = '9876501234', email = NULL
WHERE user_id = 'd0000000-0000-4000-8000-000000000002';

INSERT INTO society_members (society_id, profile_id, unit_id, block_id, role, status)
SELECT
  'a0000000-0000-4000-8000-000000000001',
  p.id,
  'c0000000-0000-4000-8000-000000000001',
  'b0000000-0000-4000-8000-000000000001',
  'society_admin',
  'approved'
FROM profiles p
WHERE p.user_id = 'd0000000-0000-4000-8000-000000000002'
ON CONFLICT (society_id, profile_id) DO UPDATE SET role = 'society_admin', status = 'approved';
