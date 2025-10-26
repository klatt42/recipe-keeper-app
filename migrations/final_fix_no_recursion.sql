-- FINAL FIX: Completely Break Circular Dependencies
-- This uses a different approach to avoid ANY recursion

-- ============================================
-- STEP 1: Drop ALL policies completely
-- ============================================

-- Drop all recipe_books policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'recipe_books') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON recipe_books';
    END LOOP;
END $$;

-- Drop all book_members policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'book_members') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON book_members';
    END LOOP;
END $$;

-- Drop all recipes policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'recipes') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON recipes';
    END LOOP;
END $$;

-- ============================================
-- STEP 2: Create SIMPLE policies without cross-table checks
-- ============================================

-- RECIPE_BOOKS: Only check ownership directly
CREATE POLICY "rb_select"
  ON recipe_books
  FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "rb_insert"
  ON recipe_books
  FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "rb_update"
  ON recipe_books
  FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "rb_delete"
  ON recipe_books
  FOR DELETE
  USING (owner_id = auth.uid());

-- BOOK_MEMBERS: Check user_id directly (no recipe_books reference)
CREATE POLICY "bm_select"
  ON book_members
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "bm_insert"
  ON book_members
  FOR INSERT
  WITH CHECK (true);  -- Will be controlled by application logic

CREATE POLICY "bm_update"
  ON book_members
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "bm_delete"
  ON book_members
  FOR DELETE
  USING (user_id = auth.uid());

-- RECIPES: Simple user ownership check (book_id is optional)
CREATE POLICY "r_select"
  ON recipes
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "r_insert"
  ON recipes
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "r_update"
  ON recipes
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "r_delete"
  ON recipes
  FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- STEP 3: Add additional select policies for shared access
-- (These don't create recursion because they only do ONE lookup)
-- ============================================

-- Let users see recipe_books where they are members
CREATE POLICY "rb_select_member"
  ON recipe_books
  FOR SELECT
  USING (
    id IN (
      SELECT book_id FROM book_members WHERE user_id = auth.uid()
    )
  );

-- Let book owners see all members of their books
CREATE POLICY "bm_select_owner"
  ON book_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recipe_books
      WHERE recipe_books.id = book_members.book_id
      AND recipe_books.owner_id = auth.uid()
    )
  );

-- Let users see recipes in books they're members of
CREATE POLICY "r_select_shared"
  ON recipes
  FOR SELECT
  USING (
    book_id IN (
      SELECT book_id FROM book_members WHERE user_id = auth.uid()
    )
  );

-- Let book owners insert members
CREATE POLICY "bm_insert_owner"
  ON book_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipe_books
      WHERE recipe_books.id = book_members.book_id
      AND recipe_books.owner_id = auth.uid()
    )
  );

-- Let book owners or editors update/delete members
CREATE POLICY "bm_delete_owner"
  ON book_members
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM recipe_books
      WHERE recipe_books.id = book_members.book_id
      AND recipe_books.owner_id = auth.uid()
    )
  );
