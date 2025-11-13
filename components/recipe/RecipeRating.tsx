'use client'

import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { toast } from 'sonner'
import { setRecipeRating, deleteRecipeRating, getRecipeRatingStats } from '@/lib/actions/ratings'
import type { RecipeRatingStats } from '@/lib/types/comments'

interface RecipeRatingProps {
  recipeId: string
  initialStats: RecipeRatingStats
}

export function RecipeRating({ recipeId, initialStats }: RecipeRatingProps) {
  const [stats, setStats] = useState<RecipeRatingStats>(initialStats)
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRating = async (rating: number) => {
    setIsSubmitting(true)

    try {
      const result = await setRecipeRating(recipeId, { rating })

      if (result.success && result.stats) {
        setStats(result.stats)
        toast.success(`Rated ${rating} star${rating > 1 ? 's' : ''}!`, {
          description: 'Your rating has been saved'
        })
      } else {
        toast.error(result.error || 'Failed to save rating')
      }
    } catch (error) {
      toast.error('Failed to save rating')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveRating = async () => {
    setIsSubmitting(true)

    try {
      const result = await deleteRecipeRating(recipeId)

      if (result.success && result.stats) {
        setStats(result.stats)
        toast.success('Rating removed')
      } else {
        toast.error(result.error || 'Failed to remove rating')
      }
    } catch (error) {
      toast.error('Failed to remove rating')
    } finally {
      setIsSubmitting(false)
    }
  }

  const displayRating = hoveredRating || stats.user_rating || 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Rate this Recipe</h3>
          {stats.rating_count > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="ml-1 text-sm font-medium text-gray-900 dark:text-white">
                  {stats.average_rating?.toFixed(1)}
                </span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({stats.rating_count} rating{stats.rating_count !== 1 ? 's' : ''})
              </span>
            </div>
          )}
        </div>

        {stats.user_rating && (
          <button
            onClick={handleRemoveRating}
            disabled={isSubmitting}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
          >
            Remove my rating
          </button>
        )}
      </div>

      {/* Star Rating Input */}
      <div
        className="flex items-center gap-1"
        onMouseLeave={() => setHoveredRating(null)}
      >
        {[1, 2, 3, 4, 5].map((rating) => {
          const isFilled = rating <= displayRating
          const isUserRated = rating === stats.user_rating

          return (
            <button
              key={rating}
              onClick={() => handleRating(rating)}
              onMouseEnter={() => setHoveredRating(rating)}
              disabled={isSubmitting}
              className={`
                group relative p-1 transition-all disabled:cursor-not-allowed
                ${isUserRated ? 'scale-110' : 'hover:scale-110'}
              `}
              title={`Rate ${rating} star${rating > 1 ? 's' : ''}`}
            >
              <Star
                className={`
                  w-8 h-8 transition-colors
                  ${isFilled
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-none text-gray-300 dark:text-gray-600'
                  }
                  ${!isSubmitting && 'group-hover:fill-yellow-300 group-hover:text-yellow-300'}
                `}
              />
              {isUserRated && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full" />
              )}
            </button>
          )
        })}
      </div>

      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        {stats.user_rating
          ? 'Click a star to change your rating'
          : 'Click a star to rate this recipe'}
      </p>
    </div>
  )
}
