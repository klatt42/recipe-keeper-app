'use server'

import { createClient } from '@/lib/supabase/server'

export async function applyPromoCode(code: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Call the database function to apply promo code
  const { data, error } = await supabase.rpc('apply_promo_code', {
    p_user_id: user.id,
    p_code: code.toUpperCase(),
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // The function returns a JSONB object
  if (data && typeof data === 'object') {
    if (data.success === false) {
      return { success: false, error: data.error || 'Failed to apply promo code' }
    }

    return {
      success: true,
      promo_code: data.promo_code,
      promo_name: data.promo_name,
      max_recipes: data.max_recipes,
      expires_at: data.expires_at,
    }
  }

  return { success: false, error: 'Unexpected response from server' }
}

export async function getActivePromoCode() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { has_promo: false }
  }

  // Call the database function to get active promo
  const { data, error } = await supabase.rpc('get_active_promo_code', {
    p_user_id: user.id,
  })

  if (error || !data) {
    return { has_promo: false }
  }

  return data
}
