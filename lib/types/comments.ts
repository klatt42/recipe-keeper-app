import { z } from 'zod'

// Database types
export interface RecipeComment {
  id: string
  recipe_id: string
  user_id: string
  parent_id: string | null
  content: string
  created_at: string
  updated_at: string
  // Joined profile data from public.profiles
  profile?: {
    id: string
    display_name?: string
  }
  // For threaded display
  replies?: RecipeComment[]
}

export interface RecipeRating {
  id: string
  recipe_id: string
  user_id: string
  rating: number
  created_at: string
  updated_at: string
  // Joined data
  user?: {
    id: string
    email: string
    raw_user_meta_data?: {
      full_name?: string
    }
  }
}

export interface RecipeRatingStats {
  average_rating: number | null
  rating_count: number
  user_rating?: number | null
}

// Validation schemas
export const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment is too long'),
  parent_id: z.string().uuid().optional().nullable(),
})

export type CommentFormData = z.infer<typeof commentSchema>

export const ratingSchema = z.object({
  rating: z.number().int().min(1).max(5),
})

export type RatingFormData = z.infer<typeof ratingSchema>
