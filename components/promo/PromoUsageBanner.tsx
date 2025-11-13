'use client'

import { useEffect, useState } from 'react'
import { getActivePromoCode } from '@/lib/actions/promo'

interface PromoData {
  has_promo: boolean
  code?: string
  name?: string
  type?: string
  max_recipes?: number
  recipes_used?: number
  expires_at?: string
  applied_at?: string
}

export function PromoUsageBanner() {
  const [promoData, setPromoData] = useState<PromoData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPromoData()
  }, [])

  const loadPromoData = async () => {
    const data = await getActivePromoCode()
    setPromoData(data)
    setLoading(false)
  }

  if (loading || !promoData?.has_promo) {
    return null
  }

  const recipesUsed = promoData.recipes_used || 0
  const maxRecipes = promoData.max_recipes
  const percentUsed = maxRecipes ? (recipesUsed / maxRecipes) * 100 : 0
  const isUnlimited = !maxRecipes || maxRecipes === 999999

  // Color coding based on usage
  let colorClasses = 'from-blue-500 to-cyan-500 border-blue-300'
  let progressColor = 'bg-blue-500'

  if (!isUnlimited) {
    if (percentUsed >= 90) {
      colorClasses = 'from-red-500 to-orange-500 border-red-300'
      progressColor = 'bg-red-500'
    } else if (percentUsed >= 70) {
      colorClasses = 'from-yellow-500 to-amber-500 border-yellow-300'
      progressColor = 'bg-yellow-500'
    } else {
      colorClasses = 'from-green-500 to-emerald-500 border-green-300'
      progressColor = 'bg-green-500'
    }
  }

  return (
    <div className={`mb-6 rounded-xl bg-gradient-to-r ${colorClasses} p-4 shadow-lg border-2`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-white/20 backdrop-blur-sm p-2">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
          <div className="text-white">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">
                {promoData.name}
              </h3>
              <span className="rounded-full bg-white/30 px-2 py-0.5 text-xs font-semibold uppercase">
                {promoData.code}
              </span>
            </div>
            <p className="mt-1 text-sm font-medium text-white/90">
              {isUnlimited ? (
                <>
                  <span className="font-bold">{recipesUsed}</span> recipes created • Unlimited access
                </>
              ) : (
                <>
                  <span className="font-bold">{recipesUsed}</span> of <span className="font-bold">{maxRecipes}</span> recipes used
                </>
              )}
            </p>
            {promoData.expires_at && (
              <p className="mt-0.5 text-xs text-white/80">
                Expires {new Date(promoData.expires_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {!isUnlimited && (
        <div className="mt-3">
          <div className="h-2 w-full rounded-full bg-white/30">
            <div
              className={`h-2 rounded-full ${progressColor} transition-all duration-500`}
              style={{ width: `${Math.min(percentUsed, 100)}%` }}
            />
          </div>
          {maxRecipes && recipesUsed >= maxRecipes && (
            <p className="mt-2 text-sm font-semibold text-white">
              ⚠️ You've reached your recipe limit. Upgrade for unlimited access!
            </p>
          )}
        </div>
      )}
    </div>
  )
}
