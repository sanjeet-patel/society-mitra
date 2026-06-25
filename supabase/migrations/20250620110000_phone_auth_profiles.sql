-- Store phone on profile when users sign up with mobile + password
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  profile_phone TEXT;
  profile_name TEXT;
  profile_email TEXT;
BEGIN
  profile_phone := COALESCE(
    NEW.raw_user_meta_data->>'phone',
    NEW.phone,
    CASE
      WHEN NEW.email LIKE '%@societymitra.auth' THEN split_part(NEW.email, '@', 1)
      ELSE NULL
    END
  );

  profile_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    profile_phone,
    'User'
  );

  profile_email := CASE
    WHEN NEW.email IS NULL OR NEW.email LIKE '%@societymitra.auth' THEN NULL
    ELSE NEW.email
  END;

  INSERT INTO public.profiles (user_id, email, phone, full_name)
  VALUES (
    NEW.id,
    profile_email,
    profile_phone,
    profile_name
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
