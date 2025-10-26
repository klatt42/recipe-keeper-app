'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { RecipeCard } from '@/components/recipes/RecipeCard'
import { SearchAndFilter } from '@/components/recipes/SearchAndFilter'
import { CookbookSelector } from '@/components/cookbooks/CookbookSelector'
import { CreateCookbookModal } from '@/components/cookbooks/CreateCookbookModal'
import { ManageCookbookModal } from '@/components/cookbooks/ManageCookbookModal'
import { getRecipeBooks, getRecipeBook } from '@/lib/actions/recipe-books'
import type { Recipe } from '@/lib/schemas/recipe'
import type { RecipeBook, BookWithMembers } from '@/lib/types/recipe-books'

interface HomeClientProps {
  initialRecipes: Recipe[]
  userEmail: string
  userId: string
}

export function HomeClient({ initialRecipes, userEmail, userId }: HomeClientProps) {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes)
  const [books, setBooks] = useState<RecipeBook[]>([])
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isManageModalOpen, setIsManageModalOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<BookWithMembers | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Update recipes when initialRecipes changes (from search/filter)
  useEffect(() => {
    setRecipes(initialRecipes)
  }, [initialRecipes])

  // Load cookbooks on mount
  useEffect(() => {
    loadBooks()
  }, [])

  const loadBooks = async () => {
    setIsLoading(true)
    const result = await getRecipeBooks()
    if (result.books) {
      setBooks(result.books)
    }
    setIsLoading(false)
  }

  const handleSelectBook = (bookId: string | null) => {
    setSelectedBookId(bookId)
  }

  const handleCreateBook = () => {
    setIsCreateModalOpen(true)
  }

  const handleManageBook = async (bookId: string) => {
    const result = await getRecipeBook(bookId)
    if (result.book) {
      setSelectedBook(result.book as BookWithMembers)
      setIsManageModalOpen(true)
    }
  }

  const handleCreateSuccess = () => {
    loadBooks()
    setIsCreateModalOpen(false)
  }

  // Filter recipes by selected cookbook
  const filteredRecipes = selectedBookId
    ? recipes.filter((recipe) => recipe.book_id === selectedBookId)
    : recipes

  const selectedBookData = books.find((b) => b.id === selectedBookId)

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  Recipe Keeper
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/usage"
                className="text-sm text-gray-700 hover:text-gray-900"
              >
                API Usage
              </Link>
              <span className="text-sm text-gray-700">
                {userEmail}
              </span>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Cookbook Selector */}
        <div className="mb-6">
          {isLoading ? (
            <div className="flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 px-4 py-3 shadow-sm ring-1 ring-amber-200">
              <div className="text-sm text-gray-600">Loading cookbooks...</div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <CookbookSelector
                  books={books}
                  selectedBookId={selectedBookId}
                  onSelectBook={handleSelectBook}
                  onCreateBook={handleCreateBook}
                />
              </div>
              {selectedBookId && selectedBookData && (
                <button
                  onClick={() => handleManageBook(selectedBookId)}
                  className="rounded-lg p-2.5 text-gray-600 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                  title="Manage cookbook"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Header with Add Recipe button */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {selectedBookId
                ? selectedBookData?.name || 'Cookbook'
                : 'All Recipes'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {filteredRecipes.length} {filteredRecipes.length === 1 ? 'recipe' : 'recipes'}
              {selectedBookId && selectedBookData?.is_shared && (
                <span className="ml-2 text-rose-600">
                  ❤️ Family Cookbook
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/recipes/import"
              className="rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              <svg className="inline-block mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Import Recipe
            </Link>
            <Link
              href="/recipes/new"
              className="rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              + Add Recipe
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <SearchAndFilter />

        {/* Recipes Grid */}
        {filteredRecipes.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
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
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              {selectedBookId ? 'No recipes in this cookbook yet' : 'No recipes yet'}
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Get started by creating your first recipe.
            </p>
            <Link
              href="/recipes/new"
              className="mt-6 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              + Add Your First Recipe
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <CreateCookbookModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <ManageCookbookModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        book={selectedBook}
        currentUserId={userId}
      />
    </div>
  )
}
