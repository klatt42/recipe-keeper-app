'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { RecipeRatingStats, RatingFormData } from '@/lib/types/comments'

interface ActionResult {
  success: boolean
  error?: string
  stats?: RecipeRatingStats
}

/**
 * Get rating statistics for a recipe
 * Returns average rating, count, and current user's rating
 */
export async function getRecipeRatingStats(recipeId: string): Promise<RecipeRatingStats> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get average and count
  const { data: stats, error: rpcError } = await supabase
    .rpc('get_recipe_average_rating', { recipe_uuid: recipeId })
    .single()

  // If function doesn't exist yet, return empty stats (migration not run)
  if (rpcError && (rpcError.code === '42883' || rpcError.code === 'PGRST205')) {
    console.warn('get_recipe_average_rating function does not exist. Please run the migration in migrations/add_comments_and_ratings.sql')
    return {
      average_rating: null,
      rating_count: 0,
      user_rating: null,
    }
  }

  // Get user's rating if logged in
  let userRating: number | null = null
  if (user) {
    const { data: userRatingData, error: tableError } = await supabase
      .from('recipe_ratings')
      .select('rating')
      .eq('recipe_id', recipeId)
      .eq('user_id', user.id)
      .single()

    // If table doesn't exist yet, return null (migration not run)
    if (tableError && (tableError.code === '42P01' || tableError.code === 'PGRST205')) {
      console.warn('recipe_ratings table does not exist. Please run the migration in migrations/add_comments_and_ratings.sql')
      return {
        average_rating: null,
        rating_count: 0,
        user_rating: null,
      }
    }

    userRating = userRatingData?.rating || null
  }

  return {
    average_rating: stats?.average_rating || null,
    rating_count: stats?.rating_count || 0,
    user_rating: userRating,
  }
}

/**
 * Set or update user's rating for a recipe
 * Uses UPSERT to either insert or update
 */
export async function setRecipeRating(
  recipeId: string,
  data: RatingFormData
): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in to rate recipes' }
  }

  // Upsert the rating (insert or update if exists)
  const { error } = await supabase
    .from('recipe_ratings')
    .upsert(
      {
        recipe_id: recipeId,
        user_id: user.id,
        rating: data.rating,
      },
      {
        onConflict: 'recipe_id,user_id',
      }
    )

  if (error) {
    console.error('Error setting rating:', error)
    return { success: false, error: 'Failed to save rating' }
  }

  // Get updated stats
  const stats = await getRecipeRatingStats(recipeId)

  revalidatePath(`/recipes/${recipeId}`)
  return { success: true, stats }
}

/**
 * Remove user's rating for a recipe
 */
export async function deleteRecipeRating(recipeId: string): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  const { error } = await supabase
    .from('recipe_ratings')
    .delete()
    .eq('recipe_id', recipeId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting rating:', error)
    return { success: false, error: 'Failed to delete rating' }
  }

  // Get updated stats
  const stats = await getRecipeRatingStats(recipeId)

  revalidatePath(`/recipes/${recipeId}`)
  return { success: true, stats }
}
