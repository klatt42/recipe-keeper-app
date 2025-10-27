'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Crown, Loader2 } from 'lucide-react'
import { VariationCard } from './VariationCard'
import { DietaryAdaptationModal } from './DietaryAdaptationModal'
import {
  generateVariations,
  saveVariationAsRecipe,
  checkVariationLimit,
} from '@/lib/actions/variations'
import {
  getVariationTypeInfo,
  type VariationType,
  type RecipeVariation,
} from '@/lib/ai/variation-types'

interface VariationsSectionProps {
  recipeId: string
  bookId?: string | null
}

const VARIATION_TYPES: VariationType[] = [
  'dietary',
  'cuisine',
  'technique',
  'seasonal',
  'flavor',
  'complexity',
]

export function VariationsSection({ recipeId, bookId }: VariationsSectionProps) {
  const [selectedType, setSelectedType] = useState<VariationType | null>(null)
  const [variations, setVariations] = useState<RecipeVariation[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [savingIndex, setSavingIndex] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [usageInfo, setUsageInfo] = useState<{
    canGenerate: boolean
    remaining: number
    isPremium: boolean
  } | null>(null)
  const [isDietaryModalOpen, setIsDietaryModalOpen] = useState(false)

  // Check usage limit on mount
  useEffect(() => {
    checkVariationLimit().then(setUsageInfo)
  }, [])

  const handleGenerate = async (type: VariationType, customParameter?: string) => {
    setIsGenerating(true)
    setError(null)
    setSelectedType(type)
    setVariations([])

    try {
      const result = await generateVariations(recipeId, type, 3, customParameter)

      if (!result.success || !result.variations) {
        throw new Error(result.error || 'Failed to generate variations')
      }

      setVariations(result.variations)

      // Refresh usage info
      const newUsageInfo = await checkVariationLimit()
      setUsageInfo(newUsageInfo)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate variations')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleTypeClick = (type: VariationType) => {
    if (!usageInfo?.canGenerate) return

    // Special handling for dietary adaptations
    if (type === 'dietary') {
      setIsDietaryModalOpen(true)
    } else {
      handleGenerate(type)
    }
  }

  const handleDietarySubmit = (dietaryRequirement: string) => {
    setIsDietaryModalOpen(false)
    handleGenerate('dietary', dietaryRequirement)
  }

  const handleSave = async (variation: RecipeVariation, index: number) => {
    if (!selectedType) return

    setSavingIndex(index)
    setError(null)

    try {
      const result = await saveVariationAsRecipe(
        recipeId,
        variation,
        selectedType,
        bookId
      )

      if (!result.success) {
        throw new Error(result.error || 'Failed to save variation')
      }

      // Show success message (you could add a toast notification here)
      alert(`Variation saved successfully! Recipe ID: ${result.recipeId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save variation')
    } finally {
      setSavingIndex(null)
    }
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-200 rounded-lg p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-6 h-6 text-amber-600" />
        <h2 className="text-2xl font-bold text-gray-900">
          AI Recipe Variations
        </h2>
      </div>

      <p className="text-gray-600 mb-6">
        Discover creative ways to make this recipe! Choose a variation type to
        get AI-powered suggestions.
      </p>

      {/* Usage Info */}
      {usageInfo && !usageInfo.isPremium && (
        <div className="mb-6 p-4 bg-amber-100 border border-amber-300 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-900">
                Free Tier: {usageInfo.remaining} of 5 variations remaining this month
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Resets on the 1st of each month
              </p>
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-medium rounded-lg hover:from-amber-600 hover:to-amber-700 transition-colors">
              <Crown className="w-4 h-4" />
              Upgrade for Unlimited
            </button>
          </div>
        </div>
      )}

      {usageInfo && usageInfo.isPremium && (
        <div className="mb-6 p-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            <p className="font-medium">Premium Member - Unlimited Variations</p>
          </div>
        </div>
      )}

      {/* Variation Type Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {VARIATION_TYPES.map((type) => {
          const info = getVariationTypeInfo(type)
          const isSelected = selectedType === type
          const canGenerate = usageInfo?.canGenerate || false

          return (
            <button
              key={type}
              onClick={() => canGenerate && handleTypeClick(type)}
              disabled={isGenerating || !canGenerate}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                isSelected
                  ? 'border-amber-500 bg-amber-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{info.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    {info.name}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {info.description}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Loading State */}
      {isGenerating && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 text-amber-600 animate-spin mb-4" />
          <p className="text-gray-600 font-medium">
            Generating creative variations...
          </p>
          <p className="text-sm text-gray-500 mt-1">
            This may take 10-20 seconds
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
          <p className="font-medium">Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Variations Grid */}
      {!isGenerating && variations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedType && getVariationTypeInfo(selectedType).name}
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {variations.map((variation, index) => (
              <VariationCard
                key={index}
                variation={variation}
                onSave={(v) => handleSave(v, index)}
                isSaving={savingIndex === index}
              />
            ))}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => selectedType && handleGenerate(selectedType)}
              disabled={isGenerating || !usageInfo?.canGenerate}
              className="px-6 py-3 bg-white border-2 border-amber-300 text-amber-700 font-medium rounded-lg hover:bg-amber-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate More {selectedType && getVariationTypeInfo(selectedType).name}
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isGenerating && variations.length === 0 && !error && (
        <div className="text-center py-8 text-gray-500">
          <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>Select a variation type above to get started!</p>
        </div>
      )}

      {/* Dietary Adaptation Modal */}
      <DietaryAdaptationModal
        isOpen={isDietaryModalOpen}
        onClose={() => setIsDietaryModalOpen(false)}
        onSubmit={handleDietarySubmit}
        isGenerating={isGenerating}
      />
    </div>
  )
}
