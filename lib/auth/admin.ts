import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    return false
  }

  // Hardcoded super admin (fallback)
  if (user.email === 'klatt42@gmail.com') {
    return true
  }

  // Check if user is in admin_users table
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', user.email)
    .eq('is_active', true)
    .single()

  return !!adminUser
}

export async function requireAdmin() {
  const admin = await isAdmin()

  if (!admin) {
    redirect('/')
  }
}

export async function getAdminUser() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    return null
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', user.email)
    .eq('is_active', true)
    .single()

  return adminUser
}

export async function hasPermission(permission: string): Promise<boolean> {
  const adminUser = await getAdminUser()

  if (!adminUser) {
    return false
  }

  // Super admins have all permissions
  if (adminUser.role === 'super_admin') {
    return true
  }

  // Check specific permission
  return adminUser.permissions?.[permission] === true
}
