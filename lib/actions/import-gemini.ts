'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import type { RecipeFormData } from '@/lib/schemas/recipe'
import { trackAPIUsage } from './usage-tracking'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

interface ImportResult {
  success: boolean
  recipe?: Partial<RecipeFormData>
  error?: string
  confidence?: number
  usage?: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
    estimatedCost: number
  }
}

/**
 * Extract and parse recipe from multiple images using Gemini 2.0 Flash
 * Supports multi-page recipes (front/back of recipe cards)
 */
export async function extractRecipeFromImages(
  images: Array<{ data: string; mimeType: string }>
): Promise<ImportResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      },
    })

    const promptText = images.length > 1
      ? `You are a recipe extraction assistant. These ${images.length} images show different pages of the same recipe (e.g., front and back of a recipe card). Analyze ALL images together and extract the complete recipe information into a structured JSON format.

IMPORTANT: Combine information from ALL images. Don't miss any ingredients or steps that appear on different pages.

Extract the following fields:
- title: Recipe name/title
- category: Type of dish (choose from: Breakfast, Lunch, Dinner, Dessert, Appetizer, Snack, Beverage, Salad, Soup, Side Dish, Main Course, Baking, Other)
- prep_time: Preparation time in minutes (number only, no units)
- cook_time: Cooking time in minutes (number only, no units)
- servings: Number of servings or yield (e.g., "4-6 servings")
- ingredients: ALL ingredients from ALL images, one per line (use \\n for line breaks)
- instructions: ALL steps from ALL images (use \\n for line breaks)
- notes: Any tips, substitutions, or special notes from any image
- source: Where the recipe is from (cookbook, website, person's name, etc.)
- rating: If there's a rating visible (1-5), otherwise null

IMPORTANT: Return ONLY a valid JSON object. Do not include any markdown formatting, code blocks, or explanatory text. Just the raw JSON.`
      : `You are a recipe extraction assistant. Analyze this recipe image and extract all recipe information into a structured JSON format.

Extract the following fields:
- title: Recipe name/title
- category: Type of dish (choose from: Breakfast, Lunch, Dinner, Dessert, Appetizer, Snack, Beverage, Salad, Soup, Side Dish, Main Course, Baking, Other)
- prep_time: Preparation time in minutes (number only, no units)
- cook_time: Cooking time in minutes (number only, no units)
- servings: Number of servings or yield (e.g., "4-6 servings")
- ingredients: List of ingredients, one per line (use \\n for line breaks)
- instructions: Step-by-step cooking instructions (use \\n for line breaks)
- notes: Any tips, substitutions, or special notes
- source: Where the recipe is from (cookbook, website, person's name, etc.)
- rating: If there's a rating visible (1-5), otherwise null

IMPORTANT: Return ONLY a valid JSON object. Do not include any markdown formatting, code blocks, or explanatory text. Just the raw JSON.

If a field cannot be determined from the image, use null for that field.`

    // Prepare image parts for Gemini
    const imageParts = images.map((img) => ({
      inlineData: {
        data: img.data,
        mimeType: img.mimeType,
      },
    }))

    // Generate content with all images and prompt
    const result = await model.generateContent([promptText, ...imageParts])
    const response = result.response
    const text = response.text()

    // Track usage
    const usage = response.usageMetadata
    const inputTokens = usage?.promptTokenCount || 0
    const outputTokens = usage?.candidatesTokenCount || 0
    const totalTokens = usage?.totalTokenCount || 0

    const estimatedCost =
      (inputTokens * 0.075 / 1_000_000) +
      (outputTokens * 0.30 / 1_000_000)

    // Parse JSON from response
    let recipeData
    try {
      recipeData = JSON.parse(text)
    } catch {
      const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
      if (jsonMatch) {
        recipeData = JSON.parse(jsonMatch[1])
      } else {
        const jsonObjectMatch = text.match(/\{[\s\S]*\}/)
        if (jsonObjectMatch) {
          recipeData = JSON.parse(jsonObjectMatch[0])
        } else {
          return {
            success: false,
            error: 'Could not parse recipe data from Gemini response',
          }
        }
      }
    }

    const requiredFields = ['title', 'ingredients', 'instructions']
    const extractedRequired = requiredFields.filter((field) => recipeData[field])
    const confidence = extractedRequired.length / requiredFields.length

    await trackAPIUsage({
      userId: user.id,
      service: 'gemini-2.0-flash',
      operation: images.length > 1 ? 'recipe-import-multi' : 'recipe-import',
      inputTokens,
      outputTokens,
      totalTokens,
      estimatedCost,
    })

    return {
      success: true,
      recipe: recipeData,
      confidence,
      usage: {
        inputTokens,
        outputTokens,
        totalTokens,
        estimatedCost,
      },
    }
  } catch (error: any) {
    console.error('Gemini recipe extraction error:', error)
    return {
      success: false,
      error: error.message || 'Failed to extract recipe from images',
    }
  }
}

