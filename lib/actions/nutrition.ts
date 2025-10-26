'use server'

import { createClient } from '@/lib/supabase/server'
import { calculateRecipeNutrition, type RecipeNutrition } from '@/lib/nutrition/calculator'
import type { NutritionData } from '@/lib/nutrition/usda-client'

/**
 * Calculate and cache nutrition for a recipe
 */
export async function getRecipeNutrition(
  recipeId: string,
  servings?: number
): Promise<{
  success: boolean
  nutrition?: RecipeNutrition
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

    // Get the recipe
    const { data: recipe, error: fetchError } = await supabase
      .from('recipes')
      .select('ingredients, servings')
      .eq('id', recipeId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !recipe) {
      return { success: false, error: 'Recipe not found' }
    }

    // Use recipe servings if not provided
    const recipeServings = servings || parseInt(recipe.servings) || 4

    // Check cache first
    const servingsKey = recipeServings.toString()
    const { data: cached } = await supabase
      .from('nutrition_cache')
      .select('*')
      .eq('recipe_id', recipeId)
      .eq('servings', servingsKey)
      .single()

    if (cached) {
      // Return cached nutrition
      const nutrition: RecipeNutrition = {
        totalNutrition: {
          calories: cached.calories * recipeServings,
          protein_g: cached.protein_g * recipeServings,
          fat_g: cached.fat_g * recipeServings,
          carbs_g: cached.carbs_g * recipeServings,
          fiber_g: cached.fiber_g * recipeServings,
          sugar_g: cached.sugar_g * recipeServings,
          sodium_mg: cached.sodium_mg * recipeServings,
        },
        perServing: {
          calories: cached.calories,
          protein_g: cached.protein_g,
          fat_g: cached.fat_g,
          carbs_g: cached.carbs_g,
          fiber_g: cached.fiber_g,
          sugar_g: cached.sugar_g,
          sodium_mg: cached.sodium_mg,
        },
        servings: recipeServings,
        ingredientsProcessed: 0, // Not tracked in cache
        ingredientsTotal: 0,
        cached: true,
      }

      return { success: true, nutrition }
    }

    // Calculate nutrition
    const nutrition = await calculateRecipeNutrition(
      recipe.ingredients,
      recipeServings
    )

    // Cache the result (per-serving values)
    await supabase.from('nutrition_cache').upsert({
      recipe_id: recipeId,
      servings: servingsKey,
      calories: nutrition.perServing.calories,
      protein_g: nutrition.perServing.protein_g,
      fat_g: nutrition.perServing.fat_g,
      carbs_g: nutrition.perServing.carbs_g,
      fiber_g: nutrition.perServing.fiber_g,
      sugar_g: nutrition.perServing.sugar_g,
      sodium_mg: nutrition.perServing.sodium_mg,
    })

    return { success: true, nutrition }
  } catch (error) {
    console.error('Error calculating nutrition:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to calculate nutrition',
    }
  }
}

/**
 * Clear nutrition cache for a recipe (e.g., when ingredients change)
 */
export async function clearNutritionCache(recipeId: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    await supabase.from('nutrition_cache').delete().eq('recipe_id', recipeId)

    return { success: true }
  } catch (error) {
    console.error('Error clearing nutrition cache:', error)
    return { success: false, error: 'Failed to clear cache' }
  }
}
