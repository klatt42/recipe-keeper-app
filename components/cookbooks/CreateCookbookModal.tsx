'use client'

import { useState } from 'react'
import { createRecipeBook } from '@/lib/actions/recipe-books'

interface CreateCookbookModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function CreateCookbookModal({ isOpen, onClose, onSuccess }: CreateCookbookModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isShared, setIsShared] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const result = await createRecipeBook({
      name,
      description: description || undefined,
      is_shared: isShared,
    })

    if (result.success) {
      setName('')
      setDescription('')
      setIsShared(false)
      onClose()
      onSuccess?.()
    } else {
      setError(result.error || 'Failed to create cookbook')
    }

    setIsSubmitting(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-5 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Create New Cookbook</h2>
                <p className="text-sm text-gray-600">Start collecting your favorite recipes</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-white hover:text-gray-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 p-4 border border-red-200">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Cookbook Type Selection */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsShared(false)}
              className={`relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all ${
                !isShared
                  ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                  !isShared ? 'bg-gradient-to-br from-gray-500 to-gray-700' : 'bg-gray-200'
                } text-white`}>
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Personal</div>
                  <div className="text-xs text-gray-600">Just for me</div>
                </div>
              </div>
              {!isShared && (
                <div className="absolute top-2 right-2">
                  <svg className="h-5 w-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsShared(true)}
              className={`relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all ${
                isShared
                  ? 'border-rose-500 bg-gradient-to-br from-rose-50 to-pink-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                  isShared ? 'bg-gradient-to-br from-rose-500 to-pink-600' : 'bg-gray-200'
                } text-white`}>
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Family</div>
                  <div className="text-xs text-gray-600">Shared cookbook</div>
                </div>
              </div>
              {isShared && (
                <div className="absolute top-2 right-2">
                  <svg className="h-5 w-5 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          </div>

          {/* Family Cookbook Message */}
          {isShared && (
            <div className="rounded-lg bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-rose-900">Family Cookbook</h4>
                  <p className="mt-1 text-xs text-rose-800">
                    Perfect for preserving Grandma's recipes! You can invite family members to view, add, and edit recipes together.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Cookbook Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
              Cookbook Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder={isShared ? "Smith Family Recipes" : "My Favorite Recipes"}
              className="block w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:ring-offset-0 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
              Description <span className="text-gray-500 font-normal">(optional)</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder={isShared ? "Recipes passed down through generations of the Smith family" : "A collection of recipes I love to cook"}
              className="block w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:ring-offset-0 transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className={`flex-1 rounded-lg px-4 py-3 font-semibold text-white shadow-md disabled:opacity-50 transition-all ${
                isShared
                  ? 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700'
                  : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
              }`}
            >
              {isSubmitting ? 'Creating...' : 'Create Cookbook'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
