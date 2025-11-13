import { requireAdmin } from '@/lib/auth/admin'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This will redirect if not admin
  await requireAdmin()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="text-2xl font-bold text-white">
                🛠️ Admin Dashboard
              </Link>
              <nav className="flex gap-4">
                <Link
                  href="/admin"
                  className="rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/promo-codes"
                  className="rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors"
                >
                  Promo Codes
                </Link>
                <Link
                  href="/admin/users"
                  className="rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors"
                >
                  Users
                </Link>
                <Link
                  href="/admin/revenue"
                  className="rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors"
                >
                  Revenue
                </Link>
              </nav>
            </div>
            <Link
              href="/"
              className="rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
            >
              ← Back to App
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
