'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  generateRecipeVariations as generateAIVariations,
  type VariationType,
  type RecipeVariation,
} from '@/lib/ai/claude-client'
import { trackUsage } from './usage-tracking'

/**
 * Check if user has reached their free tier limit for AI variations
 */
export async function checkVariationLimit(): Promise<{
  canGenerate: boolean
  remaining: number
  isPremium: boolean
}> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { canGenerate: false, remaining: 0, isPremium: false }
  }

  // Check if user is premium (you'll need to add this to your profiles table)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_premium')
    .eq('id', user.id)
    .single()

  console.log('Premium check:', {
    userId: user.id,
    profile,
    profileError,
    isPremium: profile?.is_premium
  })

  const isPremium = profile?.is_premium || false

  if (isPremium) {
    // Premium users have unlimited variations
    return { canGenerate: true, remaining: -1, isPremium: true }
  }

  // Free tier: check usage tracking
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const { data: usage } = await supabase
    .from('usage_tracking')
    .select('ai_variations_generated')
    .eq('user_id', user.id)
    .gte('created_at', startOfMonth.toISOString())
    .single()

  const generated = usage?.ai_variations_generated || 0
  const FREE_TIER_LIMIT = 5

  return {
    canGenerate: generated < FREE_TIER_LIMIT,
    remaining: Math.max(0, FREE_TIER_LIMIT - generated),
    isPremium: false,
  }
}

/**
 * Generate recipe variations using AI
 */
export async function generateVariations(
  recipeId: string,
  variationType: VariationType,
  count: number = 3,
  customParameter?: string
): Promise<{
  success: boolean
  variations?: RecipeVariation[]
  error?: string
}> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check usage limit
    const { canGenerate, remaining } = await checkVariationLimit()
    if (!canGenerate) {
      return {
        success: false,
        error: `You've reached your monthly limit of 5 free variations. Upgrade to Premium for unlimited variations!`,
      }
    }

    // Get the recipe
    const { data: recipe, error: fetchError } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', recipeId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !recipe) {
      return { success: false, error: 'Recipe not found' }
    }

    // Generate variations using Claude API
    const variations = await generateAIVariations(recipe, variationType, count, customParameter)

    // Track usage
    await trackUsage(user.id, 'ai_variations_generated', count)

    return { success: true, variations }
  } catch (error) {
    console.error('Error generating variations:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate variations',
    }
  }
}

/**
 * Save a variation as a new recipe
 */
export async function saveVariationAsRecipe(
  parentRecipeId: string,
  variation: RecipeVariation,
  variationType: VariationType,
  bookId?: string | null
): Promise<{
  success: boolean
  recipeId?: string
  error?: string
}> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get the parent recipe to copy image and other details
    const { data: parentRecipe } = await supabase
      .from('recipes')
      .select('image_url, category, book_id')
      .eq('id', parentRecipeId)
      .eq('user_id', user.id)
      .single()

    // Create new recipe from variation
    const { data: newRecipe, error: createError } = await supabase
      .from('recipes')
      .insert([
        {
          title: variation.title,
          category: parentRecipe?.category || 'Other',
          prep_time: variation.prep_time,
          cook_time: variation.cook_time,
          servings: variation.servings,
          ingredients: variation.ingredients,
          instructions: variation.instructions,
          notes: variation.notes || `AI-generated ${variationType} variation`,
          image_url: parentRecipe?.image_url || null,
          user_id: user.id,
          parent_recipe_id: parentRecipeId,
          variation_type: variationType,
          book_id: bookId !== undefined ? bookId : parentRecipe?.book_id || null,
          submitted_by: user.id,
        },
      ])
      .select()
      .single()

    if (createError || !newRecipe) {
      return {
        success: false,
        error: createError?.message || 'Failed to save variation',
      }
    }

    // Track that a variation was saved
    await trackUsage(user.id, 'variations_saved', 1)

    revalidatePath('/')
    revalidatePath(`/recipes/${parentRecipeId}`)

    return { success: true, recipeId: newRecipe.id }
  } catch (error) {
    console.error('Error saving variation:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save variation',
    }
  }
}

/**
 * Get all variations (child recipes) for a parent recipe
 */
export async function getRecipeVariations(parentRecipeId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { variations: [], error: 'Not authenticated' }
  }

  const { data: variations, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('parent_recipe_id', parentRecipeId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return { variations: variations || [], error }
}
