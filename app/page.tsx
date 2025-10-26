import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getRecipes } from '@/lib/actions/recipes'
import { HomeClient } from '@/components/home/HomeClient'

interface HomePageProps {
  searchParams: Promise<{
    search?: string
    sort?: string
    favorites?: string
    category?: string
  }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const params = await searchParams
  const { recipes } = await getRecipes({
    search: params.search,
    sort: params.sort,
    favoritesOnly: params.favorites === 'true',
    category: params.category,
  })

  return (
    <HomeClient
      initialRecipes={recipes}
      userEmail={user.email || ''}
      userId={user.id}
    />
  )
}
