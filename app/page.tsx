import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getRecipes } from '@/lib/actions/recipes'
import { HomeClient } from '@/components/home/HomeClient'
import { applyPromoCode } from '@/lib/actions/promo'
import { isAdmin } from '@/lib/auth/admin'

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

  // Check if user is an admin
  const userIsAdmin = await isAdmin()

  // Check for pending promo code in user metadata
  const promoCode = user.user_metadata?.promo_code
  let promoResult = null

  if (promoCode && typeof promoCode === 'string') {
    // Apply the promo code
    promoResult = await applyPromoCode(promoCode)

    // Clear the promo code from metadata after attempting to apply (success or failure)
    if (promoResult) {
      await supabase.auth.updateUser({
        data: {
          promo_code: null,
          promo_applied: promoResult.success,
          promo_applied_at: new Date().toISOString(),
        },
      })
    }
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
      promoResult={promoResult}
      isAdmin={userIsAdmin}
    />
  )
}
