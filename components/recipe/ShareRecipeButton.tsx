'use client'

import { useState } from 'react'
import { Share2, Link as LinkIcon, Download, Facebook, Twitter } from 'lucide-react'
import { toast } from 'sonner'
import type { Recipe } from '@/lib/schemas/recipe'

interface ShareRecipeButtonProps {
  recipe: Recipe
  recipeUrl: string
}

export function ShareRecipeButton({ recipe, recipeUrl }: ShareRecipeButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const generateShareCard = async (): Promise<Blob | null> => {
    setIsGenerating(true)
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 1200
      canvas.height = 630 // Open Graph dimensions
      const ctx = canvas.getContext('2d')!

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, 630)
      gradient.addColorStop(0, '#fef3c7') // amber-100
      gradient.addColorStop(1, '#fed7aa') // orange-200
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 1200, 630)

      // Recipe title
      ctx.font = 'bold 56px system-ui, -apple-system, sans-serif'
      ctx.fillStyle = '#1f2937' // gray-900
      ctx.textAlign = 'left'

      // Word wrap for long titles
      const maxWidth = 1080
      const words = recipe.title.split(' ')
      let line = ''
      let y = 120

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' '
        const metrics = ctx.measureText(testLine)

        if (metrics.width > maxWidth && i > 0) {
          ctx.fillText(line, 60, y)
          line = words[i] + ' '
          y += 70
        } else {
          line = testLine
        }
      }
      ctx.fillText(line, 60, y)

      // Stats bar
      const statsY = y + 80
      ctx.font = '28px system-ui, -apple-system, sans-serif'
      ctx.fillStyle = '#6b7280' // gray-500

      const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0)
      const stats = []

      if (totalTime > 0) stats.push(`⏱️ ${totalTime} min`)
      if (recipe.servings) stats.push(`👥 ${recipe.servings}`)
      if (recipe.category) stats.push(`📂 ${recipe.category}`)

      ctx.fillText(stats.join('  •  '), 60, statsY)

      // Recipe image (if available)
      if (recipe.image_url) {
        try {
          const img = new Image()
          img.crossOrigin = 'anonymous'

          await new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = reject
            img.src = recipe.image_url!
          })

          // Draw image in rounded rectangle on right side
          const imgX = 700
          const imgY = 100
          const imgSize = 400
          const radius = 20

          ctx.save()
          ctx.beginPath()
          ctx.moveTo(imgX + radius, imgY)
          ctx.lineTo(imgX + imgSize - radius, imgY)
          ctx.quadraticCurveTo(imgX + imgSize, imgY, imgX + imgSize, imgY + radius)
          ctx.lineTo(imgX + imgSize, imgY + imgSize - radius)
          ctx.quadraticCurveTo(imgX + imgSize, imgY + imgSize, imgX + imgSize - radius, imgY + imgSize)
          ctx.lineTo(imgX + radius, imgY + imgSize)
          ctx.quadraticCurveTo(imgX, imgY + imgSize, imgX, imgY + imgSize - radius)
          ctx.lineTo(imgX, imgY + radius)
          ctx.quadraticCurveTo(imgX, imgY, imgX + radius, imgY)
          ctx.closePath()
          ctx.clip()

          ctx.drawImage(img, imgX, imgY, imgSize, imgSize)
          ctx.restore()

          // Shadow for image
          ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
          ctx.shadowBlur = 20
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 10
          ctx.strokeStyle = '#d1d5db'
          ctx.lineWidth = 2
          ctx.stroke()
          ctx.shadowColor = 'transparent'
        } catch (error) {
          console.log('Could not load recipe image for share card')
        }
      }

      // Watermark
      ctx.font = '20px system-ui, -apple-system, sans-serif'
      ctx.fillStyle = '#9ca3af' // gray-400
      ctx.textAlign = 'left'
      ctx.fillText('🍳 My Family Recipe Keeper', 60, 580)

      // Convert to blob
      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png')
      })
    } catch (error) {
      console.error('Error generating share card:', error)
      return null
    } finally {
      setIsGenerating(false)
    }
  }

  const handleShare = async (method: 'native' | 'copy' | 'download' | 'facebook' | 'twitter') => {
    if (method === 'copy') {
      try {
        await navigator.clipboard.writeText(recipeUrl)
        toast.success('Link copied to clipboard!', {
          description: 'Share this link with friends and family'
        })
        setIsOpen(false)
      } catch (error) {
        toast.error('Failed to copy link')
      }
      return
    }

    const shareCard = await generateShareCard()

    if (!shareCard && method !== 'facebook' && method !== 'twitter') {
      toast.error('Failed to generate share card')
      return
    }

    if (method === 'download') {
      if (!shareCard) return
      const url = URL.createObjectURL(shareCard)
      const a = document.createElement('a')
      a.href = url
      a.download = `${recipe.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-recipe.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Image downloaded!', {
        description: 'Share it on social media'
      })
      setIsOpen(false)
      return
    }

    if (method === 'facebook') {
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(recipeUrl)}`
      window.open(url, '_blank', 'width=600,height=400')
      setIsOpen(false)
      return
    }

    if (method === 'twitter') {
      const text = `Check out this recipe: ${recipe.title}`
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(recipeUrl)}`
      window.open(url, '_blank', 'width=600,height=400')
      setIsOpen(false)
      return
    }

    // Native Web Share API
    if (method === 'native' && navigator.share) {
      try {
        const shareData: ShareData = {
          title: recipe.title,
          text: `Check out this recipe: ${recipe.title}`,
          url: recipeUrl,
        }

        if (shareCard && navigator.canShare?.({ files: [new File([shareCard], 'recipe.png', { type: 'image/png' })] })) {
          const file = new File([shareCard], 'recipe.png', { type: 'image/png' })
          shareData.files = [file]
        }

        await navigator.share(shareData)
        toast.success('Recipe shared!')
        setIsOpen(false)
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          toast.error('Failed to share recipe')
        }
      }
    }
  }

  const hasNativeShare = typeof navigator !== 'undefined' && navigator.share

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        title="Share this recipe"
      >
        <Share2 className="inline-block mr-1 h-4 w-4" />
        Share
      </button>

      {/* Share Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Share Recipe
            </h3>

            <div className="space-y-3">
              {/* Native Share (mobile) */}
              {hasNativeShare && (
                <button
                  onClick={() => handleShare('native')}
                  disabled={isGenerating}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  <Share2 className="w-5 h-5" />
                  Share via...
                </button>
              )}

              {/* Copy Link */}
              <button
                onClick={() => handleShare('copy')}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
              >
                <LinkIcon className="w-5 h-5" />
                Copy Link
              </button>

              {/* Download Image */}
              <button
                onClick={() => handleShare('download')}
                disabled={isGenerating}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <Download className="w-5 h-5" />
                {isGenerating ? 'Generating...' : 'Download Share Image'}
              </button>

              {/* Social Media */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleShare('facebook')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-lg font-medium transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                  Facebook
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1da1f2] hover:bg-[#1a8cd8] text-white rounded-lg font-medium transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                  Twitter
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="mt-4 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  )
}
