'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { RecipeFormData } from '@/lib/schemas/recipe'

export async function getRecipes(options?: {
  search?: string
  sort?: string
  favoritesOnly?: boolean
  category?: string
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { recipes: [], error: null }
  }

  let query = supabase
    .from('recipes')
    .select('*')
    .eq('user_id', user.id)

  // Apply search filter - search across title, ingredients, instructions, source, and notes
  if (options?.search) {
    const searchTerm = `%${options.search}%`
    query = query.or(`title.ilike.${searchTerm},ingredients.ilike.${searchTerm},instructions.ilike.${searchTerm},source.ilike.${searchTerm},notes.ilike.${searchTerm}`)
  }

  // Apply favorites filter
  if (options?.favoritesOnly) {
    query = query.eq('is_favorite', true)
  }

  // Apply category filter
  if (options?.category) {
    query = query.eq('category', options.category)
  }

  // Apply sorting
  switch (options?.sort) {
    case 'title':
      query = query.order('title', { ascending: true })
      break
    case 'rating':
      query = query.order('rating', { ascending: false, nullsFirst: false })
      break
    case 'cook_time':
      query = query.order('cook_time', { ascending: true, nullsFirst: false })
      break
    case 'source':
      query = query.order('source', { ascending: true, nullsFirst: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  const { data: recipes, error } = await query

  return { recipes: recipes || [], error }
}

export async function getRecipe(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { recipe: null, error: 'Not authenticated', parentRecipe: null }
  }

  const { data: recipe, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !recipe) {
    return { recipe, error, parentRecipe: null }
  }

  // If this recipe has a parent (is a variation), fetch parent recipe info
  let parentRecipe = null
  if (recipe.parent_recipe_id) {
    const { data: parent } = await supabase
      .from('recipes')
      .select('id, title')
      .eq('id', recipe.parent_recipe_id)
      .eq('user_id', user.id)
      .single()

    parentRecipe = parent
  }

  return { recipe, error, parentRecipe }
}

export async function createRecipe(
  formData: RecipeFormData,
  additionalImages?: string[],
  bookId?: string
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('recipes')
    .insert([
      {
        ...formData,
        user_id: user.id,
        book_id: bookId || null,
        submitted_by: user.id,
      },
    ])
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  // If there are additional images, save them to recipe_images table
  if (additionalImages && additionalImages.length > 0) {
    const imagesToInsert = additionalImages.map((imageUrl, index) => ({
      recipe_id: data.id,
      image_url: imageUrl,
      display_order: index,
    }))

    await supabase
      .from('recipe_images')
      .insert(imagesToInsert)
  }

  revalidatePath('/')
  redirect('/')
}

export async function updateRecipe(id: string, formData: RecipeFormData, bookId?: string | null) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const updateData = {
    ...formData,
    ...(bookId !== undefined && { book_id: bookId })
  }

  const { data, error } = await supabase
    .from('recipes')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/')
  revalidatePath(`/recipes/${id}`)
  redirect(`/recipes/${id}`)
}

export async function deleteRecipe(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/')
  redirect('/')
}

export async function toggleFavorite(id: string, isFavorite: boolean) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('recipes')
    .update({ is_favorite: isFavorite })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/')
  revalidatePath(`/recipes/${id}`)
  return { success: true, error: null }
}

/**
 * Move all user's recipes without a cookbook to a specific cookbook
 */
export async function moveRecipesToCookbook(bookId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated', count: 0 }
  }

  // Update all recipes without a book_id
  const { data, error } = await supabase
    .from('recipes')
    .update({ book_id: bookId })
    .eq('user_id', user.id)
    .is('book_id', null)
    .select('id')

  if (error) {
    return { success: false, error: error.message, count: 0 }
  }

  revalidatePath('/')
  return { success: true, error: null, count: data?.length || 0 }
}

/**
 * Copy or move a recipe to a different cookbook
 */
export async function copyRecipeToCookbook(recipeId: string, targetBookId: string | null, shouldMove: boolean = false) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get the original recipe
  const { data: originalRecipe, error: fetchError } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', recipeId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !originalRecipe) {
    return { success: false, error: 'Recipe not found' }
  }

  if (shouldMove) {
    // Move: just update the book_id
    const { error: moveError } = await supabase
      .from('recipes')
      .update({ book_id: targetBookId })
      .eq('id', recipeId)
      .eq('user_id', user.id)

    if (moveError) {
      return { success: false, error: moveError.message }
    }

    // Also copy the additional images references
    const { data: images } = await supabase
      .from('recipe_images')
      .select('*')
      .eq('recipe_id', recipeId)

    revalidatePath('/')
    revalidatePath(`/recipes/${recipeId}`)
    return { success: true, error: null, recipeId }
  } else {
    // Copy: create a new recipe
    const { id, created_at, updated_at, user_id, ...recipeData } = originalRecipe

    const { data: newRecipe, error: createError } = await supabase
      .from('recipes')
      .insert([
        {
          ...recipeData,
          user_id: user.id,
          book_id: targetBookId,
          submitted_by: user.id,
          title: `${recipeData.title} (Copy)`,
        },
      ])
      .select()
      .single()

    if (createError || !newRecipe) {
      return { success: false, error: createError?.message || 'Failed to copy recipe' }
    }

    // Copy additional images
    const { data: images } = await supabase
      .from('recipe_images')
      .select('*')
      .eq('recipe_id', recipeId)

    if (images && images.length > 0) {
      const imagesToInsert = images.map((img) => ({
        recipe_id: newRecipe.id,
        image_url: img.image_url,
        caption: img.caption,
        display_order: img.display_order,
      }))

      await supabase
        .from('recipe_images')
        .insert(imagesToInsert)
    }

    revalidatePath('/')
    return { success: true, error: null, recipeId: newRecipe.id }
  }
}
