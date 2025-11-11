import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Get user's subscription status
 */
export async function getUserSubscription(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching subscription:', error)
    return null
  }

  return data
}

/**
 * Check if user can create a recipe (under limit)
 */
export async function canCreateRecipe(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('can_create_recipe', { p_user_id: userId })

  if (error) {
    console.error('Error checking recipe limit:', error)
    return false
  }

  return data
}

/**
 * Increment user's recipe count
 */
export async function incrementRecipeCount(supabase: SupabaseClient, userId: string): Promise<void> {
  const { error } = await supabase
    .rpc('increment_recipe_count', { p_user_id: userId })

  if (error) {
    console.error('Error incrementing recipe count:', error)
    throw error
  }
}

/**
 * Get subscription stats for a user
 */
export async function getSubscriptionStats(supabase: SupabaseClient, userId: string) {
  const subscription = await getUserSubscription(supabase, userId)

  if (!subscription) {
    return {
      isPremium: false,
      recipeCount: 0,
      recipeLimit: 25,
      recipesRemaining: 25,
      status: 'free',
    }
  }

  const isPremium = subscription.status === 'active'
  const recipesRemaining = isPremium
    ? Infinity
    : Math.max(0, subscription.recipe_limit - subscription.recipe_count)

  return {
    isPremium,
    recipeCount: subscription.recipe_count || 0,
    recipeLimit: subscription.recipe_limit || 25,
    recipesRemaining,
    status: subscription.status,
    planType: subscription.plan_type,
    currentPeriodEnd: subscription.current_period_end,
    referralCode: subscription.referral_code,
  }
}
