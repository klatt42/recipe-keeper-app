'use client'

import { Heart, Calendar, Users } from 'lucide-react'
import type { Recipe } from '@/lib/schemas/recipe'

interface RecipeStoryCardProps {
  recipe: Recipe
}

interface PhotoMemory {
  url: string
  caption?: string
  year?: number
}

export function RecipeStoryCard({ recipe }: RecipeStoryCardProps) {
  // Don't render if there's no story content
  if (!recipe.story && (!recipe.family_memories || recipe.family_memories.length === 0)) {
    return null
  }

  const photoMemories = (recipe.photo_memories as PhotoMemory[] | undefined) || []

  return (
    <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 rounded-lg p-6 sm:p-8 border-2 border-rose-200 dark:border-rose-800 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-rose-100 dark:bg-rose-900 rounded-full">
          <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400 fill-rose-600 dark:fill-rose-400" />
        </div>
        <h3 className="text-xl font-bold text-rose-900 dark:text-rose-100">
          Family Story
        </h3>
      </div>

      {/* Story Text */}
      {recipe.story && (
        <div className="mb-6">
          <blockquote className="relative">
            <div className="text-4xl text-rose-300 dark:text-rose-700 absolute -top-2 -left-1 font-serif">
              "
            </div>
            <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed pl-6 text-base sm:text-lg">
              {recipe.story}
            </p>
            <div className="text-4xl text-rose-300 dark:text-rose-700 absolute -bottom-6 right-0 font-serif">
              "
            </div>
          </blockquote>
        </div>
      )}

      {/* Family Memories Tags */}
      {recipe.family_memories && recipe.family_memories.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-rose-700 dark:text-rose-400" />
            <h4 className="font-semibold text-sm text-rose-800 dark:text-rose-300">
              Family Memories
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {recipe.family_memories.map((memory, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full text-sm text-gray-700 dark:text-gray-300 shadow-sm border border-rose-200 dark:border-rose-800 hover:shadow-md transition-shadow"
              >
                <span className="text-rose-500 dark:text-rose-400">❤</span>
                {memory}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Photo Memories */}
      {photoMemories.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-rose-700 dark:text-rose-400" />
            <h4 className="font-semibold text-sm text-rose-800 dark:text-rose-300">
              Photo Memories
            </h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photoMemories.map((photo, i) => (
              <div
                key={i}
                className="relative aspect-square rounded-lg overflow-hidden border-2 border-white dark:border-gray-700 shadow-md hover:shadow-xl transition-shadow group"
              >
                <img
                  src={photo.url}
                  alt={photo.caption || `Family memory ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                {(photo.caption || photo.year) && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-3 transform translate-y-full group-hover:translate-y-0 transition-transform">
                    {photo.caption && (
                      <p className="text-xs text-white font-medium mb-0.5">
                        {photo.caption}
                      </p>
                    )}
                    {photo.year && (
                      <p className="text-xs text-gray-300">
                        {photo.year}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decorative Bottom Border */}
      <div className="mt-6 pt-4 border-t border-rose-200 dark:border-rose-800">
        <p className="text-xs text-center text-rose-600 dark:text-rose-400 italic">
          Preserving family recipes and memories for generations to come
        </p>
      </div>
    </div>
  )
}
