-- Add shared recipe books feature
-- This enables families to create and collaborate on shared cookbooks

-- 1. Create recipe_books table
CREATE TABLE recipe_books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create book_members table for sharing
CREATE TABLE book_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES recipe_books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(book_id, user_id)
);

-- 3. Add book_id and submitted_by to recipes table
ALTER TABLE recipes
  ADD COLUMN book_id UUID REFERENCES recipe_books(id) ON DELETE CASCADE,
  ADD COLUMN submitted_by UUID REFERENCES auth.users(id);

-- 4. Create default "My Recipes" book for existing users
INSERT INTO recipe_books (name, owner_id, is_shared)
SELECT 'My Recipes', id, false
FROM auth.users;

-- 5. Add owner as member of their books
INSERT INTO book_members (book_id, user_id, role, invited_by)
SELECT id, owner_id, 'owner', NULL
FROM recipe_books;

-- 6. Migrate existing recipes to user's default book
UPDATE recipes r
SET book_id = (
  SELECT rb.id
  FROM recipe_books rb
  WHERE rb.owner_id = r.user_id
  AND rb.name = 'My Recipes'
  LIMIT 1
),
submitted_by = user_id
WHERE book_id IS NULL;

-- 7. Create indexes
CREATE INDEX idx_recipe_books_owner ON recipe_books(owner_id);
CREATE INDEX idx_book_members_book ON book_members(book_id);
CREATE INDEX idx_book_members_user ON book_members(user_id);
CREATE INDEX idx_recipes_book ON recipes(book_id);
CREATE INDEX idx_recipes_submitted_by ON recipes(submitted_by);

-- 8. Enable RLS on recipe_books
ALTER TABLE recipe_books ENABLE ROW LEVEL SECURITY;

-- Users can view books they own or are members of
CREATE POLICY "Users can view accessible books"
ON recipe_books FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid()
  OR id IN (
    SELECT book_id FROM book_members WHERE user_id = auth.uid()
  )
);

-- Users can create their own books
CREATE POLICY "Users can create books"
ON recipe_books FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

-- Owners can update their books
CREATE POLICY "Owners can update books"
ON recipe_books FOR UPDATE
TO authenticated
USING (owner_id = auth.uid());

-- Owners can delete their books
CREATE POLICY "Owners can delete books"
ON recipe_books FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- 9. Enable RLS on book_members
ALTER TABLE book_members ENABLE ROW LEVEL SECURITY;

-- Users can view members of books they have access to
CREATE POLICY "Users can view book members"
ON book_members FOR SELECT
TO authenticated
USING (
  book_id IN (
    SELECT id FROM recipe_books
    WHERE owner_id = auth.uid()
    OR id IN (SELECT book_id FROM book_members WHERE user_id = auth.uid())
  )
);

-- Owners and editors can add members
CREATE POLICY "Owners and editors can add members"
ON book_members FOR INSERT
TO authenticated
WITH CHECK (
  book_id IN (
    SELECT book_id FROM book_members
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'editor')
  )
);

-- Owners can update member roles
CREATE POLICY "Owners can update members"
ON book_members FOR UPDATE
TO authenticated
USING (
  book_id IN (
    SELECT id FROM recipe_books WHERE owner_id = auth.uid()
  )
);

-- Owners can remove members, or users can remove themselves
CREATE POLICY "Owners can remove members or users can leave"
ON book_members FOR DELETE
TO authenticated
USING (
  book_id IN (
    SELECT id FROM recipe_books WHERE owner_id = auth.uid()
  )
  OR user_id = auth.uid()
);

-- 10. Update recipes RLS policies to work with books
DROP POLICY IF EXISTS "Users can view own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can insert own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can update own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can delete own recipes" ON recipes;

-- Users can view recipes in books they have access to
CREATE POLICY "Users can view accessible recipes"
ON recipes FOR SELECT
TO authenticated
USING (
  book_id IN (
    SELECT id FROM recipe_books
    WHERE owner_id = auth.uid()
    OR id IN (SELECT book_id FROM book_members WHERE user_id = auth.uid())
  )
);

-- Users can insert recipes into books where they are owner or editor
CREATE POLICY "Users can insert recipes to accessible books"
ON recipes FOR INSERT
TO authenticated
WITH CHECK (
  book_id IN (
    SELECT book_id FROM book_members
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'editor')
  )
);

-- Users can update recipes in books where they are owner or editor
CREATE POLICY "Users can update recipes in accessible books"
ON recipes FOR UPDATE
TO authenticated
USING (
  book_id IN (
    SELECT book_id FROM book_members
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'editor')
  )
);

-- Users can delete recipes they submitted, or if they're the book owner
CREATE POLICY "Users can delete own submitted recipes or as owner"
ON recipes FOR DELETE
TO authenticated
USING (
  submitted_by = auth.uid()
  OR book_id IN (
    SELECT id FROM recipe_books WHERE owner_id = auth.uid()
  )
);

-- 11. Create function to automatically add owner as member when creating a book
CREATE OR REPLACE FUNCTION add_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO book_members (book_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER add_owner_as_member_trigger
AFTER INSERT ON recipe_books
FOR EACH ROW
EXECUTE FUNCTION add_owner_as_member();

-- 12. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_recipe_books_updated_at
BEFORE UPDATE ON recipe_books
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
