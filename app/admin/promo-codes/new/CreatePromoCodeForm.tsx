'use client'

import { useState } from 'react'
import { createPromoCode } from '@/lib/actions/admin'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function CreatePromoCodeForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'family',
    max_recipes: '50',
    max_uses: '',
    discount_percent: '0',
    duration_days: '',
    expires_at: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const data = {
      code: formData.code.toUpperCase(),
      name: formData.name,
      description: formData.description || undefined,
      type: formData.type,
      max_recipes: formData.max_recipes ? parseInt(formData.max_recipes) : undefined,
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : undefined,
      discount_percent: parseInt(formData.discount_percent),
      duration_days: formData.duration_days ? parseInt(formData.duration_days) : undefined,
      expires_at: formData.expires_at || undefined,
      features_enabled: {
        premium: true,
        ai_features: true,
        export: true,
      },
    }

    const result = await createPromoCode(data)

    if (result.success) {
      router.push('/admin/promo-codes')
    } else {
      setError(result.error || 'Failed to create promo code')
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Code */}
      <div>
        <label htmlFor="code" className="block text-sm font-medium text-gray-900">
          Promo Code *
        </label>
        <input
          type="text"
          name="code"
          id="code"
          required
          value={formData.code}
          onChange={handleChange}
          placeholder="FAMILY2025"
          className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm uppercase font-mono"
        />
        <p className="mt-1 text-xs text-gray-500">Will be converted to uppercase</p>
      </div>

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-900">
          Display Name *
        </label>
        <input
          type="text"
          name="name"
          id="name"
          required
          value={formData.name}
          onChange={handleChange}
          placeholder="Family & Friends"
          className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-900">
          Description
        </label>
        <textarea
          name="description"
          id="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          placeholder="Free access for family and friends..."
          className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      {/* Type */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-900">
          Type *
        </label>
        <select
          name="type"
          id="type"
          required
          value={formData.type}
          onChange={handleChange}
          className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="family">Family - For friends and family testing</option>
          <option value="trial">Trial - Limited time full access</option>
          <option value="discount">Discount - Percentage off subscription</option>
          <option value="limited">Limited - Special limited offer</option>
          <option value="influencer">Influencer - Attribution tracking</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Max Recipes */}
        <div>
          <label htmlFor="max_recipes" className="block text-sm font-medium text-gray-900">
            Max Recipes
          </label>
          <input
            type="number"
            name="max_recipes"
            id="max_recipes"
            value={formData.max_recipes}
            onChange={handleChange}
            placeholder="50"
            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">Leave empty for unlimited</p>
        </div>

        {/* Max Uses */}
        <div>
          <label htmlFor="max_uses" className="block text-sm font-medium text-gray-900">
            Max Uses
          </label>
          <input
            type="number"
            name="max_uses"
            id="max_uses"
            value={formData.max_uses}
            onChange={handleChange}
            placeholder="Unlimited"
            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">Leave empty for unlimited</p>
        </div>

        {/* Discount Percent */}
        <div>
          <label htmlFor="discount_percent" className="block text-sm font-medium text-gray-900">
            Discount Percent
          </label>
          <input
            type="number"
            name="discount_percent"
            id="discount_percent"
            min="0"
            max="100"
            value={formData.discount_percent}
            onChange={handleChange}
            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">0-100%</p>
        </div>

        {/* Duration Days */}
        <div>
          <label htmlFor="duration_days" className="block text-sm font-medium text-gray-900">
            Duration (Days)
          </label>
          <input
            type="number"
            name="duration_days"
            id="duration_days"
            value={formData.duration_days}
            onChange={handleChange}
            placeholder="30"
            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">Leave empty for no expiration</p>
        </div>
      </div>

      {/* Expires At */}
      <div>
        <label htmlFor="expires_at" className="block text-sm font-medium text-gray-900">
          Expires At (Date)
        </label>
        <input
          type="date"
          name="expires_at"
          id="expires_at"
          value={formData.expires_at}
          onChange={handleChange}
          className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">Optional hard expiration date</p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <Link
          href="/admin/promo-codes"
          className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Promo Code'}
        </button>
      </div>
    </form>
  )
}
