import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function handleSignOut(request: Request) {
  const supabase = await createClient()

  // Sign out the user
  await supabase.auth.signOut()

  // Redirect to login page
  const origin = new URL(request.url).origin
  return NextResponse.redirect(`${origin}/login`)
}

export async function POST(request: Request) {
  return handleSignOut(request)
}

export async function GET(request: Request) {
  return handleSignOut(request)
}
