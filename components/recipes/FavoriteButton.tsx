'use client'

import { useState } from 'react'
import { toggleFavorite } from '@/lib/actions/recipes'

interface FavoriteButtonProps {
  recipeId: string
  initialIsFavorite: boolean
}

export function FavoriteButton({ recipeId, initialIsFavorite }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    const newValue = !isFavorite
    setIsFavorite(newValue)

    const result = await toggleFavorite(recipeId, newValue)

    if (!result.success) {
      // Revert on error
      setIsFavorite(!newValue)
    }
    setIsLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`rounded-md px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset transition-colors ${
        isFavorite
          ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20 hover:bg-yellow-100'
          : 'bg-white text-gray-700 ring-gray-300 hover:bg-gray-50'
      } disabled:opacity-50`}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        className="h-5 w-5"
        fill={isFavorite ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    </button>
  )
}
