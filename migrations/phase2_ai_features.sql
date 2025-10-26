-- Phase 2: AI-Powered Premium Features
-- Migration for AI recipe variations, usage tracking, and premium tier support

-- Add premium flag to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- Create usage_tracking table for tracking feature usage (AI variations, etc.)
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL, -- Format: "YYYY-MM"
  ai_variations_generated INTEGER DEFAULT 0,
  variations_saved INTEGER DEFAULT 0,
  nutrition_calculations INTEGER DEFAULT 0,
  serving_scalings INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- Enable RLS on usage_tracking
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage tracking"
ON usage_tracking FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage tracking"
ON usage_tracking FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage tracking"
ON usage_tracking FOR UPDATE
USING (auth.uid() = user_id);

-- Create nutrition_cache table for caching nutrition calculations
CREATE TABLE IF NOT EXISTS nutrition_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes ON DELETE CASCADE NOT NULL,
  servings TEXT NOT NULL,
  calories INTEGER,
  protein_g DECIMAL(10,2),
  fat_g DECIMAL(10,2),
  carbs_g DECIMAL(10,2),
  fiber_g DECIMAL(10,2),
  sugar_g DECIMAL(10,2),
  sodium_mg INTEGER,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(recipe_id, servings)
);

-- Enable RLS on nutrition_cache
ALTER TABLE nutrition_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view nutrition for their recipes"
ON nutrition_cache FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.id = nutrition_cache.recipe_id
    AND recipes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert nutrition for their recipes"
ON nutrition_cache FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.id = nutrition_cache.recipe_id
    AND recipes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete nutrition for their recipes"
ON nutrition_cache FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.id = nutrition_cache.recipe_id
    AND recipes.user_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_month ON usage_tracking(user_id, month);
CREATE INDEX IF NOT EXISTS idx_nutrition_cache_recipe ON nutrition_cache(recipe_id);

-- Add comment explaining the migration
COMMENT ON TABLE usage_tracking IS 'Track feature usage for free tier limits and analytics';
COMMENT ON TABLE nutrition_cache IS 'Cache nutrition calculations to reduce API calls and improve performance';
COMMENT ON COLUMN profiles.is_premium IS 'Premium subscription status for unlimited features';
