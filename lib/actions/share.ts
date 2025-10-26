'use server'

import { createClient } from '@/lib/supabase/server'
import { nanoid } from 'nanoid'

export async function createShare(recipeId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated', shareToken: null }
  }

  // Verify user owns the recipe
  const { data: recipe } = await supabase
    .from('recipes')
    .select('id')
    .eq('id', recipeId)
    .eq('user_id', user.id)
    .single()

  if (!recipe) {
    return { success: false, error: 'Recipe not found', shareToken: null }
  }

  // Check if share already exists
  const { data: existingShare } = await supabase
    .from('shared_recipes')
    .select('share_token')
    .eq('recipe_id', recipeId)
    .maybeSingle()

  if (existingShare) {
    return {
      success: true,
      shareToken: existingShare.share_token,
      error: null,
    }
  }

  // Create new share with unique token
  const shareToken = nanoid(12) // Short, URL-friendly unique ID

  const { data, error } = await supabase
    .from('shared_recipes')
    .insert({
      recipe_id: recipeId,
      share_token: shareToken,
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message, shareToken: null }
  }

  return { success: true, shareToken, error: null }
}

export async function getSharedRecipe(shareToken: string) {
  const supabase = await createClient()

  // Get the shared recipe record
  const { data: sharedRecipe, error: shareError } = await supabase
    .from('shared_recipes')
    .select('recipe_id, expires_at, view_count')
    .eq('share_token', shareToken)
    .maybeSingle()

  if (shareError || !sharedRecipe) {
    return { recipe: null, error: 'Share not found' }
  }

  // Check if expired
  if (sharedRecipe.expires_at && new Date(sharedRecipe.expires_at) < new Date()) {
    return { recipe: null, error: 'Share has expired' }
  }

  // Get the recipe details
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', sharedRecipe.recipe_id)
    .single()

  if (recipeError || !recipe) {
    return { recipe: null, error: 'Recipe not found' }
  }

  // Increment view count (using the function to bypass RLS)
  await supabase.rpc('increment_share_view_count', { token: shareToken })

  return { recipe, error: null }
}

export async function deleteShare(recipeId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('shared_recipes')
    .delete()
    .eq('recipe_id', recipeId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, error: null }
}

export async function getRecipeShares(recipeId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { shares: [], error: 'Not authenticated' }
  }

  const { data: shares, error } = await supabase
    .from('shared_recipes')
    .select('*')
    .eq('recipe_id', recipeId)

  return { shares: shares || [], error }
}
