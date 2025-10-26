'use client'

import { useState } from 'react'
import { Clock, ChefHat, Users, Sparkles } from 'lucide-react'
import type { RecipeVariation } from '@/lib/ai/variation-types'

interface VariationCardProps {
  variation: RecipeVariation
  onSave: (variation: RecipeVariation) => Promise<void>
  isSaving?: boolean
}

export function VariationCard({
  variation,
  onSave,
  isSaving = false,
}: VariationCardProps) {
  const [expanded, setExpanded] = useState(false)

  const totalTime =
    (variation.prep_time || 0) + (variation.cook_time || 0)

  return (
    <div className="border border-amber-200 rounded-lg bg-gradient-to-br from-white to-amber-50 p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {variation.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {variation.description}
          </p>
        </div>
        <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-1" />
      </div>

      {/* Recipe Info */}
      <div className="flex flex-wrap gap-4 mb-3 text-sm text-gray-600">
        {variation.prep_time && (
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>Prep: {variation.prep_time}m</span>
          </div>
        )}
        {variation.cook_time && (
          <div className="flex items-center gap-1.5">
            <ChefHat className="w-4 h-4" />
            <span>Cook: {variation.cook_time}m</span>
          </div>
        )}
        {variation.servings && (
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>{variation.servings} servings</span>
          </div>
        )}
      </div>

      {/* Key Changes */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">
          Key Changes
        </p>
        <ul className="space-y-1">
          {variation.key_changes.map((change, idx) => (
            <li
              key={idx}
              className="text-sm text-gray-700 flex items-start gap-2"
            >
              <span className="text-amber-600 mt-0.5">•</span>
              <span>{change}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Expandable Details */}
      {expanded && (
        <div className="space-y-4 mb-4 pt-4 border-t border-amber-200">
          {/* Ingredients */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Ingredients</h4>
            <div className="text-sm text-gray-700 whitespace-pre-line bg-white rounded p-3 border border-gray-200">
              {variation.ingredients}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Instructions</h4>
            <div className="text-sm text-gray-700 whitespace-pre-line bg-white rounded p-3 border border-gray-200">
              {variation.instructions}
            </div>
          </div>

          {/* Notes */}
          {variation.notes && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
              <div className="text-sm text-gray-700 whitespace-pre-line bg-amber-50 rounded p-3 border border-amber-200">
                {variation.notes}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-1 px-4 py-2 text-sm font-medium text-amber-700 bg-white border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors"
        >
          {expanded ? 'Hide Details' : 'View Full Recipe'}
        </button>
        <button
          onClick={() => onSave(variation)}
          disabled={isSaving}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save as Recipe'}
        </button>
      </div>
    </div>
  )
}
