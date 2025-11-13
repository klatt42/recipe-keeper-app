import { z } from 'zod'

export const recipeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  category: z.string().optional(),
  prep_time: z.number().min(0).optional(),
  cook_time: z.number().min(0).optional(),
  servings: z.string().optional(),
  ingredients: z.string().min(1, 'Ingredients are required'),
  instructions: z.string().min(1, 'Instructions are required'),
  notes: z.string().optional(),
  source: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  rating: z.number().min(1).max(5).optional(),
  is_favorite: z.boolean().default(false),
  story: z.string().optional(),
  family_memories: z.array(z.string()).optional(),
  photo_memories: z.array(z.object({
    url: z.string().url(),
    caption: z.string().optional(),
    year: z.number().optional(),
  })).optional(),
})

export const RECIPE_CATEGORIES = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Dessert',
  'Appetizer',
  'Snack',
  'Beverage',
  'Salad',
  'Soup',
  'Side Dish',
  'Main Course',
  'Baking',
  'Other',
] as const

export type RecipeFormData = z.infer<typeof recipeSchema>

export interface Recipe extends RecipeFormData {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  parent_recipe_id?: string | null
  variation_type?: string | null
  last_viewed_at?: string | null
  last_cooked_at?: string | null
  view_count: number
  cook_count: number
  book_id?: string | null
  submitted_by?: string | null
  submitter?: {
    email: string
    raw_user_meta_data?: {
      full_name?: string
      avatar_url?: string
    }
  } | null
}
