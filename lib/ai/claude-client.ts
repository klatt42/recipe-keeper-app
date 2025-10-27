import Anthropic from '@anthropic-ai/sdk'
import type { Recipe } from '@/lib/schemas/recipe'
import type { VariationType, RecipeVariation } from './variation-types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

/**
 * Build variation prompt based on type
 */
function buildVariationPrompt(
  recipe: Recipe,
  variationType: VariationType,
  count: number = 3,
  customParameter?: string
): string {
  const basePrompt = `You are a professional chef helping home cooks discover creative variations of their favorite recipes. Analyze the recipe below and suggest ${count} creative, practical variations.

Original Recipe:
Title: ${recipe.title}
Category: ${recipe.category || 'Not specified'}
Prep Time: ${recipe.prep_time || 'Not specified'} minutes
Cook Time: ${recipe.cook_time || 'Not specified'} minutes
Servings: ${recipe.servings || 'Not specified'}

Ingredients:
${recipe.ingredients}

Instructions:
${recipe.instructions}

Notes: ${recipe.notes || 'None'}
Source: ${recipe.source || 'User created'}
`

  const variationInstructions: Record<VariationType, string> = {
    dietary: customParameter
      ? `Generate ${count} DIETARY ADAPTATION variations specifically for: ${customParameter}

IMPORTANT: All ${count} variations MUST be adapted for "${customParameter}" dietary requirement.

Focus on:
- Proper ingredient substitutions that work for ${customParameter}
- Maintaining the dish's flavor and texture
- Practical, accessible alternatives
- Clear explanations of what was changed and why
- Ensuring the variations are safe and appropriate for ${customParameter}

Each variation should offer a different approach or style while all meeting the ${customParameter} requirement.`
      : `Generate ${count} DIETARY variations. Consider:
- Vegan/vegetarian versions (plant-based substitutes)
- Gluten-free adaptations (alternative flours, ingredients)
- Keto/low-carb versions (reduce carbs, increase healthy fats)
- Paleo-friendly (no grains, dairy, legumes)
- Dairy-free options (non-dairy substitutes)
- Low-sodium versions (reduce salt, use herbs/spices)

Focus on maintaining the dish's essence while making it accessible to different dietary needs.`,

    cuisine: `Generate ${count} CUISINE SWAP variations. Transform this recipe into different cultural styles:
- Italian → Mexican, Asian, Mediterranean, Indian, etc.
- Use authentic spices, cooking methods, and ingredient swaps
- Maintain the core concept (if it's a comfort food, keep it comforting)
- Be creative but culturally respectful

Examples: Lasagna → Enchiladas, Stir-fry → Paella, Tacos → Gyros`,

    technique: `Generate ${count} COOKING TECHNIQUE variations. Change HOW the dish is prepared:
- Baked → Air fryer, grilled, pan-fried
- Stovetop → Slow cooker, instant pot, oven
- Deep-fried → Baked, air-fried (healthier)
- Raw → Cooked, or vice versa
- Grilled → Roasted, broiled

Adjust cooking times and temperatures accordingly. Keep ingredient changes minimal.`,

    seasonal: `Generate ${count} SEASONAL variations. Adapt this recipe for different seasons:
- Summer → Winter (hearty, warm ingredients)
- Winter → Summer (light, fresh ingredients)
- Use seasonal produce (summer: tomatoes, berries, corn; winter: root vegetables, squash, citrus)
- Adjust cooking methods (summer: grilling, salads; winter: braising, roasting)

Make it feel appropriate for the season.`,

    flavor: `Generate ${count} FLAVOR PROFILE variations. Enhance or transform the taste:
- Add heat (chili peppers, hot sauce, cayenne)
- Add sweetness (honey, maple syrup, caramelized onions)
- Add umami (soy sauce, miso, mushrooms, parmesan)
- Add brightness (citrus, vinegar, fresh herbs)
- Add smokiness (smoked paprika, chipotle, grilled elements)
- Add aromatic spices (cumin, coriander, cinnamon, star anise)

Focus on bold, complementary flavors that elevate the dish.`,

    complexity: `Generate ${count} variations that adjust COMPLEXITY LEVEL:
- Quick weeknight version (30 min or less, fewer ingredients, shortcuts)
- Special occasion version (more steps, premium ingredients, impressive presentation)
- Meal prep friendly (batch cooking, stores well, reheats easily)
- One-pot/one-pan simplification (minimal cleanup)
- Restaurant-quality upgrade (refined techniques, plating, garnishes)

Keep the core dish recognizable but adjust effort/time/presentation.`,
  }

  const outputFormat = `
Output ONLY a valid JSON array with ${count} variations. No markdown, no explanation, just the JSON array:

[
  {
    "title": "Descriptive variation name",
    "description": "2-3 sentences explaining what makes this variation special and why someone would love it",
    "ingredients": "Complete ingredient list with quantities (use \\n for line breaks)",
    "instructions": "Step-by-step cooking instructions (use \\n for line breaks)",
    "prep_time": 15,
    "cook_time": 30,
    "servings": "4",
    "key_changes": ["Main change 1", "Main change 2", "Main change 3"],
    "notes": "Tips for success, substitutions, or serving suggestions"
  }
]

IMPORTANT:
- Return ONLY the JSON array, no markdown code blocks
- Use \\n for line breaks in ingredients and instructions
- Keep ingredients and instructions detailed but concise
- Make key_changes clear and actionable (3-5 items max)
- Ensure all variations are practical and achievable for home cooks
- Maintain the spirit of the original dish
`

  return basePrompt + variationInstructions[variationType] + outputFormat
}

/**
 * Parse JSON response from Claude, handling various formats
 */
function parseVariationsResponse(response: string): RecipeVariation[] {
  try {
    // Remove markdown code blocks if present
    let cleaned = response.trim()
    cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    cleaned = cleaned.trim()

    const parsed = JSON.parse(cleaned)

    // Ensure it's an array
    if (!Array.isArray(parsed)) {
      throw new Error('Response is not an array')
    }

    return parsed as RecipeVariation[]
  } catch (error) {
    console.error('Failed to parse variations response:', error)
    console.error('Raw response:', response)
    throw new Error('Failed to parse AI response. Please try again.')
  }
}

/**
 * Generate recipe variations using Claude API
 */
export async function generateRecipeVariations(
  recipe: Recipe,
  variationType: VariationType,
  count: number = 3,
  customParameter?: string
): Promise<RecipeVariation[]> {
  try {
    const prompt = buildVariationPrompt(recipe, variationType, count, customParameter)

    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    // Extract text from response
    const textContent = response.content.find((block) => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in response')
    }

    const variations = parseVariationsResponse(textContent.text)

    // Validate we got the expected number of variations
    if (variations.length === 0) {
      throw new Error('No variations generated')
    }

    return variations
  } catch (error) {
    console.error('Error generating variations:', error)
    throw new Error(
      error instanceof Error ? error.message : 'Failed to generate variations'
    )
  }
}

// Export types and helper function from variation-types.ts
export type { VariationType, RecipeVariation } from './variation-types'
export { getVariationTypeInfo } from './variation-types'
