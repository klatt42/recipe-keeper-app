-- Recipe Books Migration
-- Adds cookbook functionality with sharing capabilities

-- Create recipe_books table
CREATE TABLE IF NOT EXISTS public.recipe_books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create book_members table for sharing
CREATE TABLE IF NOT EXISTS public.book_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES public.recipe_books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(book_id, user_id)
);

-- Add book_id to recipes table
ALTER TABLE public.recipes
ADD COLUMN IF NOT EXISTS book_id UUID REFERENCES public.recipe_books(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_recipe_books_owner ON public.recipe_books(owner_id);
CREATE INDEX IF NOT EXISTS idx_recipe_books_is_shared ON public.recipe_books(is_shared);
CREATE INDEX IF NOT EXISTS idx_book_members_book ON public.book_members(book_id);
CREATE INDEX IF NOT EXISTS idx_book_members_user ON public.book_members(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_book ON public.recipes(book_id);

-- Enable RLS
ALTER TABLE public.recipe_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recipe_books

-- Users can view their own books and books they're members of
CREATE POLICY "Users can view own books"
  ON public.recipe_books FOR SELECT
  USING (
    auth.uid() = owner_id
    OR id IN (
      SELECT book_id FROM public.book_members WHERE user_id = auth.uid()
    )
  );

-- Users can create their own books
CREATE POLICY "Users can create books"
  ON public.recipe_books FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Users can update their own books
CREATE POLICY "Users can update own books"
  ON public.recipe_books FOR UPDATE
  USING (auth.uid() = owner_id);

-- Users can delete their own books
CREATE POLICY "Users can delete own books"
  ON public.recipe_books FOR DELETE
  USING (auth.uid() = owner_id);

-- RLS Policies for book_members

-- Users can view members of books they own or are members of
CREATE POLICY "Users can view book members"
  ON public.book_members FOR SELECT
  USING (
    auth.uid() = user_id
    OR book_id IN (
      SELECT id FROM public.recipe_books WHERE owner_id = auth.uid()
    )
    OR book_id IN (
      SELECT book_id FROM public.book_members WHERE user_id = auth.uid()
    )
  );

-- Book owners and editors can add members
CREATE POLICY "Owners and editors can add members"
  ON public.book_members FOR INSERT
  WITH CHECK (
    book_id IN (
      SELECT id FROM public.recipe_books WHERE owner_id = auth.uid()
    )
    OR book_id IN (
      SELECT book_id FROM public.book_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

-- Book owners can update member roles
CREATE POLICY "Owners can update members"
  ON public.book_members FOR UPDATE
  USING (
    book_id IN (
      SELECT id FROM public.recipe_books WHERE owner_id = auth.uid()
    )
  );

-- Members can leave, owners can remove members
CREATE POLICY "Members can be removed"
  ON public.book_members FOR DELETE
  USING (
    auth.uid() = user_id
    OR book_id IN (
      SELECT id FROM public.recipe_books WHERE owner_id = auth.uid()
    )
  );

-- Update recipes RLS to respect book permissions
DROP POLICY IF EXISTS "Users can view own recipes" ON public.recipes;
CREATE POLICY "Users can view own recipes and shared cookbook recipes"
  ON public.recipes FOR SELECT
  USING (
    auth.uid() = user_id
    OR book_id IN (
      SELECT id FROM public.recipe_books WHERE owner_id = auth.uid()
    )
    OR book_id IN (
      SELECT book_id FROM public.book_members WHERE user_id = auth.uid()
    )
  );

-- Update trigger for recipe_books updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_recipe_books_updated_at ON public.recipe_books;
CREATE TRIGGER update_recipe_books_updated_at
  BEFORE UPDATE ON public.recipe_books
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.recipe_books TO authenticated;
GRANT ALL ON public.book_members TO authenticated;
