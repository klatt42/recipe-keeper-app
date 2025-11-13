'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { ShoppingCart, Copy, RotateCcw } from 'lucide-react'

interface ShoppingListProps {
  recipeId: string
  recipeTitle: string
  ingredients: string
  servings: number
}

export function ShoppingList({ recipeId, recipeTitle, ingredients, servings }: ShoppingListProps) {
  const [checked, setChecked] = useState<Set<number>>(new Set())
  const [isExpanded, setIsExpanded] = useState(false)
  const ingredientList = ingredients.split('\n').filter(i => i.trim())

  // Load checked state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`shopping-${recipeId}`)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setChecked(new Set(parsed))
      } catch (e) {
        console.error('Failed to parse shopping list state:', e)
      }
    }
  }, [recipeId])

  const toggleIngredient = (index: number) => {
    const newChecked = new Set(checked)
    if (checked.has(index)) {
      newChecked.delete(index)
    } else {
      newChecked.add(index)
    }
    setChecked(newChecked)

    // Save to localStorage for persistence
    localStorage.setItem(`shopping-${recipeId}`, JSON.stringify(Array.from(newChecked)))
  }

  const copyToClipboard = async () => {
    const uncheckedIngredients = ingredientList
      .filter((_, i) => !checked.has(i))

    if (uncheckedIngredients.length === 0) {
      toast.info('All ingredients are checked off!', {
        description: 'Nothing left to shop for.'
      })
      return
    }

    const shoppingListText = `Shopping List for: ${recipeTitle}\n(${servings} servings)\n\n${uncheckedIngredients.join('\n')}`

    try {
      await navigator.clipboard.writeText(shoppingListText)
      toast.success('Shopping list copied to clipboard!', {
        description: `${uncheckedIngredients.length} ingredient${uncheckedIngredients.length !== 1 ? 's' : ''} copied`,
        duration: 3000,
      })
    } catch {
      toast.error('Failed to copy to clipboard', {
        description: 'Please try again or copy manually'
      })
    }
  }

  const clearAll = () => {
    setChecked(new Set())
    localStorage.removeItem(`shopping-${recipeId}`)
    toast.success('Shopping list cleared', {
      description: 'All items unchecked'
    })
  }

  const checkedCount = checked.size
  const totalCount = ingredientList.length
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0

  if (!isExpanded) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <div className="text-left">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Shopping List Mode</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {checkedCount > 0
                  ? `${checkedCount} of ${totalCount} items checked`
                  : 'Click to create your shopping list'}
              </p>
            </div>
          </div>
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {progress > 0 && (
          <div className="h-2 bg-gray-100 dark:bg-gray-700">
            <div
              className="h-full bg-green-500 dark:bg-green-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-blue-200 dark:border-blue-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-6 border-b border-blue-200 dark:border-blue-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Shopping List</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {checkedCount} of {totalCount} items checked
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50"
            title="Collapse"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-white dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Ingredients List */}
      <div className="p-6 max-h-96 overflow-y-auto">
        <div className="space-y-2">
          {ingredientList.map((ingredient, i) => (
            <label
              key={i}
              className="flex items-start gap-3 py-3 px-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors group"
            >
              <input
                type="checkbox"
                checked={checked.has(i)}
                onChange={() => toggleIngredient(i)}
                className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-600 focus:ring-offset-0 mt-0.5 cursor-pointer"
              />
              <span
                className={`flex-1 text-gray-700 dark:text-gray-300 ${
                  checked.has(i) ? 'line-through text-gray-400 dark:text-gray-600' : ''
                } transition-all`}
              >
                {ingredient}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex gap-3">
        <button
          onClick={copyToClipboard}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 dark:bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-500 dark:hover:bg-blue-600 transition-colors shadow-sm"
        >
          <Copy className="w-4 h-4" />
          Copy to Clipboard
        </button>
        <button
          onClick={clearAll}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600 shadow-sm"
          title="Clear all checked items"
        >
          <RotateCcw className="w-4 h-4" />
          Clear
        </button>
      </div>

      {/* Helper Text */}
      <div className="px-6 pb-4 bg-gray-50 dark:bg-gray-900">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          💡 Tip: Check off items as you add them to your cart. Your progress is saved automatically.
        </p>
      </div>
    </div>
  )
}
