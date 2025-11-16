-- Check if is_book_member function exists
SELECT
    routine_name,
    routine_schema,
    routine_type,
    data_type as return_type
FROM information_schema.routines
WHERE routine_name = 'is_book_member'
AND routine_schema = 'public';

-- If function exists, test it with actual values
SELECT is_book_member(
  '989f7f81-c86c-4eb4-93b2-463f31e890a0'::uuid,  -- book_id for "Klatt Family Recipes"
  'd234e169-b828-49f7-800c-7d84e16e52d1'::uuid   -- user_id for ppsc.rk@gmail.com
) AS is_member_result;

-- Verify the book_members entry exists
SELECT * FROM book_members
WHERE book_id = '989f7f81-c86c-4eb4-93b2-463f31e890a0'
AND user_id = 'd234e169-b828-49f7-800c-7d84e16e52d1';

-- Check what recipes exist in this cookbook
SELECT id, title, book_id, user_id
FROM recipes
WHERE book_id = '989f7f81-c86c-4eb4-93b2-463f31e890a0';

-- Try to SELECT recipes as this user would (simulating RLS)
-- This requires running as the actual user, so we'll check the function definition instead
SELECT routine_definition
FROM information_schema.routines
WHERE routine_name = 'is_book_member'
AND routine_schema = 'public';
