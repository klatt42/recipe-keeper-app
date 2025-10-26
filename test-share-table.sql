-- Test if shared_recipes table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'shared_recipes'
) as table_exists;

-- If it exists, show the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'shared_recipes'
ORDER BY ordinal_position;
