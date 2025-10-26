-- Complete Fix for RLS Policies - Handles All Cases
-- Run this single script in Supabase SQL Editor

-- ============================================
-- PART 1: Drop ALL existing policies
-- ============================================

-- Drop all recipe_books policies
DROP POLICY IF EXISTS "Users can view their recipe books" ON recipe_books;
DROP POLICY IF EXISTS "Users can create recipe books" ON recipe_books;
DROP POLICY IF EXISTS "Book owners can update their books" ON recipe_books;
DROP POLICY IF EXISTS "Book owners can delete their books" ON recipe_books;
DROP POLICY IF EXISTS "Users can view books they own or are members of" ON recipe_books;
DROP POLICY IF EXISTS "Users can create their own recipe books" ON recipe_books;
DROP POLICY IF EXISTS "Owners can update their books" ON recipe_books;
DROP POLICY IF EXISTS "Owners can delete their books" ON recipe_books;

-- Drop all book_members policies
DROP POLICY IF EXISTS "Users can view members of their books" ON book_members;
DROP POLICY IF EXISTS "Book owners and editors can add members" ON book_members;
DROP POLICY IF EXISTS "Book owners can update member roles" ON book_members;
DROP POLICY IF EXISTS "Book owners and members can remove themselves" ON book_members;
DROP POLICY IF EXISTS "Users can view book members" ON book_members;
DROP POLICY IF EXISTS "Book owners can add members" ON book_members;
DROP POLICY IF EXISTS "Book owners can update members" ON book_members;
DROP POLICY IF EXISTS "Remove book members" ON book_members;

-- Drop all recipes policies
DROP POLICY IF EXISTS "Users can view their own recipes and shared recipes" ON recipes;
DROP POLICY IF EXISTS "Users can create recipes" ON recipes;
DROP POLICY IF EXISTS "Users can update their own recipes and shared recipes" ON recipes;
DROP POLICY IF EXISTS "Users can delete their own recipes and shared recipes" ON recipes;
DROP POLICY IF EXISTS "Users can view recipes" ON recipes;
DROP POLICY IF EXISTS "Users can update recipes" ON recipes;
DROP POLICY IF EXISTS "Users can delete recipes" ON recipes;

-- ============================================
-- PART 2: Create new, correct policies
-- ============================================

-- Recipe Books Policies (simple, non-recursive)
CREATE POLICY "view_recipe_books"
  ON recipe_books
  FOR SELECT
  USING (
    owner_id = auth.uid()
    OR id IN (
      SELECT book_id FROM book_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "create_recipe_books"
  ON recipe_books
  FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "update_recipe_books"
  ON recipe_books
  FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "delete_recipe_books"
  ON recipe_books
  FOR DELETE
  USING (owner_id = auth.uid());

-- Book Members Policies (simple, non-recursive)
CREATE POLICY "view_book_members"
  ON book_members
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR book_id IN (
      SELECT id FROM recipe_books WHERE owner_id = auth.uid()
    )
    OR book_id IN (
      SELECT book_id FROM book_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "insert_book_members"
  ON book_members
  FOR INSERT
  WITH CHECK (
    book_id IN (
      SELECT id FROM recipe_books WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "update_book_members"
  ON book_members
  FOR UPDATE
  USING (
    book_id IN (
      SELECT id FROM recipe_books WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    book_id IN (
      SELECT id FROM recipe_books WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "delete_book_members"
  ON book_members
  FOR DELETE
  USING (
    user_id = auth.uid()
    OR book_id IN (
      SELECT id FROM recipe_books WHERE owner_id = auth.uid()
    )
  );

-- Recipe Policies (shows all your recipes, including those with book_id)
CREATE POLICY "view_recipes"
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

CREATE POLICY "insert_recipes"
  ON recipes
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "update_recipes"
  ON recipes
  FOR UPDATE
  USING (
    user_id = auth.uid()
    OR (
      book_id IS NOT NULL
      AND (
        book_id IN (SELECT id FROM recipe_books WHERE owner_id = auth.uid())
        OR book_id IN (
          SELECT book_id FROM book_members
          WHERE user_id = auth.uid()
          AND role IN ('owner', 'editor')
        )
      )
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR (
      book_id IS NOT NULL
      AND (
        book_id IN (SELECT id FROM recipe_books WHERE owner_id = auth.uid())
        OR book_id IN (
          SELECT book_id FROM book_members
          WHERE user_id = auth.uid()
          AND role IN ('owner', 'editor')
        )
      )
    )
  );

CREATE POLICY "delete_recipes"
  ON recipes
  FOR DELETE
  USING (
    user_id = auth.uid()
    OR (
      book_id IS NOT NULL
      AND book_id IN (SELECT id FROM recipe_books WHERE owner_id = auth.uid())
    )
  );
