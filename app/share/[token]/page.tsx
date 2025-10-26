import { getSharedRecipe } from '@/lib/actions/share'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface SharePageProps {
  params: Promise<{ token: string }>
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params
  const { recipe, error } = await getSharedRecipe(token)

  if (error || !recipe) {
    notFound()
  }

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Recipe Keeper</h1>
              <span className="ml-3 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                Shared Recipe
              </span>
            </div>
            <Link
              href="/signup"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              Create Your Own
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Recipe Content */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          {/* Image */}
          {recipe.image_url && (
            <div className="aspect-video w-full">
              <img
                src={recipe.image_url}
                alt={recipe.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="p-6 sm:p-8">
            {/* Title */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                {recipe.title}
              </h1>
              {recipe.category && (
                <span className="mt-3 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                  {recipe.category}
                </span>
              )}
              {recipe.source && (
                <p className="mt-2 text-sm text-gray-600">
                  Source: {recipe.source}
                </p>
              )}
            </div>

            {/* Meta Information */}
            <div className="mb-8 flex flex-wrap gap-6 border-b border-gray-200 pb-6">
              {totalTime > 0 && (
                <div className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Total Time</p>
                    <p className="text-sm text-gray-600">{totalTime} minutes</p>
                  </div>
                </div>
              )}
              {recipe.prep_time && (
                <div className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Prep</p>
                    <p className="text-sm text-gray-600">{recipe.prep_time} min</p>
                  </div>
                </div>
              )}
              {recipe.cook_time && (
                <div className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Cook</p>
                    <p className="text-sm text-gray-600">{recipe.cook_time} min</p>
                  </div>
                </div>
              )}
              {recipe.servings && (
                <div className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Servings</p>
                    <p className="text-sm text-gray-600">{recipe.servings}</p>
                  </div>
                </div>
              )}
              {recipe.rating && (
                <div className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-yellow-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Rating</p>
                    <p className="text-sm text-gray-600">{recipe.rating}/5</p>
                  </div>
                </div>
              )}
            </div>

            {/* Ingredients */}
            <div className="mb-8">
              <h2 className="mb-4 text-xl font-bold text-gray-900">Ingredients</h2>
              <div className="rounded-lg bg-gray-50 p-6">
                <ul className="space-y-2">
                  {recipe.ingredients.split('\n').map((ingredient, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />
                      <span className="text-gray-700">{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Instructions */}
            <div className="mb-8">
              <h2 className="mb-4 text-xl font-bold text-gray-900">Instructions</h2>
              <div className="prose prose-gray max-w-none">
                <div className="whitespace-pre-wrap text-gray-700">
                  {recipe.instructions}
                </div>
              </div>
            </div>

            {/* Notes */}
            {recipe.notes && (
              <div className="mb-8">
                <h2 className="mb-4 text-xl font-bold text-gray-900">Notes</h2>
                <div className="rounded-lg bg-yellow-50 p-6">
                  <p className="whitespace-pre-wrap text-gray-700">{recipe.notes}</p>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 p-6 text-center">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Love this recipe?
              </h3>
              <p className="mb-4 text-sm text-gray-600">
                Create your own free account to save and organize your favorite recipes.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                Get Started for Free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
