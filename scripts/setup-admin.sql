-- Ensure klatt42@gmail.com is an admin
-- Run this in Supabase SQL editor if needed

INSERT INTO public.admin_users (email, role, is_active)
VALUES ('klatt42@gmail.com', 'super_admin', true)
ON CONFLICT (email)
DO UPDATE SET
  role = 'super_admin',
  is_active = true,
  updated_at = NOW();

-- Verify it worked
SELECT * FROM public.admin_users WHERE email = 'klatt42@gmail.com';
