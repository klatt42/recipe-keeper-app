'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { RecipeComment, CommentFormData } from '@/lib/types/comments'

interface ActionResult {
  success: boolean
  error?: string
  comment?: RecipeComment
}

/**
 * Get all comments for a recipe (with user data and threaded structure)
 */
export async function getRecipeComments(recipeId: string): Promise<{
  comments: RecipeComment[]
  error?: string
}> {
  const supabase = await createClient()

  const { data: comments, error } = await supabase
    .from('recipe_comments')
    .select(`
      *,
      profile:profiles!user_id (
        id,
        display_name
      )
    `)
    .eq('recipe_id', recipeId)
    .order('created_at', { ascending: true })

  if (error) {
    // If table doesn't exist yet, return empty array (migration not run)
    if (error.code === '42P01' || error.code === 'PGRST205') {
      console.warn('recipe_comments table does not exist. Please run the migration in migrations/add_comments_and_ratings.sql')
      return { comments: [] }
    }
    console.error('Error fetching comments - Full error object:', JSON.stringify(error, null, 2))
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    console.error('Error details:', error.details)
    return { comments: [], error: error.message }
  }

  // Build threaded structure
  const commentsMap = new Map<string, RecipeComment>()
  const topLevelComments: RecipeComment[] = []

  // First pass: create map of all comments
  comments.forEach((comment) => {
    commentsMap.set(comment.id, { ...comment, replies: [] })
  })

  // Second pass: build threaded structure
  comments.forEach((comment) => {
    const commentWithReplies = commentsMap.get(comment.id)!

    if (comment.parent_id) {
      const parent = commentsMap.get(comment.parent_id)
      if (parent) {
        parent.replies!.push(commentWithReplies)
      }
    } else {
      topLevelComments.push(commentWithReplies)
    }
  })

  return { comments: topLevelComments }
}

/**
 * Create a new comment on a recipe
 */
export async function createComment(
  recipeId: string,
  data: CommentFormData
): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in to comment' }
  }

  const { data: comment, error } = await supabase
    .from('recipe_comments')
    .insert({
      recipe_id: recipeId,
      user_id: user.id,
      content: data.content.trim(),
      parent_id: data.parent_id || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating comment:', error)
    return { success: false, error: 'Failed to create comment' }
  }

  revalidatePath(`/recipes/${recipeId}`)
  return { success: true, comment }
}

/**
 * Update a comment (only the author can update)
 */
export async function updateComment(
  commentId: string,
  content: string
): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  // Verify ownership
  const { data: existingComment } = await supabase
    .from('recipe_comments')
    .select('user_id, recipe_id')
    .eq('id', commentId)
    .single()

  if (!existingComment || existingComment.user_id !== user.id) {
    return { success: false, error: 'You can only edit your own comments' }
  }

  const { data: comment, error } = await supabase
    .from('recipe_comments')
    .update({ content: content.trim() })
    .eq('id', commentId)
    .select()
    .single()

  if (error) {
    console.error('Error updating comment:', error)
    return { success: false, error: 'Failed to update comment' }
  }

  revalidatePath(`/recipes/${existingComment.recipe_id}`)
  return { success: true, comment }
}

/**
 * Delete a comment (only the author can delete)
 */
export async function deleteComment(commentId: string): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  // Get comment to verify ownership and get recipe_id
  const { data: existingComment } = await supabase
    .from('recipe_comments')
    .select('user_id, recipe_id')
    .eq('id', commentId)
    .single()

  if (!existingComment || existingComment.user_id !== user.id) {
    return { success: false, error: 'You can only delete your own comments' }
  }

  const { error } = await supabase
    .from('recipe_comments')
    .delete()
    .eq('id', commentId)

  if (error) {
    console.error('Error deleting comment:', error)
    return { success: false, error: 'Failed to delete comment' }
  }

  revalidatePath(`/recipes/${existingComment.recipe_id}`)
  return { success: true }
}
