-- Recipe Comments and Ratings Migration (Simplified)
-- Feature Set B: Steps 3 & 4
-- Works without cookbook_members table

-- ============================================================
-- RECIPE COMMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS recipe_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES recipe_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT content_not_empty CHECK (length(trim(content)) > 0)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS recipe_comments_recipe_id_idx ON recipe_comments(recipe_id);
CREATE INDEX IF NOT EXISTS recipe_comments_user_id_idx ON recipe_comments(user_id);
CREATE INDEX IF NOT EXISTS recipe_comments_parent_id_idx ON recipe_comments(parent_id);
CREATE INDEX IF NOT EXISTS recipe_comments_created_at_idx ON recipe_comments(created_at DESC);

-- RLS Policies for recipe_comments
ALTER TABLE recipe_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can read comments on recipes they can see
CREATE POLICY "Users can read comments on visible recipes"
  ON recipe_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_comments.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

-- Users can create comments on recipes they can see
CREATE POLICY "Users can create comments on visible recipes"
  ON recipe_comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_comments.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
  ON recipe_comments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON recipe_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Comments for recipe_comments
COMMENT ON TABLE recipe_comments IS 'User comments on recipes with support for threaded replies';
COMMENT ON COLUMN recipe_comments.parent_id IS 'ID of parent comment for threaded replies (NULL for top-level comments)';
COMMENT ON COLUMN recipe_comments.content IS 'Comment text content';

-- ============================================================
-- RECIPE RATINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS recipe_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One rating per user per recipe
  UNIQUE(recipe_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS recipe_ratings_recipe_id_idx ON recipe_ratings(recipe_id);
CREATE INDEX IF NOT EXISTS recipe_ratings_user_id_idx ON recipe_ratings(user_id);

-- RLS Policies for recipe_ratings
ALTER TABLE recipe_ratings ENABLE ROW LEVEL SECURITY;

-- Anyone can read ratings on recipes they can see
CREATE POLICY "Users can read ratings on visible recipes"
  ON recipe_ratings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_ratings.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

-- Users can create ratings on recipes they can see
CREATE POLICY "Users can create ratings on visible recipes"
  ON recipe_ratings FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_ratings.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

-- Users can update their own ratings
CREATE POLICY "Users can update their own ratings"
  ON recipe_ratings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own ratings
CREATE POLICY "Users can delete their own ratings"
  ON recipe_ratings FOR DELETE
  USING (auth.uid() = user_id);

-- Comments for recipe_ratings
COMMENT ON TABLE recipe_ratings IS 'User star ratings for recipes (1-5 stars)';
COMMENT ON COLUMN recipe_ratings.rating IS 'Star rating from 1 to 5';

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function to get average rating for a recipe
CREATE OR REPLACE FUNCTION get_recipe_average_rating(recipe_uuid UUID)
RETURNS TABLE (
  average_rating NUMERIC,
  rating_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROUND(AVG(rating)::numeric, 1) as average_rating,
    COUNT(*)::integer as rating_count
  FROM recipe_ratings
  WHERE recipe_id = recipe_uuid;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_recipe_comments_updated_at
  BEFORE UPDATE ON recipe_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipe_ratings_updated_at
  BEFORE UPDATE ON recipe_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- DONE
-- ============================================================
