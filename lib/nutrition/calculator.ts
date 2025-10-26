import { parseIngredients, splitIngredients } from './ingredient-parser'
import {
  searchFood,
  extractNutrients,
  convertToGrams,
  scaleNutrition,
  type NutritionData,
} from './usda-client'

export interface RecipeNutrition {
  totalNutrition: NutritionData
  perServing: NutritionData
  servings: number
  ingredientsProcessed: number
  ingredientsTotal: number
  cached: boolean
}

/**
 * Calculate nutrition for a recipe
 */
export async function calculateRecipeNutrition(
  ingredientsText: string,
  servings: number = 4
): Promise<RecipeNutrition> {
  // Split ingredients into lines
  const ingredientLines = splitIngredients(ingredientsText)

  if (ingredientLines.length === 0) {
    return {
      totalNutrition: {
        calories: 0,
        protein_g: 0,
        fat_g: 0,
        carbs_g: 0,
        fiber_g: 0,
        sugar_g: 0,
        sodium_mg: 0,
      },
      perServing: {
        calories: 0,
        protein_g: 0,
        fat_g: 0,
        carbs_g: 0,
        fiber_g: 0,
        sugar_g: 0,
        sodium_mg: 0,
      },
      servings,
      ingredientsProcessed: 0,
      ingredientsTotal: 0,
      cached: false,
    }
  }

  // Parse ingredients using Claude AI
  const parsedIngredients = await parseIngredients(ingredientLines)

  // Initialize total nutrition
  const totalNutrition: NutritionData = {
    calories: 0,
    protein_g: 0,
    fat_g: 0,
    carbs_g: 0,
    fiber_g: 0,
    sugar_g: 0,
    sodium_mg: 0,
  }

  let processedCount = 0

  // Look up nutrition for each ingredient
  for (const parsed of parsedIngredients) {
    try {
      console.log(`Processing ingredient: ${parsed.originalText}`, { quantity: parsed.quantity, unit: parsed.unit, searchTerm: parsed.searchTerm })

      // Skip if no quantity
      if (parsed.quantity === 0) {
        console.log(`Skipping ${parsed.originalText} - no quantity`)
        continue
      }

      // Search USDA database
      const food = await searchFood(parsed.searchTerm)

      if (!food) {
        console.log(`No USDA match found for: ${parsed.searchTerm}`)
        continue
      }

      console.log(`Found USDA food: ${food.description}`)

      // Extract nutrients (per 100g)
      const baseNutrients = extractNutrients(food)
      console.log(`Base nutrients (per 100g):`, baseNutrients)

      // Convert ingredient quantity to grams
      const quantityInGrams = convertToGrams(parsed.quantity, parsed.unit)
      console.log(`Converted ${parsed.quantity} ${parsed.unit} to ${quantityInGrams}g`)

      // Scale nutrition from 100g to actual quantity
      const scaledNutrients = scaleNutrition(baseNutrients, 100, quantityInGrams)
      console.log(`Scaled nutrients:`, scaledNutrients)

      // Add to totals
      totalNutrition.calories += scaledNutrients.calories
      totalNutrition.protein_g += scaledNutrients.protein_g
      totalNutrition.fat_g += scaledNutrients.fat_g
      totalNutrition.carbs_g += scaledNutrients.carbs_g
      totalNutrition.fiber_g += scaledNutrients.fiber_g
      totalNutrition.sugar_g += scaledNutrients.sugar_g
      totalNutrition.sodium_mg += scaledNutrients.sodium_mg

      processedCount++
      console.log(`Processed ${processedCount} ingredients so far. Running totals:`, totalNutrition)
    } catch (error) {
      console.error(`Error processing ingredient: ${parsed.originalText}`, error)
    }
  }

  console.log(`Final nutrition totals:`, totalNutrition)
  console.log(`Processed ${processedCount} of ${parsedIngredients.length} ingredients`)

  // Calculate per-serving nutrition
  const perServing = scaleNutrition(totalNutrition, servings, 1)

  return {
    totalNutrition,
    perServing,
    servings,
    ingredientsProcessed: processedCount,
    ingredientsTotal: parsedIngredients.length,
    cached: false,
  }
}

/**
 * Format nutrition value for display
 */
export function formatNutritionValue(value: number, unit: string): string {
  if (unit === 'g') {
    return value < 1 ? `${value.toFixed(1)}${unit}` : `${Math.round(value)}${unit}`
  }
  if (unit === 'mg') {
    return `${Math.round(value)}${unit}`
  }
  return `${Math.round(value)}`
}

/**
 * Get health indicator color based on daily value percentage
 * This is a simplified version - actual daily values vary by nutrient
 */
export function getHealthIndicator(
  nutrient: keyof NutritionData,
  value: number
): 'low' | 'moderate' | 'high' {
  // Approximate daily values for a 2000 calorie diet
  const dailyValues: Record<keyof NutritionData, number> = {
    calories: 2000,
    protein_g: 50,
    fat_g: 78,
    carbs_g: 275,
    fiber_g: 28,
    sugar_g: 50, // Added sugars
    sodium_mg: 2300,
  }

  const percentage = (value / dailyValues[nutrient]) * 100

  if (percentage < 10) return 'low'
  if (percentage < 20) return 'moderate'
  return 'high'
}
