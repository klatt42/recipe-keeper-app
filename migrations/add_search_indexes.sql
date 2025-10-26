-- Add indexes for faster recipe search
-- These indexes will significantly improve ILIKE search performance

-- Index for title search (most commonly searched field)
CREATE INDEX IF NOT EXISTS idx_recipes_title_gin ON recipes USING gin (title gin_trgm_ops);

-- Index for ingredients search (second most common)
CREATE INDEX IF NOT EXISTS idx_recipes_ingredients_gin ON recipes USING gin (ingredients gin_trgm_ops);

-- Index for instructions search
CREATE INDEX IF NOT EXISTS idx_recipes_instructions_gin ON recipes USING gin (instructions gin_trgm_ops);

-- Index for source search (useful for finding recipes from specific books/people)
CREATE INDEX IF NOT EXISTS idx_recipes_source_gin ON recipes USING gin (source gin_trgm_ops);

-- Index for notes search
CREATE INDEX IF NOT EXISTS idx_recipes_notes_gin ON recipes USING gin (notes gin_trgm_ops);

-- Composite index for common filters
CREATE INDEX IF NOT EXISTS idx_recipes_user_category ON recipes (user_id, category);
CREATE INDEX IF NOT EXISTS idx_recipes_user_favorite ON recipes (user_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_recipes_user_book ON recipes (user_id, book_id);

-- Index for sorting
CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON recipes (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipes_rating ON recipes (rating DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_recipes_cook_time ON recipes (cook_time ASC NULLS LAST);

-- Enable the pg_trgm extension if not already enabled (required for GIN indexes on text)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Note: These indexes will make searches much faster but will slightly slow down inserts/updates.
-- For a recipe app, this is a good tradeoff since reads (searches) are much more common than writes.
