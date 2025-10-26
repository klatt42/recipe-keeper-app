-- Add support for multiple recipe images
-- This allows storing all pages of recipe cards, handwritten notes, etc.

CREATE TABLE recipe_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index for fast lookups
CREATE INDEX idx_recipe_images_recipe_id ON recipe_images(recipe_id, display_order);

-- RLS Policies
ALTER TABLE recipe_images ENABLE ROW LEVEL SECURITY;

-- Users can view images for recipes they own
CREATE POLICY "Users can view own recipe images"
ON recipe_images FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.id = recipe_images.recipe_id
    AND recipes.user_id = auth.uid()
  )
);

-- Users can insert images for their own recipes
CREATE POLICY "Users can insert own recipe images"
ON recipe_images FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.id = recipe_images.recipe_id
    AND recipes.user_id = auth.uid()
  )
);

-- Users can update their own recipe images
CREATE POLICY "Users can update own recipe images"
ON recipe_images FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.id = recipe_images.recipe_id
    AND recipes.user_id = auth.uid()
  )
);

-- Users can delete their own recipe images
CREATE POLICY "Users can delete own recipe images"
ON recipe_images FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.id = recipe_images.recipe_id
    AND recipes.user_id = auth.uid()
  )
);
