'use client'

import { useState, useEffect } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import { getRecipeNutrition } from '@/lib/actions/nutrition'
import type { RecipeNutrition } from '@/lib/nutrition/calculator'

interface NutritionPanelProps {
  recipeId: string
  servings?: number
}

export function NutritionPanel({ recipeId, servings }: NutritionPanelProps) {
  const [nutrition, setNutrition] = useState<RecipeNutrition | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  const loadNutrition = async () => {
    setLoading(true)
    setError(null)

    const result = await getRecipeNutrition(recipeId, servings)

    if (result.success && result.nutrition) {
      setNutrition(result.nutrition)
    } else {
      setError(result.error || 'Failed to calculate nutrition')
    }

    setLoading(false)
  }

  // Load nutrition on demand
  const handleCalculate = () => {
    if (!nutrition && !loading) {
      loadNutrition()
      setIsExpanded(true)
    } else {
      setIsExpanded(!isExpanded)
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mr-3" />
          <p className="text-gray-600">Calculating nutrition...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-white border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">
              Nutrition Calculation Error
            </h3>
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={loadNutrition}
              className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium underline"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-6">
      {/* Header */}
      <button
        onClick={handleCalculate}
        className="w-full text-left flex items-center justify-between group cursor-pointer"
      >
        <h2 className="text-xl font-bold text-gray-900">
          📊 Nutrition Facts
        </h2>
        <span className="text-sm text-blue-600 group-hover:text-blue-700 group-hover:underline font-medium cursor-pointer">
          {!nutrition ? '→ Calculate' : isExpanded ? '↑ Hide' : '↓ Show'}
        </span>
      </button>

      {nutrition && isExpanded && (
        <div className="mt-4">
          {/* Servings Info */}
          <div className="mb-4 pb-4 border-b-2 border-gray-900">
            <p className="text-sm text-gray-600">
              Serving Size: 1 serving ({nutrition.servings} total)
            </p>
            {nutrition.cached && (
              <p className="text-xs text-gray-500 mt-1">✓ Cached result</p>
            )}
            {nutrition.ingredientsProcessed > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Based on {nutrition.ingredientsProcessed} of{' '}
                {nutrition.ingredientsTotal} ingredients
              </p>
            )}
          </div>

          {/* Calories */}
          <div className="mb-4 pb-3 border-b border-gray-300">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-gray-900">Calories</span>
              <span className="text-2xl font-bold text-gray-900">
                {Math.round(nutrition.perServing.calories)}
              </span>
            </div>
          </div>

          {/* Macronutrients */}
          <div className="space-y-2">
            {/* Total Fat */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="font-semibold text-gray-900">Total Fat</span>
              <span className="font-semibold text-gray-900">
                {nutrition.perServing.fat_g.toFixed(1)}g
              </span>
            </div>

            {/* Total Carbohydrates */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="font-semibold text-gray-900">
                Total Carbohydrates
              </span>
              <span className="font-semibold text-gray-900">
                {nutrition.perServing.carbs_g.toFixed(1)}g
              </span>
            </div>

            {/* Dietary Fiber (indented) */}
            <div className="flex justify-between items-center py-1 pl-4 border-b border-gray-100">
              <span className="text-sm text-gray-700">Dietary Fiber</span>
              <span className="text-sm text-gray-700">
                {nutrition.perServing.fiber_g.toFixed(1)}g
              </span>
            </div>

            {/* Total Sugars (indented) */}
            <div className="flex justify-between items-center py-1 pl-4 border-b border-gray-100">
              <span className="text-sm text-gray-700">Total Sugars</span>
              <span className="text-sm text-gray-700">
                {nutrition.perServing.sugar_g.toFixed(1)}g
              </span>
            </div>

            {/* Protein */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="font-semibold text-gray-900">Protein</span>
              <span className="font-semibold text-gray-900">
                {nutrition.perServing.protein_g.toFixed(1)}g
              </span>
            </div>

            {/* Sodium */}
            <div className="flex justify-between items-center py-2">
              <span className="font-semibold text-gray-900">Sodium</span>
              <span className="font-semibold text-gray-900">
                {Math.round(nutrition.perServing.sodium_mg)}mg
              </span>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              * Nutrition information is estimated based on USDA FoodData Central
              and may vary based on specific ingredients and preparation methods.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
