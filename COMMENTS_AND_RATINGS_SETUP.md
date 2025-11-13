# Recipe Comments & Ratings - Setup Guide

**Feature Status**: ✅ Complete and ready to use!

## What's Been Built

Recipe Comments and Ratings add community engagement features to your recipes, allowing users to rate recipes and share their experiences.

### Features Implemented

#### Recipe Ratings (Step 4 - 4 hours)
1. **Interactive Star Rating** - 1-5 star system with hover effects
2. **User Rating Tracking** - One rating per user per recipe
3. **Aggregate Statistics** - Average rating and total count display
4. **Visual Feedback** - Filled/unfilled stars with smooth animations
5. **Rating Management** - Users can update or remove their ratings
6. **Dark Mode Support** - Beautiful in both light and dark themes

#### Recipe Comments (Step 3 - 8 hours)
1. **Threaded Replies** - Up to 3 levels of nested comments
2. **User Avatars** - Gradient avatars with user initials
3. **Edit & Delete** - Users can edit/delete their own comments
4. **Timestamps** - "2 hours ago" style relative timestamps
5. **Empty State** - Friendly UI when no comments exist
6. **Real-time Updates** - Comments refresh on add/edit/delete
7. **Dark Mode Support** - Fully styled for dark theme

---

## Database Migration Required

Before using these features, you need to run the database migration to create the tables.

### Step 1: Run the Migration in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the contents of `migrations/add_comments_and_ratings.sql`
6. Click **Run** (or press Cmd/Ctrl + Enter)

### Step 2: Verify the Migration

Run this query to verify the new tables exist:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('recipe_comments', 'recipe_ratings');
```

You should see both:
- `recipe_comments`
- `recipe_ratings`

### Step 3: Test the Helper Function

Verify the rating aggregation function works:

```sql
SELECT * FROM get_recipe_average_rating('some-recipe-id-here');
```

---

## How to Use

### Rating a Recipe

1. Open any recipe
2. Scroll down to the **"Rate this Recipe"** section (below AI Variations)
3. **Hover over stars** to preview your rating
4. **Click a star** to submit your rating (1-5 stars)
5. Your rating is saved instantly with a success toast
6. You'll see a **blue dot** on your rated star
7. **Click "Remove my rating"** to delete your rating

**Features:**
- See the **average rating** and **total number of ratings**
- Your rating is highlighted with a blue dot indicator
- Hover effects show which stars you're about to select
- Can change your rating anytime by clicking a different star

### Adding Comments

1. Open any recipe
2. Scroll down to the **"Comments"** section (below Ratings)
3. Type your comment in the text box
4. Click **"Post Comment"**
5. Your comment appears immediately with your name/email

### Replying to Comments

1. Find the comment you want to reply to
2. Click the **"Reply"** button below the comment
3. Type your reply in the reply box
4. Click **"Post Reply"**
5. Your reply appears nested under the parent comment

**Note**: Replies can be nested up to 3 levels deep. After that, the Reply button won't appear.

### Editing Your Comments

1. Find your comment (look for Edit/Delete icons in top-right)
2. Click the **pencil icon** (Edit)
3. Modify your comment text
4. Click **"Save"** or **"Cancel"**
5. Comment updates with "(edited)" timestamp

### Deleting Your Comments

1. Find your comment
2. Click the **trash icon** (Delete)
3. Confirm deletion in the dialog
4. Comment is removed immediately (including all replies)

---

## Component Details

### RecipeRating Component
**File**: `components/recipe/RecipeRating.tsx`

**Props**:
```typescript
interface RecipeRatingProps {
  recipeId: string
  initialStats: RecipeRatingStats // { average_rating, rating_count, user_rating }
}
```

**Features**:
- ✅ Interactive star system (1-5)
- ✅ Hover preview
- ✅ Average rating display
- ✅ Total ratings count
- ✅ User's current rating indicator
- ✅ Remove rating option
- ✅ Dark mode
- ✅ Responsive design
- ✅ Toast notifications

**Server Actions Used**:
- `setRecipeRating(recipeId, { rating })` - Create/update rating
- `deleteRecipeRating(recipeId)` - Remove rating
- `getRecipeRatingStats(recipeId)` - Get aggregate stats

---

### RecipeComments Component
**File**: `components/recipe/RecipeComments.tsx`

**Props**:
```typescript
interface RecipeCommentsProps {
  recipeId: string
  initialComments: RecipeComment[] // Threaded structure
  currentUserId?: string // For ownership checks
}
```

**Features**:
- ✅ Threaded replies (up to 3 levels)
- ✅ User avatars with initials
- ✅ Relative timestamps ("2 hours ago")
- ✅ Edit your own comments
- ✅ Delete your own comments
- ✅ Reply to any comment
- ✅ Empty state UI
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Toast notifications

**Server Actions Used**:
- `createComment(recipeId, { content, parent_id })` - Add comment/reply
- `updateComment(commentId, content)` - Edit comment
- `deleteComment(commentId)` - Remove comment
- `getRecipeComments(recipeId)` - Fetch all comments

---

## Database Schema

### `recipe_comments` Table

```sql
CREATE TABLE recipe_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES recipe_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(trim(content)) > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes**:
- `recipe_comments_recipe_id_idx` - Fast lookup by recipe
- `recipe_comments_user_id_idx` - Fast lookup by user
- `recipe_comments_parent_id_idx` - Fast threaded queries
- `recipe_comments_created_at_idx` - Sorted by date

**RLS Policies**:
- Users can read comments on recipes they can access
- Users can create comments on recipes they can access
- Users can edit/delete only their own comments

---

### `recipe_ratings` Table

```sql
CREATE TABLE recipe_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(recipe_id, user_id) -- One rating per user per recipe
);
```

