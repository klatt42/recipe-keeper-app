'use client'

import { useState } from 'react'
import type { Recipe } from '@/lib/schemas/recipe'
import type { RecipeImage } from '@/lib/types'

interface PrintRecipeModalProps {
  recipe: Recipe
  images: RecipeImage[]
  isOpen: boolean
  onClose: () => void
}

export function PrintRecipeModal({ recipe, images, isOpen, onClose }: PrintRecipeModalProps) {
  const [includeImages, setIncludeImages] = useState(true)
  const [selectedImages, setSelectedImages] = useState<string[]>([])

  if (!isOpen) return null

  // All available images (primary + gallery)
  const allImages = [
    ...(recipe.image_url ? [{ url: recipe.image_url, caption: 'Primary Image', id: 'primary' }] : []),
    ...images.map(img => ({ url: img.image_url, caption: img.caption || 'Gallery Image', id: img.id }))
  ]

  const toggleImage = (imageId: string) => {
    setSelectedImages(prev =>
      prev.includes(imageId)
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    )
  }

  const selectAll = () => {
    setSelectedImages(allImages.map(img => img.id))
  }

  const deselectAll = () => {
    setSelectedImages([])
  }

  const handlePrint = () => {
    // Create a print-specific version of the recipe
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const selectedImageUrls = allImages
      .filter(img => selectedImages.includes(img.id))
      .map(img => img.url)

    const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0)

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${recipe.title} - Recipe Keeper</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: system-ui, -apple-system, sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 {
              font-size: 32px;
              margin-bottom: 16px;
              color: #111;
            }
            .category {
              display: inline-block;
              background: #DBEAFE;
              color: #1E40AF;
              padding: 6px 12px;
              border-radius: 16px;
              font-size: 14px;
              margin-bottom: 16px;
            }
            .meta-info {
              display: flex;
              gap: 24px;
              margin: 24px 0;
              padding: 16px 0;
              border-top: 2px solid #E5E7EB;
              border-bottom: 2px solid #E5E7EB;
            }
            .meta-item {
              font-size: 14px;
            }
            .meta-label {
              font-weight: 600;
              color: #111;
            }
            .meta-value {
              color: #666;
            }
            h2 {
              font-size: 20px;
              margin: 32px 0 16px;
              color: #111;
            }
            .ingredients {
              background: #F9FAFB;
              padding: 24px;
              border-radius: 8px;
            }
            .ingredients ul {
              list-style: none;
            }
            .ingredients li {
              padding: 8px 0;
              color: #374151;
              position: relative;
              padding-left: 20px;
            }
            .ingredients li:before {
              content: "•";
              position: absolute;
              left: 0;
              color: #2563EB;
              font-weight: bold;
            }
            .instructions {
              white-space: pre-wrap;
              line-height: 1.8;
              color: #374151;
            }
            .notes {
              background: #FEF3C7;
              padding: 24px;
              border-radius: 8px;
              margin-top: 24px;
            }
            .source {
              color: #666;
              font-size: 14px;
              margin-top: 8px;
            }
            .submitter {
              color: #BE123C;
              font-size: 14px;
              margin-top: 4px;
            }
            .rating {
              color: #CA8A04;
              margin-top: 8px;
            }
            .images {
              margin: 32px 0;
              page-break-inside: avoid;
            }
            .image-container {
              margin: 16px 0;
              page-break-inside: avoid;
            }
            .image-container img {
              max-width: 100%;
              height: auto;
              border-radius: 8px;
              display: block;
            }
            .image-caption {
              font-size: 12px;
              color: #666;
              margin-top: 8px;
              text-align: center;
            }
            @media print {
              body { padding: 20px; }
              .page-break { page-break-before: always; }
            }
          </style>
        </head>
        <body>
          <h1>${recipe.title}</h1>

          ${recipe.category ? `<div class="category">${recipe.category}</div>` : ''}
          ${recipe.source ? `<div class="source">Source: ${recipe.source}</div>` : ''}
          ${recipe.submitter ? `<div class="submitter">Submitted by: ${recipe.submitter.raw_user_meta_data?.full_name || recipe.submitter.email}</div>` : ''}
          ${recipe.rating ? `<div class="rating">Rating: ${'★'.repeat(recipe.rating)}${'☆'.repeat(5 - recipe.rating)}</div>` : ''}

          <div class="meta-info">
            ${totalTime > 0 ? `
              <div class="meta-item">
                <div class="meta-label">Total Time</div>
                <div class="meta-value">${totalTime} minutes</div>
              </div>
            ` : ''}
            ${recipe.prep_time ? `
              <div class="meta-item">
                <div class="meta-label">Prep</div>
                <div class="meta-value">${recipe.prep_time} min</div>
              </div>
            ` : ''}
            ${recipe.cook_time ? `
              <div class="meta-item">
                <div class="meta-label">Cook</div>
                <div class="meta-value">${recipe.cook_time} min</div>
              </div>
            ` : ''}
            ${recipe.servings ? `
              <div class="meta-item">
                <div class="meta-label">Servings</div>
                <div class="meta-value">${recipe.servings}</div>
              </div>
            ` : ''}
          </div>

          ${includeImages && selectedImageUrls.length > 0 ? `
            <div class="images">
              <h2>Images</h2>
              ${selectedImageUrls.map((url, index) => {
                const img = allImages.find(i => i.url === url)
                return `
                  <div class="image-container">
                    <img src="${url}" alt="${img?.caption || 'Recipe image'}" />
                    ${img?.caption ? `<div class="image-caption">${img.caption}</div>` : ''}
                  </div>
                  ${index < selectedImageUrls.length - 1 ? '<div class="page-break"></div>' : ''}
                `
              }).join('')}
            </div>
          ` : ''}

          <h2>Ingredients</h2>
          <div class="ingredients">
            <ul>
              ${recipe.ingredients.split('\n').map(ing => `<li>${ing}</li>`).join('')}
            </ul>
          </div>

          <h2>Instructions</h2>
          <div class="instructions">${recipe.instructions}</div>

          ${recipe.notes ? `
            <h2>Notes</h2>
            <div class="notes">${recipe.notes}</div>
          ` : ''}

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
              </div>
              <div className="mt-3 flex-1 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 className="text-lg font-semibold leading-6 text-gray-900">
                  Print Recipe
                </h3>
                <div className="mt-4 space-y-4">
                  {/* Include Images Toggle */}
                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div>
                      <label htmlFor="include-images" className="font-medium text-gray-900">
                        Include Images
                      </label>
                      <p className="text-sm text-gray-500">
                        Print recipe with selected images
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIncludeImages(!includeImages)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                        includeImages ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          includeImages ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Image Selection */}
                  {includeImages && allImages.length > 0 && (
                    <div className="rounded-lg border border-gray-200 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Select Images to Print</h4>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={selectAll}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            Select All
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            type="button"
                            onClick={deselectAll}
                            className="text-sm text-gray-600 hover:text-gray-700"
                          >
                            Deselect All
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                        {allImages.map((image) => (
                          <div
                            key={image.id}
                            onClick={() => toggleImage(image.id)}
                            className={`cursor-pointer rounded-lg border-2 p-2 transition-all ${
                              selectedImages.includes(image.id)
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="relative aspect-video overflow-hidden rounded bg-gray-100">
                              <img
                                src={image.url}
                                alt={image.caption}
                                className="h-full w-full object-cover"
                              />
                              {selectedImages.includes(image.id) && (
                                <div className="absolute right-1 top-1 rounded-full bg-blue-600 p-1">
                                  <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <p className="mt-1 truncate text-xs text-gray-600">
                              {image.caption}
                            </p>
                          </div>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        {selectedImages.length} of {allImages.length} images selected
                      </p>
                    </div>
                  )}

                  {/* Preview Info */}
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-sm text-gray-700">
                      <strong>Preview:</strong> {includeImages ? `Printing with ${selectedImages.length} ${selectedImages.length === 1 ? 'image' : 'images'}` : 'Printing text only'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
            >
              <svg
                className="mr-1.5 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Print
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