/**
 * Extract and parse recipe from single image (backward compatibility)
 */
export async function extractRecipeFromImage(
  imageData: string,
  mimeType: string
): Promise<ImportResult> {
  // Call the multi-image function with a single image
  return extractRecipeFromImages([{ data: imageData, mimeType }])
}

/**
 * Extract recipe from PDF file using Gemini 2.0 Flash
 * Handles PDF parsing on the server side
 */
export async function extractRecipeFromPDFFile(
  file: File
): Promise<ImportResult> {
  try {
    // Dynamic import of pdf-parse (CommonJS module)
    const pdfParse = (await import('pdf-parse')).default

    // Parse PDF on server
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const pdfData = await pdfParse(buffer)

    // Extract recipe from parsed text
    return extractRecipeFromPDF(pdfData.text)
  } catch (error: any) {
    console.error('PDF parsing error:', error)
    return {
      success: false,
      error: error.message || 'Failed to parse PDF file',
    }
  }
}

/**
 * Extract recipe from PDF text using Gemini 2.0 Flash
 */
async function extractRecipeFromPDF(
  pdfText: string
): Promise<ImportResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    if (!pdfText || pdfText.trim().length === 0) {
      return { success: false, error: 'No text found in PDF' }
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
      },
    })

    const prompt = `You are a recipe extraction assistant. Parse this recipe text from a PDF and extract all information into a structured JSON format.

Recipe Text:
${pdfText}

Extract the following fields (return ONLY valid JSON, no markdown or explanations):
- title: Recipe name/title
- category: Type of dish
- prep_time: Preparation time in minutes (number only)
- cook_time: Cooking time in minutes (number only)
- servings: Number of servings
- ingredients: List of ingredients (use \\n for line breaks)
- instructions: Step-by-step instructions (use \\n for line breaks)
- notes: Any tips or notes
- source: Recipe source
- rating: Rating (1-5) or null

Return ONLY the JSON object.`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // Track usage
    const usage = response.usageMetadata
    const inputTokens = usage?.promptTokenCount || 0
    const outputTokens = usage?.candidatesTokenCount || 0
    const totalTokens = usage?.totalTokenCount || 0
    const estimatedCost =
      (inputTokens * 0.075 / 1_000_000) +
      (outputTokens * 0.30 / 1_000_000)

    // Parse response
    let recipeData
    try {
      recipeData = JSON.parse(text)
    } catch {
      const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
      if (jsonMatch) {
        recipeData = JSON.parse(jsonMatch[1])
      } else {
        const jsonObjectMatch = text.match(/\{[\s\S]*\}/)
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

    // Track usage
    await trackAPIUsage({
      userId: user.id,
      service: 'gemini-2.0-flash',
      operation: 'recipe-import-pdf',
      inputTokens,
      outputTokens,
      totalTokens,
      estimatedCost,
    })

    return {
      success: true,
      recipe: recipeData,
      confidence,
      usage: {
        inputTokens,
        outputTokens,
        totalTokens,
        estimatedCost,
      },
    }
  } catch (error: any) {
    console.error('Gemini PDF extraction error:', error)
    return {
      success: false,
      error: error.message || 'Failed to extract recipe from PDF',
    }
  }
}
