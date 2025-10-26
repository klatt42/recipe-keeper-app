'use client'

import { useState, useEffect } from 'react'
import { Users, Minus, Plus } from 'lucide-react'
import { scaleIngredients, calculateMultiplier } from '@/lib/recipe/ingredient-scaler'

interface ServingSizeScalerProps {
  originalServings: number
  ingredients: string
  onServingsChange?: (newServings: number, scaledIngredients: string) => void
}

export function ServingSizeScaler({
  originalServings,
  ingredients,
  onServingsChange,
}: ServingSizeScalerProps) {
  const [currentServings, setCurrentServings] = useState(originalServings)
  const [scaledIngredients, setScaledIngredients] = useState(ingredients)

  // Update scaled ingredients when servings change
  useEffect(() => {
    const multiplier = calculateMultiplier(originalServings, currentServings)
    const scaled = scaleIngredients(ingredients, multiplier)
    setScaledIngredients(scaled)

    if (onServingsChange) {
      onServingsChange(currentServings, scaled)
    }
  }, [currentServings, originalServings, ingredients, onServingsChange])

  const handleDecrease = () => {
    if (currentServings > 1) {
      setCurrentServings(currentServings - 1)
    }
  }

  const handleIncrease = () => {
    if (currentServings < 99) {
      setCurrentServings(currentServings + 1)
    }
  }

  const handleReset = () => {
    setCurrentServings(originalServings)
  }

  const isModified = currentServings !== originalServings
  const multiplier = calculateMultiplier(originalServings, currentServings)

  return (
    <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-lg p-4 mb-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Adjust Servings</h3>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Decrease Button */}
        <button
          onClick={handleDecrease}
          disabled={currentServings <= 1}
          className="w-10 h-10 rounded-full bg-white border-2 border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          aria-label="Decrease servings"
        >
          <Minus className="w-5 h-5" />
        </button>

        {/* Servings Display */}
        <div className="flex-1 text-center">
          <div className="text-3xl font-bold text-purple-900">{currentServings}</div>
          <div className="text-sm text-gray-600">
            {currentServings === 1 ? 'serving' : 'servings'}
          </div>
          {isModified && (
            <div className="text-xs text-purple-600 mt-1">
              {multiplier > 1 ? `×${multiplier.toFixed(2)}` : `÷${(1 / multiplier).toFixed(2)}`} original recipe
            </div>
          )}
        </div>

        {/* Increase Button */}
        <button
          onClick={handleIncrease}
          disabled={currentServings >= 99}
          className="w-10 h-10 rounded-full bg-white border-2 border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          aria-label="Increase servings"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Presets */}
      <div className="mt-4 flex flex-wrap gap-2">
        {[1, 2, 4, 6, 8, 12].map(preset => (
          <button
            key={preset}
            onClick={() => setCurrentServings(preset)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              currentServings === preset
                ? 'bg-purple-600 text-white'
                : 'bg-white text-purple-600 border border-purple-300 hover:bg-purple-50'
            }`}
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Reset Button */}
      {isModified && (
        <div className="mt-3 text-center">
          <button
            onClick={handleReset}
            className="text-sm text-purple-600 hover:text-purple-700 hover:underline font-medium"
          >
            ← Reset to original ({originalServings} {originalServings === 1 ? 'serving' : 'servings'})
          </button>
        </div>
      )}

      {/* Info */}
      <div className="mt-3 pt-3 border-t border-purple-200">
        <p className="text-xs text-gray-500">
          Ingredient quantities and nutrition will update automatically as you adjust servings.
        </p>
      </div>
    </div>
  )
}
