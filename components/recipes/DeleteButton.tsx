'use client'

import { deleteRecipe } from '@/lib/actions/recipes'
import { useState } from 'react'

interface DeleteButtonProps {
  recipeId: string
}

export function DeleteButton({ recipeId }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this recipe? This cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    await deleteRecipe(recipeId)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50"
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  )
}
