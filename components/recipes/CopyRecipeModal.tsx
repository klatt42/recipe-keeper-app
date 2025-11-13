'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { copyRecipeToCookbook } from '@/lib/actions/recipes'
import { getRecipeBooks } from '@/lib/actions/recipe-books'
import type { RecipeBook } from '@/lib/types/recipe-books'

interface CopyRecipeModalProps {
  recipeId: string
  recipeTitle: string
  currentBookId: string | null
  isOpen: boolean
  onClose: () => void
}

export function CopyRecipeModal({ recipeId, recipeTitle, currentBookId, isOpen, onClose }: CopyRecipeModalProps) {
  const router = useRouter()
  const [books, setBooks] = useState<RecipeBook[]>([])
  const [selectedBookId, setSelectedBookId] = useState<string>('')
  const [actionType, setActionType] = useState<'copy' | 'move'>('copy')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadBooks()
    }
  }, [isOpen])

  const loadBooks = async () => {
    const result = await getRecipeBooks()
    if (result.books) {
      // Filter out the current book
      const availableBooks = result.books.filter(b => b.id !== currentBookId)
      setBooks(availableBooks)
    }
  }

  const handleSubmit = async () => {
    if (!selectedBookId && selectedBookId !== null) {
      setError('Please select a cookbook')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const targetBookId = selectedBookId === 'none' ? null : selectedBookId
    const shouldMove = actionType === 'move'

    const result = await copyRecipeToCookbook(recipeId, targetBookId, shouldMove)

    if (result.success) {
      onClose()
      // Use router.refresh() instead of window.location.reload() to avoid 500 error
      router.refresh()
    } else {
      setError(result.error || 'Failed to copy/move recipe')
      setIsSubmitting(false)
    }
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
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="mt-3 flex-1 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 className="text-lg font-semibold leading-6 text-gray-900">
                  Copy or Move Recipe
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Recipe: <span className="font-medium">{recipeTitle}</span>
                </p>

                <div className="mt-4 space-y-4">
                  {/* Action Type */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Action</label>
                    <div className="mt-2 flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="copy"
                          checked={actionType === 'copy'}
                          onChange={(e) => setActionType(e.target.value as 'copy' | 'move')}
                          className="mr-2 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600"
                        />
                        <span className="text-sm text-gray-700">
                          Copy (keep original)
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="move"
                          checked={actionType === 'move'}
                          onChange={(e) => setActionType(e.target.value as 'copy' | 'move')}
                          className="mr-2 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600"
                        />
                        <span className="text-sm text-gray-700">
                          Move (remove from current)
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Cookbook Selection */}
                  <div>
                    <label htmlFor="cookbook" className="block text-sm font-medium text-gray-700">
                      Destination Cookbook
                    </label>
                    <select
                      id="cookbook"
                      value={selectedBookId}
                      onChange={(e) => setSelectedBookId(e.target.value)}
                      className="mt-2 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select a cookbook...</option>
                      {!currentBookId && (
                        <option value="none">All Recipes (no cookbook)</option>
                      )}
                      {books.map((book) => (
                        <option key={book.id} value={book.id}>
                          {book.is_family_book ? '❤️ ' : '📖 '}
                          {book.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Info Box */}
                  <div className="rounded-lg bg-blue-50 p-3">
                    <p className="text-xs text-blue-800">
                      {actionType === 'copy' ? (
                        <>
                          <strong>Copy:</strong> Creates a duplicate of this recipe in the selected cookbook.
                          The original will remain in its current location. The copy will be titled "{recipeTitle} (Copy)".
                        </>
                      ) : (
                        <>
                          <strong>Move:</strong> Moves this recipe to the selected cookbook.
                          It will be removed from {currentBookId ? 'its current cookbook' : 'All Recipes'}.
                        </>
                      )}
                    </p>
                  </div>

                  {error && (
                    <div className="rounded-lg bg-red-50 p-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedBookId}
              className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto"
            >
              {isSubmitting ? 'Processing...' : actionType === 'copy' ? 'Copy Recipe' : 'Move Recipe'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 sm:mt-0 sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
