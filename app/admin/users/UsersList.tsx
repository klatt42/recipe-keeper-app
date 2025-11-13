'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface User {
  id: string
  email: string
  full_name: string | null
  created_at: string
  subscriptions?: Array<{
    status: string
    plan_type: string | null
    recipe_count: number
    recipe_limit: number
    created_at: string
  }>
}

interface UsersListProps {
  initialUsers: User[]
}

export function UsersList({ initialUsers }: UsersListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')
  const currentTier = searchParams.get('tier') || 'all'

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (searchInput) {
        params.set('search', searchInput)
      } else {
        params.delete('search')
      }
      router.push(`/admin/users?${params.toString()}`)
    })
  }

  const handleTierFilter = (tier: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (tier === 'all') {
        params.delete('tier')
      } else {
        params.set('tier', tier)
      }
      router.push(`/admin/users?${params.toString()}`)
    })
  }

  const getTierBadge = (user: User) => {
    const sub = user.subscriptions?.[0]

    if (!sub || sub.status !== 'active') {
      return <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">Free</span>
    }

    if (sub.plan_type === 'monthly') {
      return <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">Monthly</span>
    }

    if (sub.plan_type === 'annual') {
      return <span className="inline-flex rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-800">Annual</span>
    }

    return <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">Free</span>
  }

  const tierCounts = {
    all: initialUsers.length,
    free: initialUsers.filter(u => !u.subscriptions?.[0] || u.subscriptions[0].status !== 'active').length,
    monthly: initialUsers.filter(u => u.subscriptions?.[0]?.plan_type === 'monthly').length,
    annual: initialUsers.filter(u => u.subscriptions?.[0]?.plan_type === 'annual').length,
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm ring-1 ring-gray-900/5">
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by email or name..."
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {isPending ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Tier Filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => handleTierFilter('all')}
            disabled={isPending}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              currentTier === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({tierCounts.all})
          </button>
          <button
            onClick={() => handleTierFilter('free')}
            disabled={isPending}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              currentTier === 'free'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Free ({tierCounts.free})
          </button>
          <button
            onClick={() => handleTierFilter('monthly')}
            disabled={isPending}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              currentTier === 'monthly'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Monthly ({tierCounts.monthly})
          </button>
          <button
            onClick={() => handleTierFilter('annual')}
            disabled={isPending}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              currentTier === 'annual'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Annual ({tierCounts.annual})
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg">
        {initialUsers.length === 0 ? (
          <div className="p-12 text-center">
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No users found</h3>
            <p className="mt-2 text-sm text-gray-600">
              {searchInput || currentTier !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No users have signed up yet'}
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  User
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Tier
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Recipes
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {initialUsers.map((user) => {
                const sub = user.subscriptions?.[0]
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                      <div>
                        <div className="font-medium text-gray-900">{user.email}</div>
                        {user.full_name && (
                          <div className="text-sm text-gray-500">{user.full_name}</div>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4">
                      {getTierBadge(user)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {sub ? (
                        <div>
                          <span className="font-semibold text-gray-900">{sub.recipe_count}</span>
                          {' / '}
                          {sub.recipe_limit === 999999 ? '∞' : sub.recipe_limit}
                        </div>
                      ) : (
                        <span className="text-gray-400">No data</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {initialUsers.length > 0 && (
        <div className="text-sm text-gray-500 text-center">
          Showing {initialUsers.length} user{initialUsers.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
