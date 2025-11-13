'use client'

import { useState } from 'react'
import { MessageSquare, Reply, Trash2, Edit2, X, Check } from 'lucide-react'
import { toast } from 'sonner'
import { createComment, updateComment, deleteComment } from '@/lib/actions/comments'
import type { RecipeComment } from '@/lib/types/comments'
import { formatDistanceToNow } from 'date-fns'

interface RecipeCommentsProps {
  recipeId: string
  initialComments: RecipeComment[]
  currentUserId?: string
}

interface CommentItemProps {
  comment: RecipeComment
  currentUserId?: string
  onReply: (parentId: string) => void
  onEdit: (commentId: string, content: string) => void
  onDelete: (commentId: string) => void
  depth: number
}

function CommentItem({ comment, currentUserId, onReply, onEdit, onDelete, depth }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)

  const isOwnComment = currentUserId === comment.user_id
  const userName = comment.profile?.display_name || 'Anonymous'
  const maxDepth = 3 // Limit nesting depth

  const handleSaveEdit = async () => {
    if (editContent.trim() === comment.content) {
      setIsEditing(false)
      return
    }

    const result = await updateComment(comment.id, editContent)
    if (result.success) {
      setIsEditing(false)
      toast.success('Comment updated')
    } else {
      toast.error(result.error || 'Failed to update comment')
    }
  }

  return (
    <div className={`${depth > 0 ? 'ml-8 mt-4' : 'mt-6'} ${depth > 0 ? 'border-l-2 border-gray-200 dark:border-gray-700 pl-4' : ''}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        {/* Comment Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{userName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                {comment.updated_at !== comment.created_at && ' (edited)'}
              </p>
            </div>
          </div>

          {isOwnComment && !isEditing && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                title="Edit comment"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (confirm('Delete this comment?')) {
                    onDelete(comment.id)
                  }
                }}
                className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                title="Delete comment"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Comment Content */}
        {isEditing ? (
          <div className="mt-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white resize-none"
              rows={3}
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-500"
              >
                <Check className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditContent(comment.content)
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.content}</p>

            {/* Reply Button */}
            {depth < maxDepth && (
              <button
                onClick={() => onReply(comment.id)}
                className="mt-2 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <Reply className="w-4 h-4" />
                Reply
              </button>
            )}
          </>
        )}
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function RecipeComments({ recipeId, initialComments, currentUserId }: RecipeCommentsProps) {
  const [comments, setComments] = useState<RecipeComment[]>(initialComments)
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createComment(recipeId, {
        content: newComment,
        parent_id: null,
      })

      if (result.success) {
        setNewComment('')
        toast.success('Comment added!')
        // Refresh page to show new comment
        window.location.reload()
      } else {
        toast.error(result.error || 'Failed to add comment')
      }
    } catch (error) {
      toast.error('Failed to add comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddReply = async (parentId: string) => {
    if (!replyContent.trim()) {
      toast.error('Reply cannot be empty')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createComment(recipeId, {
        content: replyContent,
        parent_id: parentId,
      })

      if (result.success) {
        setReplyContent('')
        setReplyingTo(null)
        toast.success('Reply added!')
        // Refresh page to show new reply
        window.location.reload()
      } else {
        toast.error(result.error || 'Failed to add reply')
      }
    } catch (error) {
      toast.error('Failed to add reply')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    const result = await deleteComment(commentId)
    if (result.success) {
      toast.success('Comment deleted')
      // Refresh page to show updated comments
      window.location.reload()
    } else {
      toast.error(result.error || 'Failed to delete comment')
    }
  }

  const totalCommentCount = () => {
    let count = comments.length
    comments.forEach((comment) => {
      if (comment.replies) {
        count += countReplies(comment.replies)
      }
    })
    return count
  }

  const countReplies = (replies: RecipeComment[]): number => {
    let count = replies.length
    replies.forEach((reply) => {
      if (reply.replies) {
        count += countReplies(reply.replies)
      }
    })
    return count
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Comments {totalCommentCount() > 0 && `(${totalCommentCount()})`}
        </h3>
      </div>

      {/* New Comment Form */}
      <div className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white resize-none"
          rows={3}
        />
        <button
          onClick={handleAddComment}
          disabled={isSubmitting || !newComment.trim()}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </button>
      </div>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No comments yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-1">
          {comments.map((comment) => (
            <div key={comment.id}>
              <CommentItem
                comment={comment}
                currentUserId={currentUserId}
                onReply={(parentId) => setReplyingTo(parentId)}
                onEdit={() => {}}
                onDelete={handleDeleteComment}
                depth={0}
              />

              {/* Reply Form */}
              {replyingTo === comment.id && (
                <div className="ml-8 mt-3 pl-4 border-l-2 border-blue-500">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white resize-none"
                    rows={2}
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleAddReply(comment.id)}
                      disabled={isSubmitting || !replyContent.trim()}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Posting...' : 'Post Reply'}
                    </button>
                    <button
                      onClick={() => {
                        setReplyingTo(null)
                        setReplyContent('')
                      }}
                      className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
