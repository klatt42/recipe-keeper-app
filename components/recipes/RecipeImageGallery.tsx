'use client'

import { useState, useRef } from 'react'
import { uploadRecipeImages, deleteRecipeImage, setRecipePrimaryImage, updateRecipeImage } from '@/lib/actions/recipe-images'
import { ImageCropper } from './ImageCropper'

interface RecipeImage {
  id: string
  recipe_id: string
  image_url: string
  display_order: number
  caption?: string
  created_at: string
}

interface RecipeImageGalleryProps {
  recipeId: string
  images: RecipeImage[]
  primaryImageUrl?: string
}

export function RecipeImageGallery({ recipeId, images, primaryImageUrl }: RecipeImageGalleryProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [cropImage, setCropImage] = useState<{ imageId: string; imageUrl: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setError(null)

    try {
      // Read all files as base64
      const imageDataPromises = Array.from(files).map((file) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.onerror = () => reject(new Error('Failed to read file'))
          reader.readAsDataURL(file)
        })
      })

      const imageDataUrls = await Promise.all(imageDataPromises)

      // Upload images
      const result = await uploadRecipeImages(recipeId, imageDataUrls)

      if (result.success) {
        setShowUpload(false)
        // Reload page to show new images
        window.location.reload()
      } else {
        setError(result.error || 'Failed to upload images')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload images')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return

    const result = await deleteRecipeImage(imageId)
    if (result.success) {
      window.location.reload()
    } else {
      setError(result.error || 'Failed to delete image')
    }
  }

  const handleSetPrimary = async (imageUrl: string) => {
    const result = await setRecipePrimaryImage(recipeId, imageUrl)
    if (result.success) {
      window.location.reload()
    } else {
      setError(result.error || 'Failed to set primary image')
    }
  }

  const handleCropComplete = async (croppedImageUrl: string) => {
    if (!cropImage) return

    const result = await updateRecipeImage(cropImage.imageId, croppedImageUrl)
    if (result.success) {
      setCropImage(null)
      window.location.reload()
    } else {
      setError(result.error || 'Failed to update image')
      setCropImage(null)
    }
  }

  // Show primary image if no gallery images exist
  const displayImages = images.length > 0 ? images : (primaryImageUrl ? [{ id: 'primary', image_url: primaryImageUrl, display_order: 0 }] : [])

  if (displayImages.length === 0 && !showUpload) {
    return (
      <div className="rounded-lg bg-gray-50 p-6 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="mt-2 text-sm text-gray-600">No images for this recipe</p>
        <button
          onClick={() => setShowUpload(true)}
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Images
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Image Grid */}
      {displayImages.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {displayImages.map((img: any, idx: number) => {
            const isPrimary = img.image_url === primaryImageUrl
            return (
              <div key={img.id} className={`group relative aspect-square overflow-hidden rounded-lg ${isPrimary ? 'border-4 border-blue-500' : 'border-2 border-gray-200'}`}>
                <img
                  src={img.image_url}
                  alt={img.caption || `Recipe image ${idx + 1}`}
                  className="h-full w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setLightboxImage(img.image_url)}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 pointer-events-none">
                  <span className="text-xs font-medium text-white">
                    {isPrimary ? '★ Primary Image' : `Image ${idx + 1}`}
                  </span>
                </div>
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="rounded-full bg-blue-600 p-1.5 text-white">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  {img.id !== 'primary' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setCropImage({ imageId: img.id, imageUrl: img.image_url })
                      }}
                      className="rounded-full bg-purple-600 p-1.5 text-white hover:bg-purple-700"
                      title="Crop image"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                      </svg>
                    </button>
                  )}
                  {!isPrimary && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSetPrimary(img.image_url)
                      }}
                      className="rounded-full bg-green-600 p-1.5 text-white hover:bg-green-700"
                      title="Set as primary image"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  )}
                  {img.id !== 'primary' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteImage(img.id)
                      }}
                      className="rounded-full bg-red-600 p-1.5 text-white hover:bg-red-700"
                      title="Delete image"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Upload Section */}
      {showUpload ? (
        <div className="rounded-lg bg-gray-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Add More Images</h3>
            <button
              onClick={() => setShowUpload(false)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 bg-white p-8 text-center hover:border-gray-400 hover:bg-gray-50"
          >
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              {isUploading ? 'Uploading...' : 'Click to select images'}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              You can select multiple images at once
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFilesSelected}
            disabled={isUploading}
            className="hidden"
          />
        </div>
      ) : (
        <button
          onClick={() => setShowUpload(true)}
          className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add More Images
        </button>
      )}

      <p className="text-xs text-gray-600">
        These images preserve your original recipe cards, handwritten notes, and personal touches.
      </p>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
            title="Close"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={lightboxImage}
            alt="Full size recipe image"
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <p className="text-sm text-white/80">Click anywhere to close</p>
          </div>
        </div>
      )}

      {/* Image Cropper Modal */}
      {cropImage && (
        <ImageCropper
          imageUrl={cropImage.imageUrl}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropImage(null)}
        />
      )}
    </div>
  )
}
