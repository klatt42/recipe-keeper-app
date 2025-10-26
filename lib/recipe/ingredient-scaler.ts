import Fraction from 'fraction.js'

/**
 * Parse a quantity string (with fractions) to a number
 * Examples: "1/2", "2 1/4", "1-1/2", "0.5", "3"
 */
export function parseQuantity(quantityStr: string): number {
  try {
    // Normalize hyphens to spaces for mixed fractions: "1-1/2" → "1 1/2"
    const normalized = quantityStr.replace(/(\d+)-(\d+\/\d+)/, '$1 $2')

    // Handle mixed fractions like "2 1/4" or "1 1/2"
    const mixedMatch = normalized.match(/^(\d+)\s+(\d+\/\d+)$/)
    if (mixedMatch) {
      const whole = parseInt(mixedMatch[1])
      const frac = new Fraction(mixedMatch[2])
      return whole + frac.valueOf()
    }

    // Handle simple fractions like "1/2"
    if (normalized.includes('/')) {
      return new Fraction(normalized).valueOf()
    }

    // Handle decimals and whole numbers
    return parseFloat(normalized)
  } catch (error) {
    console.error('Error parsing quantity:', quantityStr, error)
    return 0
  }
}

/**
 * Convert a number to a nice fraction string
 * Examples: 0.5 → "1/2", 1.33 → "1 1/3", 2.0 → "2"
 */
export function formatQuantity(num: number): string {
  if (num === 0) return '0'

  try {
    const frac = new Fraction(num)

    // If it's a whole number, just return it
    if (frac.d === 1) {
      return frac.n.toString()
    }

    // If it has a whole part and fraction part (mixed number)
    if (Math.abs(frac.n) > Math.abs(frac.d)) {
      const whole = Math.floor(Math.abs(frac.n) / frac.d) * (frac.s || 1)
      const remainder = Math.abs(frac.n) % frac.d
      if (remainder === 0) {
        return whole.toString()
      }
      return `${whole} ${remainder}/${frac.d}`
    }

    // Simple fraction
    return frac.toFraction()
  } catch (error) {
    // Fallback to decimal with 2 places
    return num.toFixed(2).replace(/\.?0+$/, '')
  }
}

/**
 * Parse an ingredient line to extract quantity, unit, and name
 * Example: "2 cups all-purpose flour" → { quantity: 2, unit: "cups", ingredient: "all-purpose flour" }
 */
export function parseIngredientLine(line: string): {
  quantity: number
  quantityStr: string
  unit: string
  ingredient: string
  originalLine: string
} {
  const trimmed = line.trim()

  // Skip empty lines
  if (!trimmed) {
    return {
      quantity: 0,
      quantityStr: '',
      unit: '',
      ingredient: '',
      originalLine: trimmed,
    }
  }

  // Try multiple patterns to match different formats
  const patterns = [
    // "0.25 # EACH thinly sliced ham" - with pound symbol
    /^([\d\s\/\.\-]+)\s+#\s+(.+)$/i,
    // "1 c. (8 oz.) ricotta cheese" - with abbreviation and parenthetical info
    /^([\d\s\/\.\-]+)\s+(c\.|tsp\.|tbsp\.|oz\.|lb\.|lbs\.|qt\.|pt\.)\s*\([^)]+\)\s+(.+)$/i,
    // "1-1/2 cups flour" or "2 cups flour" or "1/2 cup sugar" or "2 1/4 teaspoons salt" or "1 c. flour"
    /^([\d\s\/\.\-]+)\s+(cup|cups|c\.|c|tablespoon|tablespoons|tbsp|tsp\.|teaspoon|teaspoons|tsp|ounce|ounces|oz\.|oz|pound|pounds|lb\.|lb|lbs|#|gram|grams|g|ml|milliliter|milliliters|liter|liters|l|qt|quart|quarts|pt|pint|pints)\s+(.+)$/i,
    // "2 large eggs"
    /^([\d\s\/\.\-]+)\s+(large|medium|small|whole)\s+(.+)$/i,
    // Just "2 eggs" or "3 onions"
    /^([\d\s\/\.\-]+)\s+(.+)$/,
  ]

  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match) {
      const quantityStr = match[1].trim()
      const quantity = parseQuantity(quantityStr)

      // For 3-group matches (with unit)
      if (match[3]) {
        const unit = match[2]
        const ingredient = match[3]

        return {
          quantity,
          quantityStr,
          unit,
          ingredient,
          originalLine: trimmed,
        }
      }

      // For 2-group matches (no explicit unit, just count)
      const ingredient = match[2]
      return {
        quantity,
        quantityStr,
        unit: '', // No unit, just a count
        ingredient,
        originalLine: trimmed,
      }
    }
  }

  // If no match, return the line as-is with quantity 0
  return {
    quantity: 0,
    quantityStr: '',
    unit: '',
    ingredient: trimmed,
    originalLine: trimmed,
  }
}

/**
 * Scale an ingredient line by a multiplier
 * Example: scaleIngredient("2 cups flour", 1.5) → "3 cups flour"
 */
export function scaleIngredient(line: string, multiplier: number): string {
  const parsed = parseIngredientLine(line)

  // If no quantity was found, return original
  if (parsed.quantity === 0) {
    return line
  }

  const newQuantity = parsed.quantity * multiplier
  const formattedQuantity = formatQuantity(newQuantity)

  // If there's a unit, include it
  if (parsed.unit) {
    return `${formattedQuantity} ${parsed.unit} ${parsed.ingredient}`
  }

  // No unit, just quantity and ingredient (like "2 eggs")
  return `${formattedQuantity} ${parsed.ingredient}`
}

/**
 * Scale all ingredients in a recipe
 */
export function scaleIngredients(ingredientsText: string, multiplier: number): string {
  const lines = ingredientsText.split('\n')
  const scaledLines = lines.map(line => scaleIngredient(line.trim(), multiplier))
  return scaledLines.join('\n')
}

/**
 * Calculate serving multiplier
 */
export function calculateMultiplier(originalServings: number, newServings: number): number {
  if (originalServings === 0) return 1
  return newServings / originalServings
}
