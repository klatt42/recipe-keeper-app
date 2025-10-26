-- Fix RLS Policies to Remove Infinite Recursion
-- Run this in Supabase SQL Editor

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view members of their books" ON book_members;
DROP POLICY IF EXISTS "Book owners and editors can add members" ON book_members;
DROP POLICY IF EXISTS "Book owners can update member roles" ON book_members;
DROP POLICY IF EXISTS "Book owners and members can remove themselves" ON book_members;

DROP POLICY IF EXISTS "Users can view their recipe books" ON recipe_books;
DROP POLICY IF EXISTS "Users can create recipe books" ON recipe_books;
DROP POLICY IF EXISTS "Book owners can update their books" ON recipe_books;
DROP POLICY IF EXISTS "Book owners can delete their books" ON recipe_books;

-- Create simpler, non-recursive policies for recipe_books
CREATE POLICY "Users can view books they own or are members of"
  ON recipe_books
  FOR SELECT
  USING (
    owner_id = auth.uid()
    OR id IN (
      SELECT book_id FROM book_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own recipe books"
  ON recipe_books
  FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their books"
  ON recipe_books
  FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can delete their books"
  ON recipe_books
  FOR DELETE
  USING (owner_id = auth.uid());

-- Create simpler, non-recursive policies for book_members
-- SELECT: Can view members if you're the owner OR if you're a member
CREATE POLICY "Users can view book members"
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

-- INSERT: Only book owners can add members
CREATE POLICY "Book owners can add members"
  ON book_members
  FOR INSERT
  WITH CHECK (
    book_id IN (
      SELECT id FROM recipe_books WHERE owner_id = auth.uid()
    )
  );

-- UPDATE: Only book owners can update member roles
CREATE POLICY "Book owners can update members"
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

-- DELETE: Book owners can remove members, or users can remove themselves
CREATE POLICY "Remove book members"
  ON book_members
  FOR DELETE
  USING (
    user_id = auth.uid()
    OR book_id IN (
      SELECT id FROM recipe_books WHERE owner_id = auth.uid()
    )
  );
