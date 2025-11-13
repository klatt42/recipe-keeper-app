#!/usr/bin/env node
/**
 * Create subscription records for existing users who don't have one
 * This is needed for users created before the subscriptions migration was run
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createMissingSubscriptions() {
  console.log('Checking for users without subscriptions...')

  // Get all users
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers()

  if (usersError) {
    console.error('Error fetching users:', usersError)
    process.exit(1)
  }

  console.log(`Found ${users.users.length} total users`)

  // Get existing subscriptions
  const { data: subscriptions, error: subsError } = await supabase
    .from('subscriptions')
    .select('user_id')

  if (subsError) {
    console.error('Error fetching subscriptions:', subsError)
    process.exit(1)
  }

  const userIdsWithSubs = new Set(subscriptions.map(s => s.user_id))
  const usersWithoutSubs = users.users.filter(u => !userIdsWithSubs.has(u.id))

  console.log(`Found ${usersWithoutSubs.length} users without subscriptions`)

  if (usersWithoutSubs.length === 0) {
    console.log('All users have subscriptions! Nothing to do.')
    return
  }

  // Create subscriptions for users without them
  const newSubscriptions = usersWithoutSubs.map(user => ({
    user_id: user.id,
    referral_code: generateReferralCode(),
    status: 'free',
    plan_type: 'free',
    recipe_count: 0,
    recipe_limit: 25,
  }))

  const { data, error } = await supabase
    .from('subscriptions')
    .insert(newSubscriptions)
    .select()

  if (error) {
    console.error('Error creating subscriptions:', error)
    process.exit(1)
  }

  console.log(`✅ Successfully created ${data.length} subscription records`)
  data.forEach(sub => {
    console.log(`  - User ${sub.user_id.substring(0, 8)}... → Code: ${sub.referral_code}`)
  })
}

function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

createMissingSubscriptions()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch(error => {
    console.error('Unexpected error:', error)
    process.exit(1)
  })
