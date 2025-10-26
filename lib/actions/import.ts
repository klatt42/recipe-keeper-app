'use server'

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import type { RecipeFormData } from '@/lib/schemas/recipe'
import pdf from 'pdf-parse/lib/pdf-parse'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface ImportResult {
  success: boolean
  recipe?: Partial<RecipeFormData>
  error?: string
  confidence?: number
}

/**
 * Extract text from image using DocTR OCR service
 */
async function performOCR(imageData: string, mimeType: string): Promise<{ text: string; confidence: number }> {
  try {
    // Convert base64 to blob
    const base64Response = await fetch(`data:${mimeType};base64,${imageData}`)
    const blob = await base64Response.blob()

    // Create form data
    const formData = new FormData()
    formData.append('file', blob, 'recipe-image.jpg')

    // Call DocTR OCR service
    const response = await fetch('http://localhost:8000/extract-text', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`OCR service error: ${response.statusText}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'OCR failed')
    }

    return {
      text: result.text,
      confidence: result.confidence || 0.8,
    }
  } catch (error: any) {
    console.error('OCR error:', error)
    throw new Error(`OCR failed: ${error.message}`)
  }
}

/**
 * Extract recipe data from an image using DocTR OCR + Claude parsing
 */
export async function extractRecipeFromImage(
  imageData: string, // base64 encoded image
  mimeType: string
): Promise<ImportResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Step 1: Extract text using DocTR OCR
    const { text: extractedText, confidence: ocrConfidence } = await performOCR(imageData, mimeType)

    if (!extractedText || extractedText.trim().length === 0) {
      return { success: false, error: 'No text found in image' }
    }

    // Step 2: Parse extracted text with Claude
    const message = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `You are a recipe extraction assistant. Parse this recipe text extracted from an image and organize it into a structured format.

Recipe Text:
${extractedText}

Extract the following fields:

Extract the following fields:
- title: Recipe name/title
- category: Type of dish (Breakfast, Lunch, Dinner, Dessert, Appetizer, Snack, Beverage, Salad, Soup, Side Dish, Main Course, Baking, Other)
- prep_time: Preparation time in minutes (number only)
- cook_time: Cooking time in minutes (number only)
- servings: Number of servings or yield (e.g., "4-6 servings")
- ingredients: List of ingredients, one per line
- instructions: Step-by-step cooking instructions
- notes: Any tips, substitutions, or special notes
- source: Where the recipe is from (cookbook, website, person's name, etc.)
- rating: If there's a rating visible (1-5), otherwise null

Return ONLY a valid JSON object with these exact field names. If a field is not visible or cannot be determined, use null.

Example response format:
{
  "title": "Chocolate Chip Cookies",
  "category": "Dessert",
  "prep_time": 15,
  "cook_time": 12,
  "servings": "24 cookies",
  "ingredients": "2 cups all-purpose flour\\n1 cup butter, softened\\n3/4 cup granulated sugar\\n2 eggs\\n1 tsp vanilla extract",
  "instructions": "1. Preheat oven to 375°F.\\n2. Mix butter and sugar until fluffy.\\n3. Add eggs and vanilla.\\n4. Gradually add flour.\\n5. Fold in chocolate chips.\\n6. Bake for 10-12 minutes.",
  "notes": "Can substitute chocolate chips with raisins or nuts",
  "source": "Grandma's recipe book",
  "rating": null
}`,
            },
          ],
        },
      ],
    })

    // Parse Claude's response
    const textContent = message.content.find((c) => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      return { success: false, error: 'No text response from Claude' }
    }

    // Extract JSON from the response
    let recipeData
    try {
      // Try to parse the entire response as JSON first
      recipeData = JSON.parse(textContent.text)
    } catch {
      // If that fails, try to extract JSON from markdown code blocks
      const jsonMatch = textContent.text.match(/```(?:json)?\n?([\s\S]*?)\n?```/)
      if (jsonMatch) {
        recipeData = JSON.parse(jsonMatch[1])
      } else {
        // Last attempt: find JSON object in the text
        const jsonObjectMatch = textContent.text.match(/\{[\s\S]*\}/)
        if (jsonObjectMatch) {
          recipeData = JSON.parse(jsonObjectMatch[0])
        } else {
          return {
            success: false,
            error: 'Could not parse recipe data from Claude response',
          }
        }
      }
    }

    // Calculate confidence based on how many required fields were extracted
    const requiredFields = ['title', 'ingredients', 'instructions']
    const extractedRequired = requiredFields.filter((field) => recipeData[field])
    const confidence = extractedRequired.length / requiredFields.length

    return {
      success: true,
      recipe: recipeData,
      confidence,
    }
  } catch (error: any) {
    console.error('Recipe extraction error:', error)
    return {
      success: false,
      error: error.message || 'Failed to extract recipe from image',
    }
  }
}

/**
 * Extract text from PDF and then parse recipe data
 */
export async function extractRecipeFromPDF(
  pdfBuffer: Buffer
): Promise<ImportResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Extract text from PDF
    const data = await pdf(pdfBuffer)
    const pdfText = data.text

    if (!pdfText || pdfText.trim().length === 0) {
      return { success: false, error: 'No text found in PDF' }
    }

    // Use Claude to parse the extracted text
    const message = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `You are a recipe extraction assistant. Parse this recipe text and extract all information into a structured format.

Recipe Text:
${pdfText}

Extract the following fields:
- title: Recipe name/title
- category: Type of dish (Breakfast, Lunch, Dinner, Dessert, Appetizer, Snack, Beverage, Salad, Soup, Side Dish, Main Course, Baking, Other)
- prep_time: Preparation time in minutes (number only)
- cook_time: Cooking time in minutes (number only)
- servings: Number of servings or yield
- ingredients: List of ingredients, one per line
- instructions: Step-by-step cooking instructions
- notes: Any tips, substitutions, or special notes
- source: Where the recipe is from
- rating: If there's a rating (1-5), otherwise null

Return ONLY a valid JSON object with these exact field names. If a field cannot be determined, use null.`,
        },
      ],
    })

    // Parse response (same logic as image extraction)
    const textContent = message.content.find((c) => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      return { success: false, error: 'No text response from Claude' }
    }

    let recipeData
    try {
      recipeData = JSON.parse(textContent.text)
    } catch {
      const jsonMatch = textContent.text.match(/```(?:json)?\n?([\s\S]*?)\n?```/)
      if (jsonMatch) {
        recipeData = JSON.parse(jsonMatch[1])
      } else {
        const jsonObjectMatch = textContent.text.match(/\{[\s\S]*\}/)
        if (jsonObjectMatch) {
          recipeData = JSON.parse(jsonObjectMatch[0])
        } else {
          return {
            success: false,
            error: 'Could not parse recipe data from response',
          }
        }
      }
    }

    const requiredFields = ['title', 'ingredients', 'instructions']
    const extractedRequired = requiredFields.filter((field) => recipeData[field])
    const confidence = extractedRequired.length / requiredFields.length

    return {
      success: true,
      recipe: recipeData,
      confidence,
    }
  } catch (error: any) {
    console.error('PDF recipe extraction error:', error)
    return {
      success: false,
      error: error.message || 'Failed to extract recipe from PDF',
    }
  }
}
