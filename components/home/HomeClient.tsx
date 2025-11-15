'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { RecipeCard } from '@/components/recipes/RecipeCard'
import { SearchAndFilter } from '@/components/recipes/SearchAndFilter'
import { CookbookSelector } from '@/components/cookbooks/CookbookSelector'
import { CreateCookbookModal } from '@/components/cookbooks/CreateCookbookModal'
import { ManageCookbookModal } from '@/components/cookbooks/ManageCookbookModal'
import { ImportRecipesModal } from '@/components/recipes/ImportRecipesModal'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { TooltipToggle } from '@/components/ui/TooltipToggle'
import { PromoUsageBanner } from '@/components/promo/PromoUsageBanner'
import { getRecipeBooks, getRecipeBook } from '@/lib/actions/recipe-books'
import { simpleTest } from '@/lib/actions/test-action'
import type { Recipe } from '@/lib/schemas/recipe'
import type { RecipeBook, BookWithMembers } from '@/lib/types/recipe-books'

interface HomeClientProps {
  initialRecipes: Recipe[]
  userEmail: string
  userId: string
  promoResult?: {
    success: boolean
    error?: string
    promo_code?: string
    promo_name?: string
    max_recipes?: number
  } | null
  isAdmin?: boolean
}

export function HomeClient({ initialRecipes, userEmail, userId, promoResult, isAdmin = false }: HomeClientProps) {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes)
  const [books, setBooks] = useState<RecipeBook[]>([])
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isManageModalOpen, setIsManageModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<BookWithMembers | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showPromoNotification, setShowPromoNotification] = useState(!!promoResult)
  const hasLoadedBooks = useRef(false)

  // Update recipes when initialRecipes changes (from search/filter)
  useEffect(() => {
    setRecipes(initialRecipes)
  }, [initialRecipes])

  // Load cookbooks function
  const loadBooks = useCallback(async () => {
    console.log('loadBooks function called')
    setIsLoading(true)
    try {
      // TEST: Call simple test action first
      console.log('Testing simple server action...')
      const testResult = await simpleTest()
      console.log('Test result:', testResult)

      console.log('About to call getRecipeBooks, type:', typeof getRecipeBooks)
      console.log('Calling getRecipeBooks...')

      let result
      try {
        // Add timeout to detect hanging
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout after 5 seconds')), 5000)
        )

        result = await Promise.race([
          getRecipeBooks(),
          timeoutPromise
        ]) as Awaited<ReturnType<typeof getRecipeBooks>>

        console.log('Got result from getRecipeBooks:', result)
      } catch (callError) {
        console.error('Exception when calling getRecipeBooks:', callError)
        if (callError instanceof Error) {
          console.error('Error message:', callError.message)
          console.error('Error stack:', callError.stack)
        }
        throw callError
      }

      console.log('Cookbooks loaded:', result)
      if (result.books) {
        console.log('Setting books state:', result.books.length, 'books')
        setBooks(result.books)
      }
      if (result.error) {
        console.error('Error loading cookbooks:', result.error)
      }
    } catch (error) {
      console.error('Failed to load cookbooks (outer catch):', error)
      if (error instanceof Error) {
        console.error('Outer error message:', error.message)
      }
      // Set loading to false even on error so UI doesn't hang
      setIsLoading(false)
    } finally {
      console.log('loadBooks completed, setting isLoading to false')
      setIsLoading(false)
    }
  }, [])

  // Load cookbooks on mount (only once)
  useEffect(() => {
    if (hasLoadedBooks.current) {
      console.log('Books already loaded, skipping')
      return
    }

    console.log('HomeClient mounted, loading cookbooks...')
    hasLoadedBooks.current = true
    loadBooks()
  }, [loadBooks])

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
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Eye-catching Food Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6TTIwIDM0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/20 backdrop-blur-sm p-3 border-2 border-white/40">
                <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-black text-white drop-shadow-lg">
                  🥗 My Family Recipe Keeper
                </h1>
                <p className="text-sm text-white/90 font-medium">Your Fresh Digital Cookbook</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {isAdmin && (
                <>
                  <Link
                    href="/admin"
                    className="rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 backdrop-blur-sm px-4 py-2 text-sm font-bold text-white transition-all border-2 border-purple-400/50 hover:border-purple-300/70 shadow-lg hover:shadow-xl hover:scale-105"
                    title="View business metrics, manage users and promo codes"
                  >
                    👑 Admin Dashboard
                  </Link>
                  <Link
                    href="/usage"
                    className="rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-white transition-all border border-white/30"
                    title="Monitor API usage costs and track spending"
                  >
                    📊 API Usage
                  </Link>
                </>
              )}
              <TooltipToggle />
              <ThemeToggle />
              <span className="text-sm font-medium text-white/90">
                {userEmail}
              </span>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-bold text-white shadow-lg transition-all border border-white/30 hover:scale-105"
                  title="Sign out of your account"
                >
                  🚪 Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Promo Code Notification */}
        {showPromoNotification && promoResult && (
          <div className={`mb-6 rounded-xl p-4 shadow-lg border-2 ${
            promoResult.success
              ? 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700'
              : 'bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-700'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`rounded-full p-2 ${
                  promoResult.success ? 'bg-green-200 dark:bg-green-800' : 'bg-red-200 dark:bg-red-800'
                }`}>
                  {promoResult.success ? (
                    <svg className="h-6 w-6 text-green-700 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6 text-red-700 dark:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className={`font-bold text-lg ${
                    promoResult.success ? 'text-green-900 dark:text-green-200' : 'text-red-900 dark:text-red-200'
                  }`}>
                    {promoResult.success ? '🎉 Promo Code Applied!' : '❌ Promo Code Error'}
                  </h3>
                  {promoResult.success ? (
                    <div className={`mt-1 text-sm ${
                      promoResult.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
                    }`}>
                      <p className="font-semibold">
                        {promoResult.promo_name} (<span className="font-mono">{promoResult.promo_code}</span>)
                      </p>
                      {promoResult.max_recipes && (
                        <p className="mt-1">
                          You now have access to {promoResult.max_recipes === 999999 ? 'unlimited' : promoResult.max_recipes} recipes!
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-red-800 dark:text-red-300">
                      {promoResult.error || 'Failed to apply promo code'}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowPromoNotification(false)}
                className="rounded-lg p-1 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Promo Usage Banner */}
        <PromoUsageBanner />

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
            <h2 className="text-4xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent dark:from-green-400 dark:via-emerald-400 dark:to-teal-400">
              {selectedBookId
                ? selectedBookData?.name || 'Cookbook'
                : 'All Recipes'}
            </h2>
            <p className="mt-2 text-base font-semibold text-gray-700 dark:text-gray-300">
              🍽️ {filteredRecipes.length} {filteredRecipes.length === 1 ? 'recipe' : 'recipes'}
              {selectedBookId && selectedBookData?.is_shared && (
                <span className="ml-2 text-rose-600 dark:text-rose-400 animate-pulse">
                  ❤️ Family Cookbook
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            {selectedBookId && (
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 border-2 border-purple-600"
                title="Copy recipes from another cookbook into this one"
              >
                <span className="relative z-10 flex items-center gap-2">
                  📥 Import from Cookbook
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            )}
            <Link
              href="/recipes/import"
              className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 border-2 border-blue-600"
              title="Scan a recipe card or photo with AI-powered OCR"
            >
              <span className="relative z-10 flex items-center gap-2">
                📸 Import Recipe
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
            <Link
              href="/recipes/new"
              className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 px-5 py-3 text-sm font-bold text-white shadow-lg hover:shadow-2xl transition-all hover:scale-110 border-2 border-green-600 animate-pulse hover:animate-none"
              title="Create a new recipe by typing it out manually"
            >
              <span className="relative z-10 flex items-center gap-2">
                ✨ Add Recipe
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <SearchAndFilter />

        {/* Recipes Grid */}
        {filteredRecipes.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600"
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
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              {selectedBookId ? 'No recipes in this cookbook yet' : 'No recipes yet'}
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Get started by creating your first recipe.
            </p>
            <Link
              href="/recipes/new"
              className="mt-6 inline-flex items-center rounded-md bg-blue-600 dark:bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 dark:hover:bg-blue-600"
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

      <ImportRecipesModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        targetBookId={selectedBookId}
        targetBookName={selectedBookData?.name || 'Cookbook'}
      />
    </div>
  )
}
