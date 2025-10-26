'use server'

import * as fal from '@fal-ai/serverless-client'

fal.config({
  credentials: process.env.FAL_KEY!,
})

interface ImageGenerationResult {
  success: boolean
  imageUrl?: string
  error?: string
}

/**
 * Generate an appealing food image for a recipe using AI
 */
export async function generateRecipeImage(
  recipeTitle: string,
  category?: string
): Promise<ImageGenerationResult> {
  try {
    // Create a detailed prompt for food photography
    const prompt = `Professional food photography of ${recipeTitle}${
      category ? `, ${category.toLowerCase()} dish` : ''
    }. High quality, appetizing, well-lit, clean background, restaurant quality presentation, overhead view, 4k, professional food styling`

    const negativePrompt =
      'blurry, low quality, amateur, messy, unappetizing, dark, poorly lit, text, watermark, logo'

    // Call FAL.ai FLUX model
    const result = await fal.subscribe('fal-ai/flux/schnell', {
      input: {
        prompt,
        negative_prompt: negativePrompt,
        image_size: 'landscape_16_9',
        num_inference_steps: 4, // Schnell is optimized for 4 steps
        enable_safety_checker: true,
      },
      logs: false,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          console.log('Generating image...', update.logs)
        }
      },
    })

    if (result.data && result.data.images && result.data.images.length > 0) {
      return {
        success: true,
        imageUrl: result.data.images[0].url,
      }
    } else {
      return {
        success: false,
        error: 'No image generated',
      }
    }
  } catch (error: any) {
    console.error('Image generation error:', error)
    return {
      success: false,
      error: error.message || 'Failed to generate image',
    }
  }
}

/**
 * Generate multiple image variations for a recipe
 */
export async function generateRecipeImageVariations(
  recipeTitle: string,
  category?: string,
  count: number = 3
): Promise<ImageGenerationResult[]> {
  const promises = Array.from({ length: count }, () =>
    generateRecipeImage(recipeTitle, category)
  )

  return Promise.all(promises)
}
