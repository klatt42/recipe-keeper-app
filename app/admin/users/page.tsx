import { getUsers } from '@/lib/actions/admin'
import { UsersList } from './UsersList'

export const metadata = {
  title: 'Users - Admin',
}

interface UsersPageProps {
  searchParams: Promise<{
    search?: string
    tier?: string
  }>
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams
  const { users } = await getUsers({
    search: params.search,
    tier: params.tier,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <p className="mt-1 text-sm text-gray-500">
          Browse and manage all registered users
        </p>
      </div>

      <UsersList initialUsers={users} />
    </div>
  )
}
