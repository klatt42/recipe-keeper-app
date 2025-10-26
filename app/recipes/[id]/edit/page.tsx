import { getRecipe } from '@/lib/actions/recipes'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { RecipeForm } from '@/components/recipes/RecipeForm'

interface EditRecipePageProps {
  params: Promise<{ id: string }>
}

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  const { id } = await params
  const { recipe, error } = await getRecipe(id)

  if (error || !recipe) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/recipes/${id}`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to recipe
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Edit Recipe
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Update the details for "{recipe.title}"
          </p>
        </div>

        {/* Form */}
        <div className="rounded-lg bg-white p-6 shadow sm:p-8">
          <RecipeForm
            mode="edit"
            initialData={{
              ...recipe,
              id: recipe.id,
              book_id: recipe.book_id,
            }}
          />
        </div>
      </div>
    </div>
  )
}
