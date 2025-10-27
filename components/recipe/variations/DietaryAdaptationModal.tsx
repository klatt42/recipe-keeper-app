'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface DietaryAdaptationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (dietaryRequirement: string) => void
  isGenerating: boolean
}

const COMMON_DIETARY_REQUIREMENTS = [
  { value: 'gluten-free', label: 'Gluten-Free' },
  { value: 'dairy-free', label: 'Dairy-Free (No Lactose)' },
  { value: 'nut-free', label: 'Nut-Free' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'keto', label: 'Keto / Low-Carb' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'low-sodium', label: 'Low-Sodium' },
  { value: 'low-sugar', label: 'Low-Sugar / Diabetic-Friendly' },
  { value: 'egg-free', label: 'Egg-Free' },
  { value: 'soy-free', label: 'Soy-Free' },
  { value: 'shellfish-free', label: 'Shellfish-Free' },
  { value: 'pescatarian', label: 'Pescatarian' },
  { value: 'whole30', label: 'Whole30' },
  { value: 'custom', label: 'Custom Dietary Need...' },
]

export function DietaryAdaptationModal({
  isOpen,
  onClose,
  onSubmit,
  isGenerating,
}: DietaryAdaptationModalProps) {
  const [selectedOption, setSelectedOption] = useState('')
  const [customRequirement, setCustomRequirement] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const requirement = selectedOption === 'custom'
      ? customRequirement.trim()
      : COMMON_DIETARY_REQUIREMENTS.find(opt => opt.value === selectedOption)?.label || ''

    if (requirement) {
      onSubmit(requirement)
    }
  }

  const isValid = selectedOption === 'custom'
    ? customRequirement.trim().length > 0
    : selectedOption.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Dietary Adaptation
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Select or specify a dietary requirement
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Dropdown */}
          <div className="mb-4">
            <label htmlFor="dietary-requirement" className="block text-sm font-medium text-gray-700 mb-2">
              Dietary Requirement
            </label>
            <select
              id="dietary-requirement"
              value={selectedOption}
              onChange={(e) => {
                setSelectedOption(e.target.value)
                if (e.target.value !== 'custom') {
                  setCustomRequirement('')
                }
              }}
              disabled={isGenerating}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-50 disabled:opacity-50"
            >
              <option value="">-- Select a dietary requirement --</option>
              {COMMON_DIETARY_REQUIREMENTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Input (shown when "Custom" is selected) */}
          {selectedOption === 'custom' && (
            <div className="mb-4">
              <label htmlFor="custom-requirement" className="block text-sm font-medium text-gray-700 mb-2">
                Specify Custom Requirement
              </label>
              <input
                type="text"
                id="custom-requirement"
                value={customRequirement}
                onChange={(e) => setCustomRequirement(e.target.value)}
                placeholder="e.g., FODMAPs-free, No nightshades, etc."
                disabled={isGenerating}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-50 disabled:opacity-50"
              />
            </div>
          )}

          {/* Info Box */}
          <div className="mb-6 rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> The AI will generate 3 variations of this recipe adapted for your selected dietary requirement.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || isGenerating}
              className="flex-1 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating...' : 'Generate Variations'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
