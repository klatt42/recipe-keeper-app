import { getRecipe } from '@/lib/actions/recipes'
import { getRecipeImages } from '@/lib/actions/recipe-images'
import { notFound } from 'next/navigation'
import { RecipeDetailClient } from '@/components/recipes/RecipeDetailClient'

interface RecipePageProps {
  params: Promise<{ id: string }>
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { id } = await params
  const { recipe, error, parentRecipe } = await getRecipe(id)

  if (error || !recipe) {
    notFound()
  }

  // Get recipe images
  const { images } = await getRecipeImages(id)

  return <RecipeDetailClient recipe={recipe} images={images || []} parentRecipe={parentRecipe} />
}
