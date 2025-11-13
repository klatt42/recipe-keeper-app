import { getPromoCodes } from '@/lib/actions/admin'
import Link from 'next/link'
import { PromoCodesList } from './PromoCodesList'

export const metadata = {
  title: 'Promo Codes - Admin',
}

export default async function PromoCodesPage() {
  const { promoCodes, error } = await getPromoCodes()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Promo Codes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage promotional codes and special access
          </p>
        </div>
        <Link
          href="/admin/promo-codes/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          + Create Promo Code
        </Link>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <PromoCodesList promoCodes={promoCodes} />
    </div>
  )
}
