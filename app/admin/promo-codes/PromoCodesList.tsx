'use client'

import { useState } from 'react'
import { updatePromoCode, deletePromoCode } from '@/lib/actions/admin'
import { useRouter } from 'next/navigation'

interface PromoCode {
  id: string
  code: string
  name: string
  description: string | null
  type: string
  max_recipes: number | null
  max_uses: number | null
  current_uses: number
  active_uses: number
  discount_percent: number
  duration_days: number | null
  expires_at: string | null
  is_active: boolean
  created_by: string
  created_at: string
}

export function PromoCodesList({ promoCodes }: { promoCodes: PromoCode[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setLoading(id)
    await updatePromoCode(id, { is_active: !currentStatus })
    router.refresh()
    setLoading(null)
  }

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete promo code "${code}"?`)) {
      return
    }

    setLoading(id)
    const result = await deletePromoCode(id)

    if (result.success) {
      router.refresh()
    } else {
      alert(`Error: ${result.error}`)
    }

    setLoading(null)
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      family: 'bg-purple-100 text-purple-800',
      trial: 'bg-blue-100 text-blue-800',
      discount: 'bg-green-100 text-green-800',
      limited: 'bg-yellow-100 text-yellow-800',
      influencer: 'bg-pink-100 text-pink-800',
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  if (promoCodes.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        <h3 className="mt-4 text-lg font-semibold text-gray-900">No promo codes yet</h3>
        <p className="mt-2 text-sm text-gray-600">Get started by creating your first promo code.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
              Code
            </th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Type
            </th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Limits
            </th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Usage
            </th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Status
            </th>
            <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {promoCodes.map((promo) => (
            <tr key={promo.id} className={loading === promo.id ? 'opacity-50' : ''}>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                <div className="font-mono font-bold text-indigo-600">{promo.code}</div>
                <div className="text-sm text-gray-500">{promo.name}</div>
                {promo.description && (
                  <div className="text-xs text-gray-400 mt-1">{promo.description}</div>
                )}
              </td>
              <td className="whitespace-nowrap px-3 py-4">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getTypeColor(promo.type)}`}
                >
                  {promo.type}
                </span>
              </td>
              <td className="px-3 py-4 text-sm text-gray-500">
                <div>
                  {promo.max_recipes ? `${promo.max_recipes} recipes` : 'Unlimited recipes'}
                </div>
                <div className="text-xs text-gray-400">
                  {promo.max_uses ? `${promo.max_uses} max uses` : 'Unlimited uses'}
                </div>
                {promo.duration_days && (
                  <div className="text-xs text-gray-400">{promo.duration_days} days</div>
                )}
                {promo.discount_percent > 0 && (
                  <div className="text-xs text-green-600">{promo.discount_percent}% off</div>
                )}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm">
                <div className="font-semibold text-gray-900">
                  {promo.active_uses} active
                </div>
                <div className="text-xs text-gray-500">
                  {promo.current_uses} total
                </div>
              </td>
              <td className="whitespace-nowrap px-3 py-4">
                <button
                  onClick={() => handleToggleActive(promo.id, promo.is_active)}
                  disabled={loading === promo.id}
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    promo.is_active
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  } disabled:opacity-50 transition-colors`}
                >
                  {promo.is_active ? '✓ Active' : '✗ Inactive'}
                </button>
                {promo.expires_at && (
                  <div className="mt-1 text-xs text-gray-400">
                    Expires {new Date(promo.expires_at).toLocaleDateString()}
                  </div>
                )}
              </td>
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <button
                  onClick={() => handleDelete(promo.id, promo.code)}
                  disabled={loading === promo.id}
                  className="text-red-600 hover:text-red-900 disabled:opacity-50"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
