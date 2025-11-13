'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { recipeSchema, type RecipeFormData, RECIPE_CATEGORIES } from '@/lib/schemas/recipe'
import { createRecipe, updateRecipe } from '@/lib/actions/recipes'
import { getRecipeBooks } from '@/lib/actions/recipe-books'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ImageUpload } from './ImageUpload'
import type { RecipeBook } from '@/lib/types/recipe-books'

interface RecipeFormProps {
  initialData?: RecipeFormData & { id?: string }
  mode?: 'create' | 'edit'
  additionalImages?: string[]
}

export function RecipeForm({ initialData, mode = 'create', additionalImages }: RecipeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [books, setBooks] = useState<RecipeBook[]>([])
  const [selectedBookId, setSelectedBookId] = useState<string>('')
  const [isLoadingBooks, setIsLoadingBooks] = useState(true)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: initialData || {
      is_favorite: false,
    },
  })

  // Load cookbooks on mount and set initial book if editing
  useEffect(() => {
    const loadBooks = async () => {
      setIsLoadingBooks(true)
      const result = await getRecipeBooks()
      if (result.books) {
        setBooks(result.books)
      }
      // Set initial book_id if editing
      if (mode === 'edit' && initialData?.book_id) {
        setSelectedBookId(initialData.book_id)
      }
      setIsLoadingBooks(false)
    }
    loadBooks()
  }, [])

  const onSubmit = async (data: RecipeFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      if (mode === 'edit' && initialData?.id) {
        await updateRecipe(initialData.id, data, selectedBookId || null)
      } else {
        await createRecipe(data, additionalImages, selectedBookId || undefined)
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-900">
          Recipe Title *
        </label>
        <input
          {...register('title')}
          type="text"
          id="title"
          className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="e.g., Grandma's Chocolate Chip Cookies"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Category and Cookbook Row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-900">
            Category
          </label>
          <select
            {...register('category')}
            id="category"
            className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select a category...</option>
            {RECIPE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        {/* Cookbook Selector - available in both create and edit modes */}
        <div>
          <label htmlFor="cookbook" className="block text-sm font-medium text-gray-900">
            Cookbook
          </label>
          <p className="mt-1 text-xs text-gray-500">
            {mode === 'create'
              ? 'Which cookbook should this recipe be saved to?'
              : 'Move this recipe to a different cookbook'}
          </p>
          <select
            id="cookbook"
            value={selectedBookId}
            onChange={(e) => setSelectedBookId(e.target.value)}
            disabled={isLoadingBooks}
            className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="">No specific cookbook</option>
            {books.map((book) => (
              <option key={book.id} value={book.id}>
                {book.is_shared ? '❤️ ' : ''}
                {book.name}
              </option>
            ))}
          </select>
          {isLoadingBooks && (
            <p className="mt-1 text-xs text-gray-500">Loading cookbooks...</p>
          )}
        </div>
      </div>

      {/* Time and Servings Row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div>
          <label htmlFor="prep_time" className="block text-sm font-medium text-gray-900">
            Prep Time (minutes)
          </label>
          <input
            {...register('prep_time', { valueAsNumber: true })}
            type="number"
            id="prep_time"
            min="0"
            className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="15"
          />
          {errors.prep_time && (
            <p className="mt-1 text-sm text-red-600">{errors.prep_time.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="cook_time" className="block text-sm font-medium text-gray-900">
            Cook Time (minutes)
          </label>
          <input
            {...register('cook_time', { valueAsNumber: true })}
            type="number"
            id="cook_time"
            min="0"
            className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="30"
          />
          {errors.cook_time && (
            <p className="mt-1 text-sm text-red-600">{errors.cook_time.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="servings" className="block text-sm font-medium text-gray-900">
            Servings
          </label>
          <input
            {...register('servings')}
            type="text"
            id="servings"
            className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="4-6 servings"
          />
          {errors.servings && (
            <p className="mt-1 text-sm text-red-600">{errors.servings.message}</p>
          )}
        </div>
      </div>

      {/* Ingredients */}
      <div>
        <label htmlFor="ingredients" className="block text-sm font-medium text-gray-900">
          Ingredients *
        </label>
        <p className="mt-1 text-sm text-gray-500">
          List each ingredient on a new line
        </p>
        <textarea
          {...register('ingredients')}
          id="ingredients"
          rows={8}
          className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="2 cups all-purpose flour&#10;1 cup butter, softened&#10;3/4 cup granulated sugar&#10;2 eggs"
        />
        {errors.ingredients && (
          <p className="mt-1 text-sm text-red-600">{errors.ingredients.message}</p>
        )}
      </div>

      {/* Instructions */}
      <div>
        <label htmlFor="instructions" className="block text-sm font-medium text-gray-900">
          Instructions *
        </label>
        <p className="mt-1 text-sm text-gray-500">
          Write step-by-step instructions
        </p>
        <textarea
          {...register('instructions')}
          id="instructions"
          rows={10}
          className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="1. Preheat oven to 375°F...&#10;2. Mix butter and sugar..."
        />
        {errors.instructions && (
          <p className="mt-1 text-sm text-red-600">{errors.instructions.message}</p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-900">
          Notes
        </label>
        <p className="mt-1 text-sm text-gray-500">
          Add any tips, substitutions, or personal notes
        </p>
        <textarea
          {...register('notes')}
          id="notes"
          rows={4}
          className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Can substitute chocolate chips with raisins..."
        />
        {errors.notes && (
          <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
        )}
      </div>

      {/* Family Story Section */}
      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <span>❤️</span>
          Family Story & Memories
          <span className="text-sm font-normal text-gray-500">(Optional)</span>
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Preserve the story and memories behind this recipe for future generations
        </p>

        {/* Recipe Story */}
        <div className="mb-6">
          <label htmlFor="story" className="block text-sm font-medium text-gray-900">
            Recipe Story
          </label>
          <p className="mt-1 text-sm text-gray-500">
            Share the story behind this recipe - where it came from, special memories, family history
          </p>
          <textarea
            {...register('story')}
            id="story"
            rows={4}
            className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="This was my grandmother's recipe from her wedding day in 1952. She would make it every Christmas morning..."
          />
          {errors.story && (
            <p className="mt-1 text-sm text-red-600">{errors.story.message}</p>
          )}
        </div>

        {/* Family Memories */}
        <div>
          <label htmlFor="family_memories_text" className="block text-sm font-medium text-gray-900">
            Family Memories (Tags)
          </label>
          <p className="mt-1 text-sm text-gray-500">
            Add memory tags separated by commas (e.g., "Christmas tradition, Kids favorite, Sunday dinners")
          </p>
          <input
            type="text"
            id="family_memories_text"
            defaultValue={initialData?.family_memories?.join(', ') || ''}
            onChange={(e) => {
              const tags = e.target.value
                .split(',')
                .map(t => t.trim())
                .filter(t => t.length > 0)
              setValue('family_memories', tags.length > 0 ? tags : undefined)
            }}
            className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Christmas tradition, Kids favorite, Sunday dinners"
          />
          {errors.family_memories && (
            <p className="mt-1 text-sm text-red-600">{errors.family_memories.message}</p>
          )}
        </div>
      </div>

      {/* Image Upload */}
      <ImageUpload
        currentImageUrl={initialData?.image_url}
        onImageChange={(url) => setValue('image_url', url)}
      />

      {/* Source */}
      <div>
        <label htmlFor="source" className="block text-sm font-medium text-gray-900">
          Source
        </label>
        <input
          {...register('source')}
          type="text"
          id="source"
          className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Family recipe, cookbook, website..."
        />
        {errors.source && (
          <p className="mt-1 text-sm text-red-600">{errors.source.message}</p>
        )}
      </div>

      {/* Rating and Favorite */}
      <div className="flex items-center gap-8">
        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-gray-900">
            Rating (1-5)
          </label>
          <select
            {...register('rating', { valueAsNumber: true })}
            id="rating"
            className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">No rating</option>
            <option value="1">⭐ 1 star</option>
            <option value="2">⭐⭐ 2 stars</option>
            <option value="3">⭐⭐⭐ 3 stars</option>
            <option value="4">⭐⭐⭐⭐ 4 stars</option>
            <option value="5">⭐⭐⭐⭐⭐ 5 stars</option>
          </select>
          {errors.rating && (
            <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
          )}
        </div>

        <div className="flex items-center">
          <input
            {...register('is_favorite')}
            type="checkbox"
            id="is_favorite"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="is_favorite" className="ml-2 block text-sm text-gray-900">
            Mark as favorite
          </label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-4 border-t border-gray-200 pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
        >
          {isSubmitting
            ? mode === 'edit'
              ? 'Updating...'
              : 'Creating...'
            : mode === 'edit'
            ? 'Update Recipe'
            : 'Create Recipe'}
        </button>
      </div>
    </form>
  )
}