**Indexes**:
- `recipe_ratings_recipe_id_idx` - Fast lookup by recipe
- `recipe_ratings_user_id_idx` - Fast lookup by user

**RLS Policies**:
- Users can read ratings on recipes they can access
- Users can create ratings on recipes they can access
- Users can update/delete only their own ratings

---

### Helper Function: `get_recipe_average_rating`

```sql
CREATE FUNCTION get_recipe_average_rating(recipe_uuid UUID)
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
```

**Usage**: Efficiently calculates average rating and count for a recipe.

---

## Integration Points

### Where Components Appear

**Location**: Recipe Detail Page (`app/recipes/[id]/page.tsx`)

1. **Recipe Rating Section** (line 354-357)
   - After Nutrition Panel
   - Before Recipe Comments

2. **Recipe Comments Section** (line 359-366)
   - After Recipe Rating
   - Before Print Modal

**Code**:
```tsx
// In RecipeDetailClient.tsx

{/* Recipe Rating */}
<div className="mt-8 print:hidden">
  <RecipeRating recipeId={recipe.id} initialStats={ratingStats} />
</div>

{/* Recipe Comments */}
<div className="mt-8 print:hidden">
  <RecipeComments
    recipeId={recipe.id}
    initialComments={comments}
    currentUserId={currentUserId}
  />
</div>
```

---

## Dependencies

### New Package Installed
```json
"date-fns": "^4.1.0"
```

**Used For**: Relative timestamp formatting ("2 hours ago", "3 days ago", etc.)

---

## Security Features

### Row Level Security (RLS)

**Comments**:
- ✅ Users can only see comments on recipes they have access to
- ✅ Users can only edit/delete their own comments
- ✅ Cascade deletion (deleting a comment deletes all replies)

**Ratings**:
- ✅ Users can only see ratings on recipes they have access to
- ✅ Users can only modify their own ratings
- ✅ One rating per user per recipe (enforced at database level)

### Validation

**Comments**:
- Content cannot be empty
- Content trimmed before saving
- Max length: 1000 characters (client-side validation)

**Ratings**:
- Must be 1-5 (enforced at database level)
- Integer only (no decimal ratings)

---

## Styling Details

### Colors

**Rating Component**:
- **Stars (filled)**: Yellow-400 (#FBBF24)
- **Stars (empty)**: Gray-300 / Gray-600 (dark)
- **Background**: White / Gray-800 (dark)
- **Border**: Gray-200 / Gray-700 (dark)

**Comments Component**:
- **Background**: Gray-50 / Gray-900 (dark)
- **Comment cards**: White / Gray-800 (dark)
- **Thread border**: Gray-200 / Gray-700 (dark)
- **Reply border**: Blue-500
- **Avatar gradient**: Blue-500 to Purple-500

### Typography

**Rating**:
- Component title: text-lg font-bold
- Average rating: text-sm font-medium
- Rating count: text-sm text-gray-500

**Comments**:
- User name: text-sm font-semibold
- Timestamp: text-xs text-gray-500
- Comment content: text-gray-700 (dark: text-gray-300)

---

## Troubleshooting

### Comments Not Showing

**Cause 1**: Migration not run
**Solution**: Run the migration in Supabase SQL Editor

**Cause 2**: RLS policies blocking access
**Solution**: Verify you're logged in and have access to the recipe

**Cause 3**: Empty state is intentional
**Solution**: Add the first comment to test!

### Ratings Not Saving

**Cause 1**: Migration not run
**Solution**: Run the migration in Supabase SQL Editor

**Cause 2**: Duplicate rating
**Solution**: The system uses UPSERT - should update existing rating automatically

**Cause 3**: Not logged in
**Solution**: You must be logged in to rate recipes

### Dark Mode Not Working

**Cause**: Theme provider not configured
**Solution**: Already configured! Dark mode classes (dark:) are throughout components.

### Timestamps Show Wrong Time

**Cause**: Using `date-fns` v4.1.0
**Solution**: Already installed and working correctly with relative timestamps

---

## Example Scenarios

### Scenario 1: User Rates and Comments

1. User opens "Grandma's Cookies" recipe
2. Scrolls to rating section
3. **Hovers** over stars → sees preview
4. **Clicks 5th star** → saves 5-star rating
5. Toast: "Rated 5 stars! Your rating has been saved"
6. User sees blue dot on 5th star
7. Scrolls to comments
8. Types: "This recipe is amazing! I made it for Christmas."
9. Clicks **"Post Comment"**
10. Comment appears with user's name/avatar

### Scenario 2: Threaded Discussion

1. User A posts: "Do I need to use unsalted butter?"
2. User B replies: "Salted butter works fine!"
3. User A replies to User B: "Thanks! Will try that."
4. Comments show:
   ```
   User A: "Do I need to use unsalted butter?"
     └─ User B: "Salted butter works fine!"
        └─ User A: "Thanks! Will try that."
   ```

### Scenario 3: Editing a Comment

1. User posts: "Great recipee!" (typo)
2. User clicks **pencil icon**
3. Edits to: "Great recipe!"
4. Clicks **"Save"**
5. Comment updates with "(edited)" marker

---

## Success!

You now have a fully functional comments and ratings system for your recipes!

**Next Steps**:
1. Run the database migration
2. Open any recipe page
3. Rate the recipe with stars
4. Add a comment
5. Test replies and editing
6. Celebrate! 🎉

**Dev Server**: http://localhost:3004 ✅ Running and ready to test!

---

**Created**: 2025-01-09
**Feature Set**: B - Social & Storytelling (Steps 3 & 4)
**Status**: ✅ Complete
**Total Time**: 12 hours (4 hours ratings + 8 hours comments)
