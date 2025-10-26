'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getRecipeImages(recipeId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { images: [], error: 'Not authenticated' }
  }

  // Verify user owns this recipe
  const { data: recipe } = await supabase
    .from('recipes')
    .select('id')
    .eq('id', recipeId)
    .eq('user_id', user.id)
    .single()

  if (!recipe) {
    return { images: [], error: 'Recipe not found or unauthorized' }
  }

  const { data: images, error } = await supabase
    .from('recipe_images')
    .select('*')
    .eq('recipe_id', recipeId)
    .order('display_order', { ascending: true })

  return { images: images || [], error }
}

export async function uploadRecipeImages(recipeId: string, imageDataUrls: string[]) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Verify user owns this recipe
  const { data: recipe } = await supabase
    .from('recipes')
    .select('id')
    .eq('id', recipeId)
    .eq('user_id', user.id)
    .single()

  if (!recipe) {
    return { success: false, error: 'Recipe not found or unauthorized' }
  }

  try {
    // Get current max display order
    const { data: existingImages } = await supabase
      .from('recipe_images')
      .select('display_order')
      .eq('recipe_id', recipeId)
      .order('display_order', { ascending: false })
      .limit(1)

    let nextOrder = 0
    if (existingImages && existingImages.length > 0) {
      nextOrder = existingImages[0].display_order + 1
    }

    // Insert all images
    const imagesToInsert = imageDataUrls.map((imageUrl, index) => ({
      recipe_id: recipeId,
      image_url: imageUrl,
      display_order: nextOrder + index,
    }))

    const { error } = await supabase
      .from('recipe_images')
      .insert(imagesToInsert)

    if (error) {
      console.error('Error inserting recipe images:', error)
      return { success: false, error: error.message }
    }

    revalidatePath(`/recipes/${recipeId}`)
    return { success: true, error: null }
  } catch (error: any) {
    console.error('Error uploading recipe images:', error)
    return { success: false, error: error.message || 'Failed to upload images' }
  }
}

export async function deleteRecipeImage(imageId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get the image to verify ownership
  const { data: image } = await supabase
    .from('recipe_images')
    .select('recipe_id')
    .eq('id', imageId)
    .single()

  if (!image) {
    return { success: false, error: 'Image not found' }
  }

  // Verify user owns the recipe
  const { data: recipe } = await supabase
    .from('recipes')
    .select('id')
    .eq('id', image.recipe_id)
    .eq('user_id', user.id)
    .single()

  if (!recipe) {
    return { success: false, error: 'Unauthorized' }
  }

  // Delete the image
  const { error } = await supabase
    .from('recipe_images')
    .delete()
    .eq('id', imageId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/recipes/${image.recipe_id}`)
  return { success: true, error: null }
}

export async function updateRecipeImageCaption(imageId: string, caption: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get the image to verify ownership
  const { data: image } = await supabase
    .from('recipe_images')
    .select('recipe_id')
    .eq('id', imageId)
    .single()

  if (!image) {
    return { success: false, error: 'Image not found' }
  }

  // Verify user owns the recipe
  const { data: recipe } = await supabase
    .from('recipes')
    .select('id')
    .eq('id', image.recipe_id)
    .eq('user_id', user.id)
    .single()

  if (!recipe) {
    return { success: false, error: 'Unauthorized' }
  }

  // Update the caption
  const { error } = await supabase
    .from('recipe_images')
    .update({ caption })
    .eq('id', imageId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/recipes/${image.recipe_id}`)
  return { success: true, error: null }
}

export async function setRecipePrimaryImage(recipeId: string, imageUrl: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Verify user owns the recipe
  const { data: recipe } = await supabase
    .from('recipes')
    .select('id')
    .eq('id', recipeId)
    .eq('user_id', user.id)
    .single()

  if (!recipe) {
    return { success: false, error: 'Unauthorized' }
  }

  // Update the recipe's primary image_url
  const { error } = await supabase
    .from('recipes')
    .update({ image_url: imageUrl })
    .eq('id', recipeId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/recipes/${recipeId}`)
  return { success: true, error: null }
}

export async function updateRecipeImage(imageId: string, newImageUrl: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get the image and its current URL to verify ownership
  const { data: image } = await supabase
    .from('recipe_images')
    .select('recipe_id, image_url')
    .eq('id', imageId)
    .single()

  if (!image) {
    return { success: false, error: 'Image not found' }
  }

  // Verify user owns the recipe and get current primary image
  const { data: recipe } = await supabase
    .from('recipes')
    .select('id, image_url')
    .eq('id', image.recipe_id)
    .eq('user_id', user.id)
    .single()

  if (!recipe) {
    return { success: false, error: 'Unauthorized' }
  }

  // Update the image URL in recipe_images table
  const { error: imageError } = await supabase
    .from('recipe_images')
    .update({ image_url: newImageUrl })
    .eq('id', imageId)

  if (imageError) {
    return { success: false, error: imageError.message }
  }

  // If this image is currently the primary image, update the recipe's image_url too
  if (recipe.image_url === image.image_url) {
    const { error: recipeError } = await supabase
      .from('recipes')
      .update({ image_url: newImageUrl })
      .eq('id', image.recipe_id)

    if (recipeError) {
      return { success: false, error: recipeError.message }
    }
  }

  revalidatePath(`/recipes/${image.recipe_id}`)
  return { success: true, error: null }
}
