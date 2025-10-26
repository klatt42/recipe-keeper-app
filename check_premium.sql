-- Check current user's premium status
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name' as name,
  (SELECT is_premium FROM profiles WHERE user_id = auth.users.id) as is_premium
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
