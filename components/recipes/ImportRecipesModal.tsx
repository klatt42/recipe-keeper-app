'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getRecipesFromCookbook, bulkCopyRecipes } from '@/lib/actions/recipes'
import { getRecipeBooks } from '@/lib/actions/recipe-books'
import type { Recipe } from '@/lib/schemas/recipe'
import type { RecipeBook } from '@/lib/types/recipe-books'
import { Loader2 } from 'lucide-react'

interface ImportRecipesModalProps {
  targetBookId: string | null
  targetBookName: string
  isOpen: boolean
  onClose: () => void
}

export function ImportRecipesModal({ targetBookId, targetBookName, isOpen, onClose }: ImportRecipesModalProps) {
  const router = useRouter()
  const [books, setBooks] = useState<RecipeBook[]>([])
  const [selectedSourceBookId, setSelectedSourceBookId] = useState<string | null>(null)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'select-cookbook' | 'select-recipes'>('select-cookbook')

  useEffect(() => {
    if (isOpen) {
      loadBooks()
      setStep('select-cookbook')
      setSelectedSourceBookId(null)
      setRecipes([])
      setSelectedRecipeIds(new Set())
      setError(null)
    }
  }, [isOpen])

  const loadBooks = async () => {
    const result = await getRecipeBooks()
    if (result.books) {
      // Filter out the current target book
      const availableBooks = result.books.filter(b => b.id !== targetBookId)
      setBooks(availableBooks)
    }
  }

  const handleSelectSourceBook = async (bookId: string | null) => {
    setSelectedSourceBookId(bookId)
    setIsLoading(true)
    setError(null)

    const result = await getRecipesFromCookbook(bookId)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    setRecipes(result.recipes)
    setIsLoading(false)
    setStep('select-recipes')
  }

  const toggleRecipeSelection = (recipeId: string) => {
    const newSelection = new Set(selectedRecipeIds)
    if (newSelection.has(recipeId)) {
      newSelection.delete(recipeId)
    } else {
      newSelection.add(recipeId)
    }
    setSelectedRecipeIds(newSelection)
  }

  const selectAll = () => {
    setSelectedRecipeIds(new Set(recipes.map(r => r.id)))
  }

  const deselectAll = () => {
    setSelectedRecipeIds(new Set())
  }

  const handleImport = async () => {
    if (selectedRecipeIds.size === 0) {
      setError('Please select at least one recipe to import')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const result = await bulkCopyRecipes(Array.from(selectedRecipeIds), targetBookId)

    if (result.success) {
      onClose()
      router.refresh()
    } else {
      setError(result.error || 'Failed to import recipes')
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    setStep('select-cookbook')
    setRecipes([])
    setSelectedRecipeIds(new Set())
    setError(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        {/* Modal */}
        <div className="relative w-full max-w-4xl transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold leading-6 text-gray-900">
                  Import Recipes to {targetBookName}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {step === 'select-cookbook'
                    ? 'Choose a cookbook to import recipes from'
                    : `Select recipes to import (${selectedRecipeIds.size} selected)`
                  }
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Step 1: Select Cookbook */}
            {step === 'select-cookbook' && (
              <div className="space-y-3">
                {/* Option: All Recipes (no cookbook) */}
                {targetBookId !== null && (
                  <button
                    onClick={() => handleSelectSourceBook(null)}
                    className="w-full rounded-lg border-2 border-gray-200 p-4 text-left hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">📚</div>
                      <div>
                        <div className="font-medium text-gray-900">All Recipes (No Cookbook)</div>
                        <div className="text-sm text-gray-500">Recipes not in any cookbook</div>
                      </div>
                    </div>
                  </button>
                )}

                {/* Cookbook Options */}
                {books.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => handleSelectSourceBook(book.id)}
                    className="w-full rounded-lg border-2 border-gray-200 p-4 text-left hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{book.is_family_book ? '❤️' : '📖'}</div>
                      <div>
                        <div className="font-medium text-gray-900">{book.name}</div>
                        {book.is_family_book && (
                          <div className="text-sm text-rose-600">Family Cookbook</div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}

                {books.length === 0 && targetBookId !== null && (
                  <div className="text-center py-8 text-gray-500">
                    No other cookbooks available to import from
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Select Recipes */}
            {step === 'select-recipes' && (
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <>
                    {/* Selection Controls */}
                    {recipes.length > 0 && (
                      <div className="flex items-center justify-between border-b pb-3">
                        <div className="text-sm text-gray-600">
                          {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} available
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={selectAll}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Select All
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={deselectAll}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Deselect All
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Recipe Grid */}
                    {recipes.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        No recipes found in this cookbook
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2">
                        {recipes.map((recipe) => {
                          const isSelected = selectedRecipeIds.has(recipe.id)
                          return (
                            <div
                              key={recipe.id}
                              onClick={() => toggleRecipeSelection(recipe.id)}
                              className={`relative cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${
                                isSelected
                                  ? 'border-blue-500 ring-2 ring-blue-200'
                                  : 'border-gray-200 hover:border-blue-300'
                              }`}
                            >
                              {/* Selection Checkbox */}
                              <div className="absolute top-2 right-2 z-10">
                                <div className={`h-6 w-6 rounded-md border-2 flex items-center justify-center ${
                                  isSelected
                                    ? 'bg-blue-600 border-blue-600'
                                    : 'bg-white border-gray-300'
                                }`}>
                                  {isSelected && (
                                    <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                              </div>

                              {/* Recipe Image */}
                              <div className="aspect-square bg-gray-100">
                                {recipe.image_url ? (
                                  <img
                                    src={recipe.image_url}
                                    alt={recipe.title}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-gray-400">
                                    <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                              </div>

                              {/* Recipe Title */}
                              <div className="p-2 bg-white">
                                <p className="text-xs font-medium text-gray-900 line-clamp-2">
                                  {recipe.title}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-3">
            {step === 'select-cookbook' ? (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:w-auto"
              >
                Cancel
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={isSubmitting || selectedRecipeIds.size === 0}
                  className="inline-flex w-full justify-center items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    `Import ${selectedRecipeIds.size} Recipe${selectedRecipeIds.size !== 1 ? 's' : ''}`
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 sm:w-auto"
                >
                  Back
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
