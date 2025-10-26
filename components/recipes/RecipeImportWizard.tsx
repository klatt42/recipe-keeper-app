'use client'

import { useState } from 'react'
import { RecipeImportUpload } from './RecipeImportUpload'
import { RecipeForm } from './RecipeForm'
import { extractRecipeFromImages, extractRecipeFromPDFFile } from '@/lib/actions/import-gemini'
import { generateRecipeImage } from '@/lib/services/image-generation'
import { UsageStats } from '../usage/UsageStats'
import type { RecipeFormData } from '@/lib/schemas/recipe'

type WizardStep = 'upload' | 'processing' | 'review'

interface UsageData {
  inputTokens: number
  outputTokens: number
  totalTokens: number
  estimatedCost: number
}

export function RecipeImportWizard() {
  const [step, setStep] = useState<WizardStep>('upload')
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedRecipe, setExtractedRecipe] = useState<Partial<RecipeFormData> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confidence, setConfidence] = useState<number | null>(null)
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return

    setIsProcessing(true)
    setError(null)
    setStep('processing')

    try {
      // Check if PDF or images
      const pdfFiles = files.filter(f => f.type === 'application/pdf')
      const imageFiles = files.filter(f => f.type.startsWith('image/'))

      if (pdfFiles.length > 0) {
        // Handle PDF - currently only process first PDF
        const result = await extractRecipeFromPDFFile(pdfFiles[0])

        if (result.success && result.recipe) {
          setExtractedRecipe(result.recipe)
          setConfidence(result.confidence || null)
          if (result.usage) {
            setUsage(result.usage)
          }

          // Generate AI image if no image was provided
          if (!result.recipe.image_url && result.recipe.title) {
            const imageResult = await generateRecipeImage(
              result.recipe.title,
              result.recipe.category
            )

            if (imageResult.success && imageResult.imageUrl) {
              setExtractedRecipe((prev) => ({
                ...prev,
                image_url: imageResult.imageUrl,
              }))
            }
          }

          setStep('review')
        } else {
          setError(result.error || 'Failed to extract recipe from PDF')
          setStep('upload')
        }
      } else if (imageFiles.length > 0) {
        // Handle multiple images - read all of them
        const imageDataPromises = imageFiles.map((file) => {
          return new Promise<{ data: string; mimeType: string }>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => {
              const base64 = e.target?.result as string
              const base64Data = base64.split(',')[1] // Remove data:image/xxx;base64, prefix
              resolve({ data: base64Data, mimeType: file.type })
            }
            reader.onerror = () => reject(new Error('Failed to read file'))
            reader.readAsDataURL(file)
          })
        })

        try {
          const allImages = await Promise.all(imageDataPromises)

          // Also store full base64 images for display
          const fullImagePromises = imageFiles.map((file) => {
            return new Promise<string>((resolve) => {
              const reader = new FileReader()
              reader.onload = (e) => resolve(e.target?.result as string)
              reader.readAsDataURL(file)
            })
          })
          const fullImages = await Promise.all(fullImagePromises)
          setUploadedImages(fullImages)

          const result = await extractRecipeFromImages(allImages)

          if (result.success && result.recipe) {
            setExtractedRecipe(result.recipe)
            setConfidence(result.confidence || null)
            if (result.usage) {
              setUsage(result.usage)
            }

            // Use the FIRST uploaded image as the primary recipe image
            // This preserves the order and shows the "front" of recipe cards
            setExtractedRecipe((prev) => ({
              ...prev,
              image_url: fullImages[0],
              // Store additional images in a custom field for now
              additional_images: fullImages.slice(1),
            }))

            setStep('review')
          } else {
            setError(result.error || 'Failed to extract recipe from images')
            setStep('upload')
          }
        } catch (err: any) {
          setError(err.message || 'Failed to read image files')
          setStep('upload')
        }
      } else {
        setError('Unsupported file type')
        setStep('upload')
      }
    } catch (err: any) {
      console.error('Import error:', err)
      setError(err.message || 'An error occurred during import')
      setStep('upload')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleStartOver = () => {
    setStep('upload')
    setExtractedRecipe(null)
    setError(null)
    setConfidence(null)
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                step === 'upload' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              1
            </div>
            <span className="text-sm font-medium text-gray-900">Upload</span>
          </div>

          <div className="flex-1 mx-4 h-0.5 bg-gray-200" />

          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                step === 'processing' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              2
            </div>
            <span className="text-sm font-medium text-gray-900">Processing</span>
          </div>

          <div className="flex-1 mx-4 h-0.5 bg-gray-200" />

          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                step === 'review' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              3
            </div>
            <span className="text-sm font-medium text-gray-900">Review & Save</span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">Import Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Step Content */}
      {step === 'upload' && (
        <div className="rounded-lg bg-white p-8 shadow">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Import Your Recipe
          </h2>
          <RecipeImportUpload onFilesSelected={handleFilesSelected} />
        </div>
      )}

      {step === 'processing' && (
        <div className="rounded-lg bg-white p-12 shadow text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <h2 className="mt-6 text-xl font-semibold text-gray-900">
            Processing Your Recipe...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Using AI to extract recipe details. This may take a moment.
          </p>
        </div>
      )}

      {step === 'review' && extractedRecipe && (
        <div>
          <div className="mb-6 space-y-4">
            <div className="rounded-lg bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-blue-900">
                    Recipe extracted successfully!
                  </h3>
                  <p className="mt-1 text-sm text-blue-700">
                    Review the details below and make any necessary corrections before saving.
                    {confidence !== null && (
                      <span className="ml-1">
                        (Confidence: {Math.round(confidence * 100)}%)
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Show uploaded images */}
            {uploadedImages.length > 0 && (
              <div className="rounded-lg bg-white p-4 shadow">
                <h4 className="mb-3 text-sm font-medium text-gray-900">
                  Uploaded Images ({uploadedImages.length})
                </h4>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square overflow-hidden rounded-lg border-2 border-gray-200">
                      <img
                        src={img}
                        alt={`Recipe page ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                        <span className="text-xs font-medium text-white">
                          {idx === 0 ? 'Primary Image' : `Page ${idx + 1}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-600">
                  These images will be saved with your recipe so you can always see the original notes and handwriting.
                </p>
              </div>
            )}

            {usage && (
              <UsageStats
                inputTokens={usage.inputTokens}
                outputTokens={usage.outputTokens}
                totalTokens={usage.totalTokens}
                estimatedCost={usage.estimatedCost}
              />
            )}
          </div>

          <div className="rounded-lg bg-white p-8 shadow">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Review Recipe</h2>
              <button
                onClick={handleStartOver}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Start Over
              </button>
            </div>

            <RecipeForm
              initialData={extractedRecipe as RecipeFormData}
              mode="create"
              additionalImages={uploadedImages}
            />
          </div>
        </div>
      )}
    </div>
  )
}
