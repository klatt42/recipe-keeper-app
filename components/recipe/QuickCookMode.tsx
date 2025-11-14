'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, X, Play, Check } from 'lucide-react'
import { toast } from 'sonner'

interface QuickCookModeProps {
  recipe: {
    title: string
    instructions: string
  }
}

export function QuickCookMode({ recipe }: QuickCookModeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  // Parse instructions into steps
  const steps = recipe.instructions
    .split('\n')
    .filter(s => s.trim())
    .map(s => s.trim())

  // Keyboard navigation
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return

    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault()
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1)
      } else {
        handleFinish()
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      if (currentStep > 0) {
        setCurrentStep(prev => prev - 1)
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setIsOpen(false)
    }
  }, [isOpen, currentStep, steps.length])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  const handleFinish = () => {
    setIsOpen(false)
    setCurrentStep(0)
    toast.success('Recipe complete! 🎉', {
      description: 'Great job cooking!',
      duration: 4000,
    })
  }

  const handleStart = () => {
    setIsOpen(true)
    setCurrentStep(0)
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleFinish()
    }
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  // Start button when not open
  if (!isOpen) {
    return (
      <button
        onClick={handleStart}
        className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white rounded-lg font-semibold text-lg hover:from-blue-500 hover:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
      >
        <Play className="w-6 h-6" />
        Start Cook Mode
      </button>
    )
  }

  // Full-screen cook mode
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 p-4 sm:p-6 flex items-center justify-between border-b border-gray-800">
        <div className="flex-1 min-w-0">
          <div className="text-sm text-gray-400 mb-1">
            Step {currentStep + 1} of {steps.length}
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-white truncate">
            {recipe.title}
          </h2>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="ml-4 text-white p-2 hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
          aria-label="Exit cook mode"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-gray-800">
        <div
          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Current Step */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full flex items-start justify-center p-6 sm:p-8 md:p-12 pt-8 sm:pt-12 md:pt-16">
          <div className="max-w-4xl w-full">
            <div className="text-white text-3xl sm:text-4xl md:text-5xl leading-relaxed text-center font-medium">
              {steps[currentStep]}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="bg-gray-900 p-4 sm:p-6 border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          {/* Step Indicators (dots) */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-8 bg-blue-500'
                    : index < currentStep
                    ? 'w-2 bg-green-500'
                    : 'w-2 bg-gray-700'
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center justify-center gap-2 py-4 sm:py-5 px-4 text-base sm:text-lg font-semibold bg-gray-800 text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </button>

            <button
              onClick={handleNext}
              className="flex items-center justify-center gap-2 py-4 sm:py-5 px-4 text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                  Finish
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Next Step</span>
                  <span className="sm:hidden">Next</span>
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </>
              )}
            </button>
          </div>

          {/* Keyboard Shortcuts Hint */}
          <div className="mt-4 text-center text-xs sm:text-sm text-gray-500">
            <span className="hidden sm:inline">
              Use arrow keys to navigate • Press Esc to exit
            </span>
            <span className="sm:hidden">
              Swipe or tap buttons to navigate
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
