'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FavoriteButton } from './FavoriteButton'
import { DeleteButton } from './DeleteButton'
import { ShareButton } from './ShareButton'
import { ShareRecipeButton } from '@/components/recipe/ShareRecipeButton'
import { PrintButton } from './PrintButton'
import { RecipeImageGallery } from './RecipeImageGallery'
import { PrintRecipeModal } from './PrintRecipeModal'
import { CopyRecipeModal } from './CopyRecipeModal'
import { VariationsSection } from '@/components/recipe/variations/VariationsSection'
import { NutritionPanel } from '@/components/recipe/nutrition/NutritionPanel'
import { ServingSizeScaler } from '@/components/recipe/serving/ServingSizeScaler'
import { ShoppingList } from '@/components/recipe/ShoppingList'
import { RecipeTimeline } from '@/components/recipe/RecipeTimeline'
import { QuickCookMode } from '@/components/recipe/QuickCookMode'
import { RecipeStoryCard } from '@/components/recipe/RecipeStoryCard'
import { RecipeRating } from '@/components/recipe/RecipeRating'
import { RecipeComments } from '@/components/recipe/RecipeComments'
import type { Recipe } from '@/lib/schemas/recipe'
import type { RecipeImage } from '@/lib/types'
import type { RecipeComment, RecipeRatingStats } from '@/lib/types/comments'

interface RecipeDetailClientProps {
  recipe: Recipe
  images: RecipeImage[]
  parentRecipe?: { id: string; title: string } | null
  comments: RecipeComment[]
  ratingStats: RecipeRatingStats
  currentUserId?: string
}

