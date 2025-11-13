import Link from 'next/link'
import { Recipe } from '@/lib/schemas/recipe'

interface RecipeCardProps {
  recipe: Recipe
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0)

  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="group relative block overflow-hidden rounded-xl border-3 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg transition-all hover:shadow-2xl hover:border-[#39ff14] hover:scale-105 hover:-translate-y-1"
    >
      {/* Neon glow effect on hover */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute inset-0 rounded-xl shadow-[0_0_15px_rgba(57,255,20,0.5)]"></div>
      </div>

      {/* Image placeholder or actual image */}
      <div className="aspect-video w-full bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 relative overflow-hidden">
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg
              className="h-20 w-20 text-green-300 dark:text-green-700 group-hover:text-emerald-400 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
        )}
        {/* Decorative corner accent */}
        <div className="absolute top-2 right-2 w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full opacity-20 group-hover:opacity-40 transition-opacity"></div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title and favorite */}
        <div className="mb-2 flex items-start justify-between">
          <h3 className="flex-1 text-lg font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {recipe.title}
            {recipe.parent_recipe_id && (
              <span className="ml-2 text-sm font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                ✨ Variation
              </span>
            )}
          </h3>
          {recipe.is_favorite && (
            <span className="ml-2 text-yellow-400 group-hover:text-yellow-500 animate-pulse">
              <svg
                className="h-6 w-6 drop-shadow-lg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </span>
          )}
        </div>

        {/* Category badge, Source, and Submitter */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {recipe.category && (
            <span className="inline-block rounded-full bg-gradient-to-r from-orange-400 to-red-500 px-3 py-1 text-xs font-bold text-white shadow-md border-2 border-orange-600">
              🏷️ {recipe.category}
            </span>
          )}
          {recipe.source && (
            <span className="inline-block rounded-full bg-gradient-to-r from-purple-400 to-pink-500 px-3 py-1 text-xs font-bold text-white shadow-md border-2 border-purple-600">
              📖 {recipe.source}
            </span>
          )}
          {recipe.submitter && (
            <span className="inline-block rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 px-3 py-1 text-xs font-bold text-white shadow-md border-2 border-blue-600">
              👨‍🍳 {recipe.submitter.raw_user_meta_data?.full_name || recipe.submitter.email}
            </span>
          )}
        </div>

        {/* Meta information */}
        <div className="flex flex-wrap gap-3 text-sm font-semibold">
          {totalTime > 0 && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 px-2.5 py-1 rounded-lg border-2 border-green-400 dark:border-green-600">
              <svg
                className="h-4 w-4 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-green-700 dark:text-green-300">⏱️ {totalTime}m</span>
            </div>
          )}
          {recipe.servings && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 px-2.5 py-1 rounded-lg border-2 border-blue-400 dark:border-blue-600">
              <svg
                className="h-4 w-4 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="text-blue-700 dark:text-blue-300">🍽️ {recipe.servings}</span>
            </div>
          )}
          {recipe.rating && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 px-2.5 py-1 rounded-lg border-2 border-yellow-400 dark:border-yellow-600">
              <svg
                className="h-4 w-4 text-yellow-500 dark:text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-yellow-700 dark:text-yellow-300">⭐ {recipe.rating}/5</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
