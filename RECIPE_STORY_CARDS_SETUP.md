# Recipe Story Cards - Setup Guide

**Feature Status**: ✅ Complete and ready to use!

## What's Been Built

Recipe Story Cards add emotional context and family memories to your recipes, preserving your culinary heritage for future generations.

### Features Implemented

1. **Recipe Story Field** - Share the story behind the recipe
2. **Family Memory Tags** - Add memory tags like "Christmas tradition", "Grandma's favorite"
3. **Beautiful Card Display** - Rose-themed gradient card with heart icons
4. **Photo Memories Support** - Schema ready for family photos (UI can be added later)
5. **Form Integration** - New fields in create/edit recipe forms
6. **Dark Mode Support** - Looks beautiful in both light and dark themes

---

## Database Migration Required

Before using this feature, you need to run the database migration to add the new fields.

### Step 1: Run the Migration in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the contents of `migrations/add_recipe_stories.sql`
6. Click **Run** (or press Cmd/Ctrl + Enter)

### Step 2: Verify the Migration

Run this query to verify the new columns exist:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'recipes'
AND column_name IN ('story', 'family_memories', 'photo_memories');
```

You should see:
- `story` (text)
- `family_memories` (ARRAY)
- `photo_memories` (jsonb)

---

## How to Use

### Adding a Story to an Existing Recipe

1. Open any recipe
2. Click **Edit**
3. Scroll down to the **"Family Story & Memories"** section
4. Fill in:
   - **Recipe Story**: Write the story behind the recipe
   - **Family Memories**: Add tags separated by commas

Example:
```
Story: "This was my grandmother's recipe from her wedding day in 1952.
She would make it every Christmas morning for the whole family."

Family Memories: Christmas tradition, Grandma's favorite, Holiday special
```

5. Click **Update Recipe**
6. View the recipe - the beautiful story card will appear below the notes section!

### Creating a New Recipe with a Story

1. Click **New Recipe**
2. Fill in all the regular fields (title, ingredients, instructions, etc.)
3. Scroll to the **"Family Story & Memories"** section
4. Add your story and memory tags
5. Click **Create Recipe**

---

## Component Details

### RecipeStoryCard Component
**File**: `components/recipe/RecipeStoryCard.tsx`

**Features**:
- ✅ Rose/pink gradient background
- ✅ Heart icon header
- ✅ Blockquote styling for stories
- ✅ Memory tags with heart emojis
- ✅ Photo memories grid (ready for future enhancement)
- ✅ Hover effects and transitions
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Print-hidden (doesn't show when printing)

**Smart Behavior**:
- Only renders if there's story content or family memories
- Gracefully handles missing data
- Beautiful empty state (doesn't render at all)

### Form Fields Added
**File**: `components/recipes/RecipeForm.tsx`

**New Section**: "Family Story & Memories" (Optional)

1. **Recipe Story** - Textarea for long-form story
   - 4 rows tall
   - Placeholder text guides users
   - Example: "This was my grandmother's recipe..."

2. **Family Memories (Tags)** - Comma-separated input
   - Automatically splits by commas
   - Trims whitespace
   - Converts to array for database storage
   - Example: "Christmas tradition, Kids favorite, Sunday dinners"

---

## Database Schema

### New Fields Added to `recipes` Table

```sql
story TEXT
  - The story behind the recipe
  - Long-form text field
  - Optional

family_memories TEXT[]
  - Array of memory tags
  - Stored as PostgreSQL array
  - Optional
  - Example: ['Christmas tradition', 'Grandmas favorite']

photo_memories JSONB DEFAULT '[]'::jsonb
  - Array of photo objects
  - Structure: {url: string, caption?: string, year?: number}
  - Optional
  - Ready for future photo upload feature