export function RecipeDetailClient({ recipe, images, parentRecipe, comments, ratingStats, currentUserId }: RecipeDetailClientProps) {
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false)
  const [currentServings, setCurrentServings] = useState(parseInt(recipe.servings) || 4)
  const [scaledIngredients, setScaledIngredients] = useState(recipe.ingredients)

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0)
  const originalServings = parseInt(recipe.servings) || 4

  const handleServingsChange = (newServings: number, newIngredients: string) => {
    setCurrentServings(newServings)
    setScaledIngredients(newIngredients)
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 print:bg-white">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 print:px-0 print:py-0">
          {/* Header */}
          <div className="mb-8 print:hidden">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to recipes
            </Link>
          </div>

          {/* Recipe Content */}
          <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow dark:shadow-xl print:shadow-none print:rounded-none">
            {/* Image */}
            {recipe.image_url && (
              <div className="w-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center print:max-h-96">
                <img
                  src={recipe.image_url}
                  alt={recipe.title}
                  className="max-h-[600px] w-auto object-contain print:object-contain"
                />
              </div>
            )}

            <div className="p-6 sm:p-8">
              {/* Title and Actions */}
              <div className="mb-6 flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {recipe.title}
                  </h1>
                  {/* Variation Badge */}
                  {parentRecipe && (
                    <div className="mt-3">
                      <Link
                        href={`/recipes/${parentRecipe.id}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 px-4 py-2 text-sm font-medium text-amber-900 border border-amber-200 hover:from-amber-100 hover:to-orange-100 transition-colors"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Variation from "{parentRecipe.title}"</span>
                      </Link>
                    </div>
                  )}
                  {recipe.category && (
                    <span className="mt-3 inline-block rounded-full bg-blue-100 dark:bg-blue-900 px-3 py-1 text-sm font-medium text-blue-800 dark:text-blue-200">
                      {recipe.category}
                    </span>
                  )}
                  {recipe.source && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Source: {recipe.source}
                    </p>
                  )}
                  {recipe.submitter && (
                    <p className="mt-1 text-sm text-rose-600">
                      Submitted by: {recipe.submitter.raw_user_meta_data?.full_name || recipe.submitter.email}
                    </p>
                  )}
                </div>
                <div className="ml-4 flex flex-wrap gap-2 print:hidden">
                  <FavoriteButton
                    recipeId={recipe.id}
                    initialIsFavorite={recipe.is_favorite}
                  />
                  <button
                    onClick={() => setIsCopyModalOpen(true)}
                    className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    title="Copy or move to another cookbook"
                  >
                    <svg className="inline-block mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy/Move
                  </button>
                  <PrintButton onClick={() => setIsPrintModalOpen(true)} />
                  <ShareRecipeButton
                    recipe={recipe}
                    recipeUrl={typeof window !== 'undefined' ? window.location.href : ''}
                  />
                  <Link
                    href={`/recipes/${recipe.id}/edit`}
                    className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    Edit
                  </Link>
                  <DeleteButton recipeId={recipe.id} />
                </div>
              </div>

              {/* Meta Information */}
              <div className="mb-8 flex flex-wrap gap-6 border-b border-gray-200 pb-6">
                {totalTime > 0 && (
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5 text-gray-400"
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
                    <div>
                      <p className="text-sm font-medium text-gray-900">Total Time</p>
                      <p className="text-sm text-gray-600">{totalTime} minutes</p>
                    </div>
                  </div>
                )}
                {recipe.prep_time && (
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5 text-gray-400"
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
                    <div>
                      <p className="text-sm font-medium text-gray-900">Prep</p>
                      <p className="text-sm text-gray-600">{recipe.prep_time} min</p>
                    </div>
                  </div>
                )}
                {recipe.cook_time && (
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Cook</p>
                      <p className="text-sm text-gray-600">{recipe.cook_time} min</p>
                    </div>
                  </div>
                )}
                {recipe.servings && (
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5 text-gray-400"
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
                    <div>
                      <p className="text-sm font-medium text-gray-900">Servings</p>
                      <p className="text-sm text-gray-600">{recipe.servings}</p>
                    </div>
                  </div>
                )}
                {recipe.rating && (
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Rating</p>
                      <p className="text-sm text-gray-600">{recipe.rating}/5</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Recipe Timeline */}
              <div className="mb-8 print:hidden">
                <RecipeTimeline
                  prepTime={recipe.prep_time}
                  cookTime={recipe.cook_time}
                />
              </div>

              {/* Serving Size Scaler */}
              <ServingSizeScaler
                originalServings={originalServings}
                ingredients={recipe.ingredients}
                onServingsChange={handleServingsChange}
              />

              {/* Ingredients */}
              <div className="mb-8">
                <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Ingredients</h2>
                <div className="rounded-lg bg-gray-50 dark:bg-gray-700 p-6">
                  <ul className="space-y-2">
                    {scaledIngredients.split('\n').map((ingredient, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" />
                        <span className="text-gray-700 dark:text-gray-300">{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Shopping List Mode */}
              <div className="mb-8 print:hidden">
                <ShoppingList
                  recipeId={recipe.id}
                  recipeTitle={recipe.title}
                  ingredients={scaledIngredients}
                  servings={currentServings}
                />
              </div>

              {/* Instructions */}
              <div className="mb-8">
                <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Instructions</h2>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                    {recipe.instructions}
                  </div>
                </div>
              </div>

              {/* Quick Cook Mode */}
              <div className="mb-8 print:hidden">
                <QuickCookMode recipe={recipe} />
              </div>

              {/* Notes */}
              {recipe.notes && (
                <div className="mb-8">
                  <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Notes</h2>
                  <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/30 p-6">
                    <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{recipe.notes}</p>
                  </div>
                </div>
              )}

              {/* Family Story Card */}
              <div className="mb-8 print:hidden">
                <RecipeStoryCard recipe={recipe} />
              </div>

              {/* Recipe Images Gallery */}
              <div className="print:hidden">
                <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Recipe Images</h2>
                <RecipeImageGallery
                  recipeId={recipe.id}
                  images={images}
                  primaryImageUrl={recipe.image_url}
                />
              </div>
            </div>
          </div>

          {/* Nutrition Facts */}
          <div className="mt-8 print:hidden">
            <NutritionPanel
              recipeId={recipe.id}
              servings={currentServings}
            />
          </div>

          {/* AI Recipe Variations */}
          <div className="mt-8 print:hidden">
            <VariationsSection recipeId={recipe.id} bookId={recipe.book_id} />
          </div>

          {/* Recipe Rating */}
          <div className="mt-8 print:hidden">
            <RecipeRating recipeId={recipe.id} initialStats={ratingStats} />
          </div>

          {/* Recipe Comments */}
          <div className="mt-8 print:hidden">
            <RecipeComments
              recipeId={recipe.id}
              initialComments={comments}
              currentUserId={currentUserId}
            />
          </div>
        </div>
      </div>

      {/* Print Modal */}
      <PrintRecipeModal
        recipe={recipe}
        images={images}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />

      {/* Copy/Move Modal */}
      <CopyRecipeModal
        recipeId={recipe.id}
        recipeTitle={recipe.title}
        currentBookId={recipe.book_id}
        isOpen={isCopyModalOpen}
        onClose={() => setIsCopyModalOpen(false)}
      />
    </>
  )
}
