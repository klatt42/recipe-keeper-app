import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface ParsedIngredient {
  originalText: string
  quantity: number
  unit: string
  ingredient: string
  searchTerm: string // Simplified name for USDA search
}

/**
 * Parse ingredients using Claude AI to extract quantity, unit, and ingredient name
 */
export async function parseIngredients(
  ingredients: string[]
): Promise<ParsedIngredient[]> {
  try {
    const prompt = `You are a nutrition assistant. Parse these recipe ingredients and extract:
1. Quantity (as a number, convert fractions to decimals)
2. Unit of measurement (cup, tbsp, oz, lb, etc.)
3. Ingredient name (standardized, without qualifiers like "chopped" or "diced")
4. Search term (simplified ingredient name for database lookup)

Ingredients:
${ingredients.map((ing, i) => `${i + 1}. ${ing}`).join('\n')}

Return ONLY a JSON array with this exact structure:
[
  {
    "originalText": "original ingredient text",
    "quantity": 1.5,
    "unit": "cup",
    "ingredient": "all-purpose flour",
    "searchTerm": "flour"
  }
]

Rules:
- Convert fractions to decimals (1/2 → 0.5, 1/4 → 0.25, 1/3 → 0.33, 2/3 → 0.67)
- Use standard units (cup, tbsp, tsp, oz, lb, g, ml, l)
- Simplify ingredient names (remove "chopped", "diced", "fresh", etc.)
- For searchTerm, use the most basic form (e.g., "chicken breast" → "chicken")
- If no quantity is specified, use 0
- If no unit is specified, use ""

Output ONLY the JSON array, no markdown or explanations.`

    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-20250514',
      max_tokens: 2048,
      temperature: 0.3, // Lower temperature for more consistent parsing
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const textContent = response.content.find((block) => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in response')
    }

    // Remove markdown code blocks if present
    let cleaned = textContent.text.trim()
    cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    cleaned = cleaned.trim()

    const parsed = JSON.parse(cleaned)

    if (!Array.isArray(parsed)) {
      throw new Error('Response is not an array')
    }

    return parsed as ParsedIngredient[]
  } catch (error) {
    console.error('Error parsing ingredients:', error)
    // Fallback: return ingredients as-is with no parsing
    return ingredients.map((ing) => ({
      originalText: ing,
      quantity: 0,
      unit: '',
      ingredient: ing,
      searchTerm: ing,
    }))
  }
}

/**
 * Extract just the ingredient list from a recipe's ingredients text
 */
export function splitIngredients(ingredientsText: string): string[] {
  return ingredientsText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}
