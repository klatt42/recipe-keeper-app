-- Add story and family memory fields to recipes table
-- Migration: add_recipe_stories.sql
-- Purpose: Enable family storytelling and emotional context for recipes

-- Add new columns to recipes table
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS story TEXT,
ADD COLUMN IF NOT EXISTS family_memories TEXT[],
ADD COLUMN IF NOT EXISTS photo_memories JSONB DEFAULT '[]'::jsonb;

-- Add comment documentation
COMMENT ON COLUMN recipes.story IS 'The story behind this recipe - where it came from, special memories, family history';
COMMENT ON COLUMN recipes.family_memories IS 'Array of memory tags like "Christmas tradition", "Grandmas favorite", "Sunday dinners"';
COMMENT ON COLUMN recipes.photo_memories IS 'Array of photo objects with {url, caption, year} for family photos associated with this recipe';

-- Create index for searching stories (full-text search)
CREATE INDEX IF NOT EXISTS recipes_story_search_idx ON recipes USING gin(to_tsvector('english', coalesce(story, '')));

-- Create index for family_memories array searching
CREATE INDEX IF NOT EXISTS recipes_family_memories_idx ON recipes USING gin(family_memories);

-- Update RLS policies to include new fields (they inherit from existing policies)
-- No additional RLS changes needed as these are part of the recipes table

-- Grant permissions (should already be covered by existing grants, but being explicit)
-- Users can read/write their own recipe stories
-- This is already covered by existing RLS policies on recipes table
