-- Update Comments and Ratings to reference profiles instead of auth.users
-- This allows PostgREST to automatically join with profiles table

-- ============================================================
-- UPDATE RECIPE_COMMENTS FOREIGN KEY
-- ============================================================

-- Drop existing foreign key to auth.users
ALTER TABLE recipe_comments
  DROP CONSTRAINT IF EXISTS recipe_comments_user_id_fkey;

-- Add new foreign key to profiles
ALTER TABLE recipe_comments
  ADD CONSTRAINT recipe_comments_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;

-- ============================================================
-- UPDATE RECIPE_RATINGS FOREIGN KEY
-- ============================================================

-- Drop existing foreign key to auth.users
ALTER TABLE recipe_ratings
  DROP CONSTRAINT IF EXISTS recipe_ratings_user_id_fkey;

-- Add new foreign key to profiles
ALTER TABLE recipe_ratings
  ADD CONSTRAINT recipe_ratings_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;

-- ============================================================
-- DONE
-- ============================================================
COMMENT ON CONSTRAINT recipe_comments_user_id_fkey ON recipe_comments IS 'References profiles table for automatic PostgREST joins';
COMMENT ON CONSTRAINT recipe_ratings_user_id_fkey ON recipe_ratings IS 'References profiles table for automatic PostgREST joins';
