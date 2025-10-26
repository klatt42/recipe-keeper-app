/**
 * USDA FoodData Central API Client
 * https://fdc.nal.usda.gov/api-guide.html
 */

const USDA_API_BASE = 'https://api.nal.usda.gov/fdc/v1'

export interface USDANutrient {
  nutrientId: number
  nutrientName: string
  unitName: string
  value: number
}

export interface USDAFood {
  fdcId: number
  description: string
  dataType: string
  foodNutrients: Array<{
    nutrientId: number
    nutrientName: string
    unitName: string
    value: number
  }>
}

export interface USDASearchResult {
  foods: USDAFood[]
  totalHits: number
}

export interface NutritionData {
  calories: number
  protein_g: number
  fat_g: number
  carbs_g: number
  fiber_g: number
  sugar_g: number
  sodium_mg: number
}

/**
 * Search for a food in the USDA database
 */
export async function searchFood(query: string): Promise<USDAFood | null> {
  try {
    const apiKey = process.env.USDA_API_KEY || 'DEMO_KEY'

    const url = new URL(`${USDA_API_BASE}/foods/search`)
    url.searchParams.append('api_key', apiKey)
    url.searchParams.append('query', query)
    url.searchParams.append('pageSize', '1')
    url.searchParams.append('dataType', 'Survey (FNDDS)') // Prioritize common foods

    const response = await fetch(url.toString())

    if (!response.ok) {
      console.error('USDA API error:', response.status, await response.text())
      return null
    }

    const data: USDASearchResult = await response.json()

    if (data.foods && data.foods.length > 0) {
      return data.foods[0]
    }

    return null
  } catch (error) {
    console.error('Error searching USDA food database:', error)
    return null
  }
}

/**
 * Get nutrition data for a specific food by FDC ID
 */
export async function getFoodById(fdcId: number): Promise<USDAFood | null> {
  try {
    const apiKey = process.env.USDA_API_KEY || 'DEMO_KEY'

    const url = `${USDA_API_BASE}/food/${fdcId}?api_key=${apiKey}`
    const response = await fetch(url)

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching USDA food by ID:', error)
    return null
  }
}

/**
 * Extract specific nutrients from USDA food data
 */
export function extractNutrients(food: USDAFood): NutritionData {
  const nutrients: NutritionData = {
    calories: 0,
    protein_g: 0,
    fat_g: 0,
    carbs_g: 0,
    fiber_g: 0,
    sugar_g: 0,
    sodium_mg: 0,
  }

  // Nutrient IDs from USDA database
  const nutrientMap: Record<number, keyof NutritionData> = {
    1008: 'calories', // Energy (kcal)
    1003: 'protein_g', // Protein
    1004: 'fat_g', // Total lipid (fat)
    1005: 'carbs_g', // Carbohydrate, by difference
    1079: 'fiber_g', // Fiber, total dietary
    2000: 'sugar_g', // Total sugars
    1093: 'sodium_mg', // Sodium
  }

  for (const nutrient of food.foodNutrients) {
    const key = nutrientMap[nutrient.nutrientId]
    if (key) {
      nutrients[key] = nutrient.value || 0
    }
  }

  return nutrients
}

/**
 * Convert quantity to grams for nutrition calculation
 * This is a simplified version - more complex conversions can be added
 */
export function convertToGrams(quantity: number, unit: string): number {
  const conversions: Record<string, number> = {
    // Weight
    'g': 1,
    'gram': 1,
    'grams': 1,
    'kg': 1000,
    'kilogram': 1000,
    'oz': 28.35,
    'ounce': 28.35,
    'lb': 453.592,
    'pound': 453.592,

    // Volume (approximate conversions for water-like density)
    'ml': 1,
    'milliliter': 1,
    'l': 1000,
    'liter': 1000,
    'cup': 240,
    'tbsp': 15,
    'tablespoon': 15,
    'tsp': 5,
    'teaspoon': 5,
    'fl oz': 30,

    // Default to 1:1
    '': 1,
  }

  const normalizedUnit = unit.toLowerCase().trim()
  return quantity * (conversions[normalizedUnit] || 1)
}

/**
 * Scale nutrition data by quantity
 */
export function scaleNutrition(
  baseNutrition: NutritionData,
  baseAmount: number,
  targetAmount: number
): NutritionData {
  const scaleFactor = targetAmount / baseAmount

  return {
    calories: Math.round(baseNutrition.calories * scaleFactor),
    protein_g: Math.round(baseNutrition.protein_g * scaleFactor * 10) / 10,
    fat_g: Math.round(baseNutrition.fat_g * scaleFactor * 10) / 10,
    carbs_g: Math.round(baseNutrition.carbs_g * scaleFactor * 10) / 10,
    fiber_g: Math.round(baseNutrition.fiber_g * scaleFactor * 10) / 10,
    sugar_g: Math.round(baseNutrition.sugar_g * scaleFactor * 10) / 10,
    sodium_mg: Math.round(baseNutrition.sodium_mg * scaleFactor),
  }
}
