'use client'

import { useState } from 'react'
import type { RecipeBook } from '@/lib/types/recipe-books'

interface CookbookSelectorProps {
  books: RecipeBook[]
  selectedBookId: string | null
  onSelectBook: (bookId: string | null) => void
  onCreateBook: () => void
}

export function CookbookSelector({
  books,
  selectedBookId,
  onSelectBook,
  onCreateBook,
}: CookbookSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedBook = books.find((b) => b.id === selectedBookId)
  const personalBooks = books.filter((b) => !b.is_shared)
  const sharedBooks = books.filter((b) => b.is_shared)

  return (
    <div className="relative">
      {/* Selected Book Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 px-4 py-3 shadow-sm ring-1 ring-amber-200 transition-all hover:shadow-md hover:ring-amber-300"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm">
            {selectedBook?.is_shared ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            )}
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-gray-900">
              {selectedBook ? selectedBook.name : 'All Recipes'}
            </div>
            <div className="text-xs text-gray-600">
              {selectedBook
                ? selectedBook.is_shared
                  ? `${selectedBook.member_count || 0} family members`
                  : 'Personal cookbook'
                : `${books.length} cookbook${books.length !== 1 ? 's' : ''}`}
            </div>
          </div>
        </div>
        <svg
          className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-96 overflow-y-auto rounded-xl bg-white shadow-xl ring-1 ring-black/5">
            {/* All Recipes Option */}
            <button
              onClick={() => {
                onSelectBook(null)
                setIsOpen(false)
              }}
              className={`flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors ${
                !selectedBookId
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">All Recipes</div>
                <div className="text-xs text-gray-600">View recipes from all your cookbooks</div>
              </div>
              {!selectedBookId && (
                <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            {/* Personal Cookbooks */}
            {personalBooks.length > 0 && (
              <div>
                <div className="bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-600">
                  My Cookbooks
                </div>
                {personalBooks.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => {
                      onSelectBook(book.id)
                      setIsOpen(false)
                    }}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                      selectedBookId === book.id
                        ? 'bg-gradient-to-r from-amber-50 to-orange-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-gray-400 to-gray-600 text-white">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{book.name}</div>
                      <div className="text-xs text-gray-600">
                        {book.recipe_count || 0} recipe{book.recipe_count !== 1 ? 's' : ''}
                      </div>
                    </div>
                    {selectedBookId === book.id && (
                      <svg className="h-5 w-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Shared Family Cookbooks */}
            {sharedBooks.length > 0 && (
              <div>
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-rose-900">
                  ❤️ Family Cookbooks
                </div>
                {sharedBooks.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => {
                      onSelectBook(book.id)
                      setIsOpen(false)
                    }}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                      selectedBookId === book.id
                        ? 'bg-gradient-to-r from-rose-50 to-pink-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-sm">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{book.name}</div>
                      <div className="text-xs text-gray-600">
                        {book.member_count || 0} member{book.member_count !== 1 ? 's' : ''} · {book.recipe_count || 0} recipe{book.recipe_count !== 1 ? 's' : ''}
                      </div>
                    </div>
                    {selectedBookId === book.id && (
                      <svg className="h-5 w-5 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Create New Cookbook Button */}
            <button
              onClick={() => {
                onCreateBook()
                setIsOpen(false)
              }}
              className="flex w-full items-center gap-3 border-t border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 text-left transition-colors hover:from-green-100 hover:to-emerald-100"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">Create New Cookbook</div>
                <div className="text-xs text-gray-600">Start a personal or family cookbook</div>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