```

### Indexes Created

1. **Full-text search on stories**:
   ```sql
   CREATE INDEX recipes_story_search_idx
   ON recipes USING gin(to_tsvector('english', coalesce(story, '')));
   ```
   - Enables fast searching through recipe stories
   - Uses PostgreSQL full-text search

2. **Array search on family_memories**:
   ```sql
   CREATE INDEX recipes_family_memories_idx
   ON recipes USING gin(family_memories);
   ```
   - Enables fast searching for specific memory tags
   - Find all recipes tagged with "Christmas tradition"

---

## Examples

### Example 1: Grandma's Cookie Recipe

**Story**:
```
This was my grandmother's secret chocolate chip cookie recipe. She baked
these every Sunday afternoon, and the whole house would smell amazing. She
passed this recipe down to my mother in 1985, and now I'm sharing it with
my kids. The secret is using browned butter and a mix of white and brown sugar.
```

**Family Memories**:
```
Sunday tradition, Grandma's secret, Holiday baking, Kids love it
```

**Result**: Beautiful rose-colored card with the story in quotes and memory tags displayed as rounded badges with heart emojis.

### Example 2: Holiday Turkey

**Story**:
```
Dad's famous Thanksgiving turkey recipe. He's been making this the same way
for 40 years, and it's the centerpiece of our family gatherings. The brine
is the secret - 24 hours makes all the difference.
```

**Family Memories**:
```
Thanksgiving tradition, Dad's specialty, Annual gathering
```

---

## Future Enhancements

### Photo Memories Upload (Not Yet Implemented)

The database schema is ready for photo memories, but the upload UI needs to be built. Future enhancement could include:

```typescript
// Photo upload component
<PhotoMemoryUpload
  onPhotoAdd={(photo) => {
    const newPhoto = {
      url: uploadedUrl,
      caption: "Christmas 1995 - Grandma making cookies",
      year: 1995
    }
    setValue('photo_memories', [...(recipe.photo_memories || []), newPhoto])
  }}
/>
```

This would display a grid of family photos with captions and years, creating a beautiful visual memory timeline.

---

## Styling Details

### Colors

- **Light Mode**: Rose-50 to Pink-50 gradient background
- **Dark Mode**: Rose-950/30 to Pink-950/30 gradient background
- **Border**: Rose-200 (light), Rose-800 (dark)
- **Text**: Rose-900 (light), Rose-100 (dark)

### Icons

- **Heart**: Filled heart icon for the header
- **Users**: For family memories section
- **Calendar**: For photo memories section

### Typography

- **Story**: Italic, large leading (relaxed spacing)
- **Quote marks**: 4xl decorative quote marks
- **Tags**: Small, rounded pills with heart emoji prefix

---

## Troubleshooting

### Story Card Not Showing

**Cause**: No story or family memories added to the recipe

**Solution**: The card only renders if there's content. Add a story or at least one memory tag.

### Migration Error

**Cause**: Migration already run or column already exists

**Solution**: The migration uses `ADD COLUMN IF NOT EXISTS`, so it's safe to run multiple times.

### Dark Mode Not Working

**Cause**: Theme provider not configured

**Solution**: Already configured! Dark mode classes (dark:) are throughout the component.

---

## Integration Points

### Where the Story Card Appears

**Location**: Recipe Detail Page
- After the Notes section
- Before the Recipe Images Gallery
- Hidden when printing

**Code**: `components/recipes/RecipeDetailClient.tsx:315-317`

```tsx
{/* Family Story Card */}
<div className="mb-8 print:hidden">
  <RecipeStoryCard recipe={recipe} />
</div>
```

---

## Success!

You now have a beautiful way to preserve family stories and memories alongside your recipes!

**Next Steps**:
1. Run the database migration
2. Edit an existing recipe to add a story
3. View the beautiful story card
4. Share your family's culinary heritage! ❤️

**Dev Server**: http://localhost:3004 ✅ Running and ready to test!

---

**Created**: 2025-01-09
**Feature Set**: B - Social & Storytelling (Part 1/3)
**Status**: ✅ Complete
