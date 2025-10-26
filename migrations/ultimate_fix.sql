-- ULTIMATE FIX: Use Functions to Break RLS Recursion
-- This completely eliminates any possibility of circular policy checks

-- ============================================
-- STEP 1: Drop ALL existing policies
-- ============================================

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'recipe_books') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON recipe_books';
    END LOOP;

    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'book_members') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON book_members';
    END LOOP;

    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'recipes') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON recipes';
    END LOOP;
END $$;

-- ============================================
-- STEP 2: Create helper functions (SECURITY DEFINER bypasses RLS)
-- ============================================

-- Function to check if user is book owner (bypasses RLS)
CREATE OR REPLACE FUNCTION is_book_owner(book_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM recipe_books
    WHERE id = book_uuid AND owner_id = user_uuid
  );
$$;

-- Function to check if user is book member (bypasses RLS)
CREATE OR REPLACE FUNCTION is_book_member(book_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM book_members
    WHERE book_id = book_uuid AND user_id = user_uuid
  );
$$;

-- ============================================
-- STEP 3: Create simple policies using functions
-- ============================================

-- RECIPE_BOOKS policies
CREATE POLICY "recipe_books_select_policy"
  ON recipe_books
  FOR SELECT
  USING (
    owner_id = auth.uid()
    OR is_book_member(id, auth.uid())
  );

CREATE POLICY "recipe_books_insert_policy"
  ON recipe_books
  FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "recipe_books_update_policy"
  ON recipe_books
  FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "recipe_books_delete_policy"
  ON recipe_books
  FOR DELETE
  USING (owner_id = auth.uid());

-- BOOK_MEMBERS policies
CREATE POLICY "book_members_select_policy"
  ON book_members
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR is_book_owner(book_id, auth.uid())
  );

CREATE POLICY "book_members_insert_policy"
  ON book_members
  FOR INSERT
  WITH CHECK (is_book_owner(book_id, auth.uid()));

CREATE POLICY "book_members_update_policy"
  ON book_members
  FOR UPDATE
  USING (is_book_owner(book_id, auth.uid()))
  WITH CHECK (is_book_owner(book_id, auth.uid()));

CREATE POLICY "book_members_delete_policy"
  ON book_members
  FOR DELETE
  USING (
    user_id = auth.uid()
    OR is_book_owner(book_id, auth.uid())
  );

-- RECIPES policies
CREATE POLICY "recipes_select_policy"
  ON recipes
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR (book_id IS NOT NULL AND is_book_member(book_id, auth.uid()))
    OR (book_id IS NOT NULL AND is_book_owner(book_id, auth.uid()))
  );

CREATE POLICY "recipes_insert_policy"
  ON recipes
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "recipes_update_policy"
  ON recipes
  FOR UPDATE
  USING (
    user_id = auth.uid()
    OR (book_id IS NOT NULL AND is_book_owner(book_id, auth.uid()))
    OR (
      book_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM book_members
        WHERE book_id = recipes.book_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'editor')
      )
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR (book_id IS NOT NULL AND is_book_owner(book_id, auth.uid()))
    OR (
      book_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM book_members
        WHERE book_id = recipes.book_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'editor')
      )
    )
  );

CREATE POLICY "recipes_delete_policy"
  ON recipes
  FOR DELETE
  USING (
    user_id = auth.uid()
    OR (book_id IS NOT NULL AND is_book_owner(book_id, auth.uid()))
  );
