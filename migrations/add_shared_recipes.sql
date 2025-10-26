-- Create shared_recipes table for public recipe sharing
CREATE TABLE shared_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  share_token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0
);

-- Create index on share_token for fast lookups
CREATE INDEX idx_shared_recipes_token ON shared_recipes(share_token);

-- Create index on recipe_id to find shares for a recipe
CREATE INDEX idx_shared_recipes_recipe_id ON shared_recipes(recipe_id);

-- RLS Policies
ALTER TABLE shared_recipes ENABLE ROW LEVEL SECURITY;

-- Users can create shares for their own recipes
CREATE POLICY "Users can create shares for own recipes"
ON shared_recipes FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.id = recipe_id
    AND recipes.user_id = auth.uid()
  )
);

-- Users can view shares for their own recipes
CREATE POLICY "Users can view shares for own recipes"
ON shared_recipes FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.id = recipe_id
    AND recipes.user_id = auth.uid()
  )
);

-- Public (unauthenticated) can view any shared recipe by token
CREATE POLICY "Public can view shared recipes"
ON shared_recipes FOR SELECT
TO anon
USING (
  expires_at IS NULL OR expires_at > NOW()
);

-- Users can delete shares for their own recipes
CREATE POLICY "Users can delete shares for own recipes"
ON shared_recipes FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.id = recipe_id
    AND recipes.user_id = auth.uid()
  )
);

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_share_view_count(token TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE shared_recipes
  SET view_count = view_count + 1
  WHERE share_token = token;
END;
$$;
