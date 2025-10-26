-- Search for Peppernuts recipe
SELECT 
  id,
  title,
  created_at,
  book_id,
  user_id
FROM recipes
WHERE title ILIKE '%peppernut%'
ORDER BY created_at DESC;
