import { getRecipe } from '@/lib/actions/recipes'
import { getRecipeImages } from '@/lib/actions/recipe-images'
import { getRecipeComments } from '@/lib/actions/comments'
import { getRecipeRatingStats } from '@/lib/actions/ratings'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { RecipeDetailClient } from '@/components/recipes/RecipeDetailClient'

interface RecipePageProps {
  params: Promise<{ id: string }>
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { id } = await params

  // Fetch all data in parallel for better performance
  const [
    { recipe, error, parentRecipe },
    { images },
    { comments },
    ratingStats,
    { data: { user } }
  ] = await Promise.all([
    getRecipe(id),
    getRecipeImages(id),
    getRecipeComments(id),
    getRecipeRatingStats(id),
    createClient().then(supabase => supabase.auth.getUser())
  ])

  if (error || !recipe) {
    notFound()
  }

  return (
    <RecipeDetailClient
      recipe={recipe}
      images={images || []}
      parentRecipe={parentRecipe}
      comments={comments || []}
      ratingStats={ratingStats}
      currentUserId={user?.id}
    />
  )
}
