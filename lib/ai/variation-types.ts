export type VariationType =
  | 'dietary'
  | 'cuisine'
  | 'technique'
  | 'seasonal'
  | 'flavor'
  | 'complexity'

export interface RecipeVariation {
  title: string
  description: string
  ingredients: string
  instructions: string
  prep_time?: number
  cook_time?: number
  servings?: string
  key_changes: string[]
  notes?: string
}

/**
 * Get variation type display name and description
 * Safe to use in client components
 */
export function getVariationTypeInfo(type: VariationType): {
  name: string
  description: string
  icon: string
} {
  const info: Record<
    VariationType,
    { name: string; description: string; icon: string }
  > = {
    dietary: {
      name: 'Dietary Adaptations',
      description: 'Vegan, gluten-free, keto, paleo, and other dietary variations',
      icon: '🥗',
    },
    cuisine: {
      name: 'Cuisine Swaps',
      description: 'Transform into different cultural and regional styles',
      icon: '🌍',
    },
    technique: {
      name: 'Cooking Techniques',
      description: 'Change how the dish is prepared (air fryer, slow cooker, etc.)',
      icon: '👨‍🍳',
    },
    seasonal: {
      name: 'Seasonal Variations',
      description: 'Adapt with seasonal ingredients and cooking methods',
      icon: '🍂',
    },
    flavor: {
      name: 'Flavor Profiles',
      description: 'Add heat, sweetness, umami, or aromatic spices',
      icon: '🌶️',
    },
    complexity: {
      name: 'Complexity Levels',
      description: 'Quick weeknight or special occasion versions',
      icon: '⏱️',
    },
  }

  return info[type]
}
