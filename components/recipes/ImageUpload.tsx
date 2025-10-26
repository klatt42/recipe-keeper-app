'use client'

import { useState, useRef } from 'react'
import { uploadRecipeImage, deleteRecipeImage } from '@/lib/actions/upload'

interface ImageUploadProps {
  currentImageUrl?: string
  onImageChange: (url: string) => void
}

export function ImageUpload({ currentImageUrl, onImageChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState(currentImageUrl || '')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    const result = await uploadRecipeImage(formData)

    if (result.success && result.url) {
      setImageUrl(result.url)
      onImageChange(result.url)
    } else {
      setError(result.error || 'Upload failed')
    }

    setIsUploading(false)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUrlChange = (url: string) => {
    setImageUrl(url)
    onImageChange(url)
  }

  const handleRemove = async () => {
    if (imageUrl && imageUrl.includes('supabase')) {
      // Delete from Supabase Storage
      await deleteRecipeImage(imageUrl)
    }
    setImageUrl('')
    onImageChange('')
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Recipe Image
        </label>

        {/* Image Preview */}
        {imageUrl && (
          <div className="relative mb-4 aspect-video w-full max-w-md overflow-hidden rounded-lg border border-gray-300">
            <img
              src={imageUrl}
              alt="Recipe preview"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute right-2 top-2 rounded-full bg-red-600 p-2 text-white shadow-lg hover:bg-red-500"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Upload Buttons */}
        <div className="flex flex-wrap gap-3">
          {/* File Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {isUploading ? 'Uploading...' : 'Upload Image'}
          </button>

          {/* URL Input Toggle */}
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            {showUrlInput ? 'Hide URL Input' : 'Use Image URL'}
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* URL Input (Collapsible) */}
        {showUrlInput && (
          <div className="mt-4">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}

        {/* Help Text */}
        <p className="mt-2 text-sm text-gray-500">
          Upload an image (JPG, PNG, WEBP, GIF - max 5MB) or provide a URL
        </p>
      </div>
    </div>
  )
}
