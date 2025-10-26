-- Fix Recipe RLS Policies to Show All User Recipes
-- Run this in Supabase SQL Editor AFTER fix_rls_policies.sql

-- Drop existing recipe policies
DROP POLICY IF EXISTS "Users can view their own recipes and shared recipes" ON recipes;
DROP POLICY IF EXISTS "Users can create recipes" ON recipes;
DROP POLICY IF EXISTS "Users can update their own recipes and shared recipes" ON recipes;
DROP POLICY IF EXISTS "Users can delete their own recipes and shared recipes" ON recipes;

-- Create simpler recipe policies
-- SELECT: Can view recipes you own OR recipes in books you're a member of
CREATE POLICY "Users can view recipes"
  ON recipes
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR (
      book_id IS NOT NULL
      AND (
        book_id IN (SELECT id FROM recipe_books WHERE owner_id = auth.uid())
        OR book_id IN (SELECT book_id FROM book_members WHERE user_id = auth.uid())
      )
    )
  );

-- INSERT: Can create recipes you own
CREATE POLICY "Users can create recipes"
  ON recipes
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- UPDATE: Can update your own recipes OR recipes in books where you're owner/editor
CREATE POLICY "Users can update recipes"
  ON recipes
  FOR UPDATE
  USING (
    user_id = auth.uid()
    OR (
      book_id IS NOT NULL
      AND book_id IN (
        SELECT bm.book_id
        FROM book_members bm
        WHERE bm.user_id = auth.uid()
        AND bm.role IN ('owner', 'editor')
      )
    )
    OR (
      book_id IS NOT NULL
      AND book_id IN (
        SELECT id FROM recipe_books WHERE owner_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR (
      book_id IS NOT NULL
      AND book_id IN (
        SELECT bm.book_id
        FROM book_members bm
        WHERE bm.user_id = auth.uid()
        AND bm.role IN ('owner', 'editor')
      )
    )
    OR (
      book_id IS NOT NULL
      AND book_id IN (
        SELECT id FROM recipe_books WHERE owner_id = auth.uid()
      )
    )
  );

-- DELETE: Can delete your own recipes OR recipes in books you own
CREATE POLICY "Users can delete recipes"
  ON recipes
  FOR DELETE
  USING (
    user_id = auth.uid()
    OR (
      book_id IS NOT NULL
      AND book_id IN (
        SELECT id FROM recipe_books WHERE owner_id = auth.uid()
      )
    )
  );
