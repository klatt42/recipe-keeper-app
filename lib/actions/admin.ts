'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin, hasPermission } from '@/lib/auth/admin'
import { revalidatePath } from 'next/cache'

// ============================================================================
// DASHBOARD METRICS
// ============================================================================

export async function getDashboardMetrics() {
  await requireAdmin()

  const supabase = await createClient()

  // Get all metrics in parallel for better performance
  const [
    usersData,
    recipesData,
    cookbooksData,
    subscriptionsData,
    promoData,
    eventsData,
    activationData,
    featureAdoptionData,
    retentionData,
    engagementData,
    cohortData,
  ] = await Promise.all([
    getUserMetrics(supabase),
    getRecipeMetrics(supabase),
    getCookbookMetrics(supabase),
    getSubscriptionMetrics(supabase),
    getPromoMetrics(supabase),
    getEventMetrics(supabase),
    getActivationMetrics(supabase),
    getFeatureAdoptionMetrics(supabase),
    getRetentionMetrics(supabase),
    getEngagementMetrics(supabase),
    getCohortRetention(supabase),
  ])

  return {
    users: usersData,
    recipes: recipesData,
    cookbooks: cookbooksData,
    subscriptions: subscriptionsData,
    promos: promoData,
    events: eventsData,
    activation: activationData,
    featureAdoption: featureAdoptionData,
    retention: retentionData,
    engagement: engagementData,
    cohorts: cohortData,
  }
}

async function getUserMetrics(supabase: any) {
  // Total users
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // Active users (created recipe in last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: activeUsers } = await supabase
    .from('recipes')
    .select('user_id')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .then((res: any) => ({
      ...res,
      data: res.data ? [...new Set(res.data.map((r: any) => r.user_id))] : [],
    }))

  // New signups this month
  const firstDayOfMonth = new Date()
  firstDayOfMonth.setDate(1)
  firstDayOfMonth.setHours(0, 0, 0, 0)

  const { count: newSignupsThisMonth } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', firstDayOfMonth.toISOString())

  // Users by tier
  const { data: subscriptionTiers } = await supabase
    .from('subscriptions')
    .select('status, plan_type')

  const tierCounts = {
    free: 0,
    monthly: 0,
    annual: 0,
    promo: 0,
  }

  const { count: promoUsers } = await supabase
    .from('user_promo_codes')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  subscriptionTiers?.forEach((sub: any) => {
    if (sub.status === 'active') {
      if (sub.plan_type === 'monthly') tierCounts.monthly++
      else if (sub.plan_type === 'annual') tierCounts.annual++
    } else {
      tierCounts.free++
    }
  })

  tierCounts.promo = promoUsers || 0

  return {
    total: totalUsers || 0,
    active: activeUsers?.length || 0,
    newThisMonth: newSignupsThisMonth || 0,
    byTier: tierCounts,
  }
}

async function getRecipeMetrics(supabase: any) {
  // Total recipes
  const { count: totalRecipes } = await supabase
    .from('recipes')
    .select('*', { count: 'exact', head: true })

  // Recipes created this month
  const firstDayOfMonth = new Date()
  firstDayOfMonth.setDate(1)
  firstDayOfMonth.setHours(0, 0, 0, 0)

  const { count: recipesThisMonth } = await supabase
    .from('recipes')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', firstDayOfMonth.toISOString())

  // Average recipes per user
  const { count: userCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const avgPerUser = userCount && totalRecipes
    ? (totalRecipes / userCount).toFixed(1)
    : 0

  return {
    total: totalRecipes || 0,
    thisMonth: recipesThisMonth || 0,
    averagePerUser: parseFloat(avgPerUser as string),
  }
}

async function getCookbookMetrics(supabase: any) {
  // Total cookbooks
  const { count: totalCookbooks } = await supabase
    .from('recipe_books')
    .select('*', { count: 'exact', head: true })

  // Shared cookbooks
  const { count: sharedCookbooks } = await supabase
    .from('recipe_books')
    .select('*', { count: 'exact', head: true })
    .eq('is_shared', true)

  // Get cookbook with most members
  const { data: cookbookMembers } = await supabase
    .from('recipe_book_members')
    .select('book_id')

  const memberCounts: { [key: string]: number } = {}
  cookbookMembers?.forEach((member: any) => {
    memberCounts[member.book_id] = (memberCounts[member.book_id] || 0) + 1
  })

  const maxMembers = Math.max(...Object.values(memberCounts), 0)

  return {
    total: totalCookbooks || 0,
    shared: sharedCookbooks || 0,
    maxMembers,
  }
}

async function getSubscriptionMetrics(supabase: any) {
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('status, plan_type, stripe_price_id')

  const active = subscriptions?.filter((s: any) => s.status === 'active').length || 0
  const canceled = subscriptions?.filter((s: any) => s.status === 'canceled').length || 0

  // Calculate MRR (Monthly Recurring Revenue)
  // Assuming monthly = $9.99, annual = $99/year = $8.25/month
  let mrr = 0
  subscriptions?.forEach((sub: any) => {
    if (sub.status === 'active') {
      if (sub.plan_type === 'monthly') {
        mrr += 9.99
      } else if (sub.plan_type === 'annual') {
        mrr += 8.25 // $99/12
      }
    }
  })

  // Calculate ARR (Annual Recurring Revenue)
  const arr = parseFloat((mrr * 12).toFixed(2))

  // Calculate LTV (Customer Lifetime Value)
  // LTV = (ARPU × Gross Margin %) / Churn Rate
  // Assuming 80% gross margin for SaaS
  const grossMargin = 0.80
  const arpu = subscriptions?.length > 0 ? parseFloat((mrr / subscriptions.length).toFixed(2)) : 0

  // Get churn rate from subscription_events
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  const { count: churnedLastYear } = await supabase
    .from('subscription_events')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'cancelled')
    .gte('occurred_at', oneYearAgo.toISOString())

  const avgActiveUsers = (active + canceled) / 2 || 1
  const churnRate = avgActiveUsers > 0 ? (churnedLastYear || 0) / avgActiveUsers : 0

  const ltv = churnRate > 0 ? parseFloat(((arpu * grossMargin * 12) / churnRate).toFixed(2)) : 0

  return {
    active,
    canceled,
    mrr: parseFloat(mrr.toFixed(2)),
    arr,
    arpu,
    ltv,
    churnRate: parseFloat((churnRate * 100).toFixed(2)), // as percentage
  }
}

async function getPromoMetrics(supabase: any) {
  const { data: promoCodes } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('is_active', true)

  const { count: totalUses } = await supabase
    .from('user_promo_codes')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  return {
    activeCodes: promoCodes?.length || 0,
    totalUses: totalUses || 0,
    codes: promoCodes || [],
  }
}

async function getEventMetrics(supabase: any) {
  // Churn this month
  const firstDayOfMonth = new Date()
  firstDayOfMonth.setDate(1)
  firstDayOfMonth.setHours(0, 0, 0, 0)

  const { count: churnThisMonth } = await supabase
    .from('subscription_events')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'cancelled')
    .gte('occurred_at', firstDayOfMonth.toISOString())

  // Total churn
  const { count: totalChurn } = await supabase
    .from('subscription_events')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'cancelled')

  return {
    churnThisMonth: churnThisMonth || 0,
    totalChurn: totalChurn || 0,
  }
}

async function getActivationMetrics(supabase: any) {
  // Activation Rate: % of users who created at least 1 recipe
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // Users who have created at least one recipe
  const { data: usersWithRecipes } = await supabase
    .from('recipes')
    .select('user_id')
    .then((res: any) => ({
      ...res,
      data: res.data ? [...new Set(res.data.map((r: any) => r.user_id))] : [],
    }))

  const activatedUsers = usersWithRecipes?.length || 0
  const activationRate = totalUsers && totalUsers > 0
    ? parseFloat(((activatedUsers / totalUsers) * 100).toFixed(2))
    : 0

  return {
    activatedUsers,
    totalUsers: totalUsers || 0,
    activationRate, // percentage
  }
}

async function getFeatureAdoptionMetrics(supabase: any) {
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // Users with cookbooks
  const { data: usersWithCookbooks } = await supabase
    .from('recipe_books')
    .select('user_id')
    .then((res: any) => ({
      ...res,
      data: res.data ? [...new Set(res.data.map((r: any) => r.user_id))] : [],
    }))

  // Users with shared cookbooks
  const { data: usersWithSharedCookbooks } = await supabase
    .from('recipe_books')
    .select('user_id')
    .eq('is_shared', true)
    .then((res: any) => ({
      ...res,
      data: res.data ? [...new Set(res.data.map((r: any) => r.user_id))] : [],
    }))

  // Users who are members of shared cookbooks
  const { data: sharedCookbookMembers } = await supabase
    .from('recipe_book_members')
    .select('user_id')
    .then((res: any) => ({
      ...res,
      data: res.data ? [...new Set(res.data.map((r: any) => r.user_id))] : [],
    }))

  // Users with multiple cookbooks
  const { data: cookbookCounts } = await supabase
    .from('recipe_books')
    .select('user_id')

  const userCookbookCounts: { [key: string]: number } = {}
  cookbookCounts?.forEach((cb: any) => {
    userCookbookCounts[cb.user_id] = (userCookbookCounts[cb.user_id] || 0) + 1
  })

  const usersWithMultipleCookbooks = Object.values(userCookbookCounts).filter(count => count > 1).length

  // Users using promo codes
  const { data: promoUsers } = await supabase
    .from('user_promo_codes')
    .select('user_id')
    .eq('is_active', true)
    .then((res: any) => ({
      ...res,
      data: res.data ? [...new Set(res.data.map((r: any) => r.user_id))] : [],
    }))

  const totalUsersNum = totalUsers || 1

  return {
    cookbookAdoption: parseFloat(((usersWithCookbooks?.length || 0) / totalUsersNum * 100).toFixed(2)),
    sharedCookbookAdoption: parseFloat(((usersWithSharedCookbooks?.length || 0) / totalUsersNum * 100).toFixed(2)),
    cookbookCollaboration: parseFloat(((sharedCookbookMembers?.length || 0) / totalUsersNum * 100).toFixed(2)),
    multipleCookbookUsers: parseFloat((usersWithMultipleCookbooks / totalUsersNum * 100).toFixed(2)),
    promoCodeUsage: parseFloat(((promoUsers?.length || 0) / totalUsersNum * 100).toFixed(2)),
  }
}

async function getRetentionMetrics(supabase: any) {
  // Calculate NRR and GRR
  // For this, we need to look at MRR changes over time

  // Get current month and last month dates
  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  // For now, we'll calculate a simplified version
  // In production, you'd track MRR changes in subscription_events table

  const { data: currentSubs } = await supabase
    .from('subscriptions')
    .select('status, plan_type, created_at')
    .eq('status', 'active')

  const { data: churnEvents } = await supabase
    .from('subscription_events')
    .select('*')
    .eq('event_type', 'cancelled')
    .gte('occurred_at', lastMonthStart.toISOString())
    .lt('occurred_at', currentMonthStart.toISOString())

  // Calculate monthly/annual MRR
  let currentMRR = 0
  currentSubs?.forEach((sub: any) => {
    if (sub.plan_type === 'monthly') currentMRR += 9.99
    else if (sub.plan_type === 'annual') currentMRR += 8.25
  })

  // Estimate churned MRR (simplified)
  const churnedMRR = (churnEvents?.length || 0) * 9.99 // Assume avg plan

  // Simplified GRR calculation
  const startingMRR = currentMRR + churnedMRR
  const grr = startingMRR > 0
    ? parseFloat(((currentMRR / startingMRR) * 100).toFixed(2))
    : 100

  // For NRR, we'd need expansion tracking. For now, set to GRR
  // In production, track upgrades/expansions in subscription_events
  const nrr = grr // Simplified - would need expansion data

  // Calculate Quick Ratio: (New MRR + Expansion MRR) / (Churned MRR + Contraction MRR)
  // Get new subscriptions this month
  const { data: newSubs } = await supabase
    .from('subscriptions')
    .select('plan_type, created_at')
    .eq('status', 'active')
    .gte('created_at', lastMonthStart.toISOString())
    .lt('created_at', currentMonthStart.toISOString())

  let newMRR = 0
  newSubs?.forEach((sub: any) => {
    if (sub.plan_type === 'monthly') newMRR += 9.99
    else if (sub.plan_type === 'annual') newMRR += 8.25
  })

  // Quick Ratio calculation (simplified - assumes no expansion/contraction yet)
  const expansionMRR = 0 // Would need upgrade tracking
  const contractionMRR = 0 // Would need downgrade tracking

  const quickRatio = (churnedMRR > 0)
    ? parseFloat(((newMRR + expansionMRR) / (churnedMRR + contractionMRR)).toFixed(2))
    : newMRR > 0 ? 999 : 0 // If no churn but have growth, show as very high

  return {
    grr, // Gross Revenue Retention %
    nrr, // Net Revenue Retention %
    monthlyChurnMRR: parseFloat(churnedMRR.toFixed(2)),
    monthlyNewMRR: parseFloat(newMRR.toFixed(2)),
    quickRatio, // SaaS Quick Ratio
  }
}

async function getEngagementMetrics(supabase: any) {
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0]

  // Check if user_activity_log table exists
  const { data: tableExists } = await supabase
    .from('user_activity_log')
    .select('id')
    .limit(1)
    .then((res: any) => ({ ...res, data: res.error ? null : [] }))

  if (!tableExists) {
    // Fallback: Use last_active_at from profiles if activity table doesn't exist
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    const { data: dauProfiles } = await supabase
      .from('profiles')
      .select('id')
      .gte('last_active_at', oneDayAgo.toISOString())

    const { data: mauProfiles } = await supabase
      .from('profiles')
      .select('id')
      .gte('last_active_at', thirtyDaysAgo.toISOString())

    const dau = dauProfiles?.length || 0
    const mau = mauProfiles?.length || 0
    const wau = 0 // Can't calculate without activity log

    return {
      dau,
      mau,
      wau,
      stickiness: mau > 0 ? parseFloat(((dau / mau) * 100).toFixed(2)) : 0,
      avgDailyPageViews: 0,
      avgRecipesViewedPerUser: 0,
    }
  }

  // Get DAU (users active today)
  const { data: dauData } = await supabase
    .from('user_activity_log')
    .select('user_id')
    .eq('activity_date', today)

  // Get MAU (users active in last 30 days)
  const { data: mauData } = await supabase
    .from('user_activity_log')
    .select('user_id')
    .gte('activity_date', thirtyDaysAgoStr)
    .then((res: any) => ({
      ...res,
      data: res.data ? [...new Set(res.data.map((r: any) => r.user_id))] : [],
    }))

  // Get WAU (users active in last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0]

  const { data: wauData } = await supabase
    .from('user_activity_log')
    .select('user_id')
    .gte('activity_date', sevenDaysAgoStr)
    .then((res: any) => ({
      ...res,
      data: res.data ? [...new Set(res.data.map((r: any) => r.user_id))] : [],
    }))

  // Get average page views
  const { data: pageViewsData } = await supabase
    .from('user_activity_log')
    .select('page_views')
    .gte('activity_date', sevenDaysAgoStr)

  const totalPageViews = pageViewsData?.reduce((sum: number, row: any) => sum + (row.page_views || 0), 0) || 0
  const avgDailyPageViews = pageViewsData?.length ? Math.round(totalPageViews / 7) : 0

  // Get average recipes viewed
  const { data: recipesViewedData } = await supabase
    .from('user_activity_log')
    .select('recipes_viewed')
    .gte('activity_date', sevenDaysAgoStr)

  const totalRecipesViewed = recipesViewedData?.reduce((sum: number, row: any) => sum + (row.recipes_viewed || 0), 0) || 0
  const avgRecipesViewedPerUser = wauData?.length
    ? parseFloat((totalRecipesViewed / wauData.length).toFixed(1))
    : 0

  const dau = dauData?.length || 0
  const mau = mauData?.length || 0
  const wau = wauData?.length || 0

  // Calculate stickiness (DAU/MAU ratio)
  const stickiness = mau > 0 ? parseFloat(((dau / mau) * 100).toFixed(2)) : 0

  return {
    dau,
    mau,
    wau,
    stickiness, // percentage
    avgDailyPageViews,
    avgRecipesViewedPerUser,
  }
}

async function getCohortRetention(supabase: any) {
  // Analyze retention by signup cohort
  // Day 1, Day 7, Day 30, Day 90 retention

  const now = new Date()
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  // Get users who signed up in the last 90 days
  const { data: recentUsers } = await supabase
    .from('profiles')
    .select('id, created_at')
    .gte('created_at', ninetyDaysAgo.toISOString())
    .order('created_at', { ascending: true })

  if (!recentUsers || recentUsers.length === 0) {
    return {
      day1: 0,
      day7: 0,
      day30: 0,
      day90: 0,
      cohorts: [],
    }
  }

  // Check if user_activity_log exists
  const { data: activityTableExists } = await supabase
    .from('user_activity_log')
    .select('id')
    .limit(1)
    .then((res: any) => ({ ...res, data: res.error ? null : [] }))

  if (!activityTableExists) {
    // Fallback to recipe creation tracking
    const userIds = recentUsers.map(u => u.id)

    // Get users who created recipes (as proxy for retention)
    const { data: activeRecipeUsers } = await supabase
      .from('recipes')
      .select('user_id, created_at')
      .in('user_id', userIds)

    const activeUserSet = new Set(activeRecipeUsers?.map((r: any) => r.user_id) || [])

    // Calculate simple retention percentage
    const retentionRate = userIds.length > 0
      ? parseFloat(((activeUserSet.size / userIds.length) * 100).toFixed(2))
      : 0

    return {
      day1: retentionRate,
      day7: retentionRate,
      day30: retentionRate,
      day90: retentionRate,
      cohorts: [],
    }
  }

  // Calculate retention for different time periods
  let day1Retained = 0
  let day7Retained = 0
  let day30Retained = 0
  let day90Retained = 0

  for (const user of recentUsers) {
    const signupDate = new Date(user.created_at)
    const daysSinceSignup = Math.floor((now.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysSinceSignup < 1) continue // Too new to measure

    // Check activity at different milestones
    if (daysSinceSignup >= 1) {
      const day1Date = new Date(signupDate)
      day1Date.setDate(day1Date.getDate() + 1)

      const { data: day1Activity } = await supabase
        .from('user_activity_log')
        .select('id')
        .eq('user_id', user.id)
        .gte('activity_date', signupDate.toISOString().split('T')[0])
        .lte('activity_date', day1Date.toISOString().split('T')[0])
        .limit(1)

      if (day1Activity && day1Activity.length > 0) day1Retained++
    }

    if (daysSinceSignup >= 7) {
      const day7Date = new Date(signupDate)
      day7Date.setDate(day7Date.getDate() + 7)

      const { data: day7Activity } = await supabase
        .from('user_activity_log')
        .select('id')
        .eq('user_id', user.id)
        .gte('activity_date', signupDate.toISOString().split('T')[0])
        .lte('activity_date', day7Date.toISOString().split('T')[0])
        .limit(1)

      if (day7Activity && day7Activity.length > 0) day7Retained++
    }

    if (daysSinceSignup >= 30) {
      const day30Date = new Date(signupDate)
      day30Date.setDate(day30Date.getDate() + 30)

      const { data: day30Activity } = await supabase
        .from('user_activity_log')
        .select('id')
        .eq('user_id', user.id)
        .gte('activity_date', signupDate.toISOString().split('T')[0])
        .lte('activity_date', day30Date.toISOString().split('T')[0])
        .limit(1)

      if (day30Activity && day30Activity.length > 0) day30Retained++
    }

    if (daysSinceSignup >= 90) {
      const day90Date = new Date(signupDate)
      day90Date.setDate(day90Date.getDate() + 90)

      const { data: day90Activity } = await supabase
        .from('user_activity_log')
        .select('id')
        .eq('user_id', user.id)
        .gte('activity_date', signupDate.toISOString().split('T')[0])
        .lte('activity_date', day90Date.toISOString().split('T')[0])
        .limit(1)

      if (day90Activity && day90Activity.length > 0) day90Retained++
    }
  }

  // Calculate percentages
  const eligibleForDay1 = recentUsers.filter(u => {
    const daysSince = Math.floor((now.getTime() - new Date(u.created_at).getTime()) / (1000 * 60 * 60 * 24))
    return daysSince >= 1
  }).length

  const eligibleForDay7 = recentUsers.filter(u => {
    const daysSince = Math.floor((now.getTime() - new Date(u.created_at).getTime()) / (1000 * 60 * 60 * 24))
    return daysSince >= 7
  }).length

  const eligibleForDay30 = recentUsers.filter(u => {
    const daysSince = Math.floor((now.getTime() - new Date(u.created_at).getTime()) / (1000 * 60 * 60 * 24))
    return daysSince >= 30
  }).length

  const eligibleForDay90 = recentUsers.filter(u => {
    const daysSince = Math.floor((now.getTime() - new Date(u.created_at).getTime()) / (1000 * 60 * 60 * 24))
    return daysSince >= 90
  }).length

  return {
    day1: eligibleForDay1 > 0 ? parseFloat(((day1Retained / eligibleForDay1) * 100).toFixed(2)) : 0,
    day7: eligibleForDay7 > 0 ? parseFloat(((day7Retained / eligibleForDay7) * 100).toFixed(2)) : 0,
    day30: eligibleForDay30 > 0 ? parseFloat(((day30Retained / eligibleForDay30) * 100).toFixed(2)) : 0,
    day90: eligibleForDay90 > 0 ? parseFloat(((day90Retained / eligibleForDay90) * 100).toFixed(2)) : 0,
    totalUsers: recentUsers.length,
    eligibleForMeasurement: {
      day1: eligibleForDay1,
      day7: eligibleForDay7,
      day30: eligibleForDay30,
      day90: eligibleForDay90,
    },
  }
}

// ============================================================================
// PROMO CODE MANAGEMENT
// ============================================================================

export async function getPromoCodes() {
  await requireAdmin()

  const supabase = await createClient()

  const { data: promoCodes, error } = await supabase
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return { promoCodes: [], error: error.message }
  }

  // Get usage stats for each code
  const codesWithStats = await Promise.all(
    promoCodes.map(async (code) => {
      const { count: activeUses } = await supabase
        .from('user_promo_codes')
        .select('*', { count: 'exact', head: true })
        .eq('promo_code_id', code.id)
        .eq('is_active', true)

      return {
        ...code,
        active_uses: activeUses || 0,
      }
    })
  )

  return { promoCodes: codesWithStats, error: null }
}

export async function createPromoCode(data: {
  code: string
  name: string
  description?: string
  type: string
  max_recipes?: number
  max_uses?: number
  discount_percent?: number
  duration_days?: number
  expires_at?: string
  features_enabled?: any
}) {
  await requireAdmin()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: promoCode, error } = await supabase
    .from('promo_codes')
    .insert([
      {
        ...data,
        code: data.code.toUpperCase(),
        created_by: user?.email || 'unknown',
      },
    ])
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/promo-codes')

  return { success: true, promoCode, error: null }
}

export async function updatePromoCode(id: string, data: any) {
  await requireAdmin()

  const supabase = await createClient()

  const { error } = await supabase
    .from('promo_codes')
    .update(data)
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/promo-codes')

  return { success: true, error: null }
}

export async function deletePromoCode(id: string) {
  await requireAdmin()

  const supabase = await createClient()

  const { error } = await supabase
    .from('promo_codes')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/promo-codes')

  return { success: true, error: null }
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export async function getUsers(filters?: {
  search?: string
  tier?: string
  limit?: number
}) {
  await requireAdmin()

  const supabase = await createClient()

  let query = supabase
    .from('profiles')
    .select(`
      *,
      subscriptions (
        status,
        plan_type,
        recipe_count,
        recipe_limit,
        created_at
      )
    `)
    .order('created_at', { ascending: false })

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data: users, error } = await query

  if (error) {
    return { users: [], error: error.message }
  }

  // Filter by tier if specified
  let filteredUsers = users || []

  if (filters?.tier) {
    filteredUsers = filteredUsers.filter((user: any) => {
      const sub = user.subscriptions?.[0]
      if (filters.tier === 'free') return sub?.status !== 'active'
      if (filters.tier === 'monthly') return sub?.plan_type === 'monthly'
      if (filters.tier === 'annual') return sub?.plan_type === 'annual'
      return true
    })
  }

  // Search filter
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase()
    filteredUsers = filteredUsers.filter((user: any) =>
      user.email?.toLowerCase().includes(searchLower) ||
      user.full_name?.toLowerCase().includes(searchLower)
    )
  }

  return { users: filteredUsers, error: null }
}

export async function getUserDetails(userId: string) {
  await requireAdmin()

  const supabase = await createClient()

  const [userResult, recipesResult, promoResult, eventsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select(`
        *,
        subscriptions (*)
      `)
      .eq('id', userId)
      .single(),

    supabase
      .from('recipes')
      .select('id, title, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),

    supabase
      .from('user_promo_codes')
      .select(`
        *,
        promo_codes (*)
      `)
      .eq('user_id', userId),

    supabase
      .from('subscription_events')
      .select('*')
      .eq('user_id', userId)
      .order('occurred_at', { ascending: false })
      .limit(20),
  ])

  return {
    user: userResult.data,
    recipes: recipesResult.data || [],
    promoCodes: promoResult.data || [],
    events: eventsResult.data || [],
    error: userResult.error?.message || null,
  }
}

// ============================================================================
// CSV EXPORT
// ============================================================================

export async function exportUsersCSV() {
  await requireAdmin()
  if (!(await hasPermission('export_data'))) {
    throw new Error('Permission denied')
  }

  const { users } = await getUsers({ limit: 10000 })

  const csv = [
    ['Email', 'Name', 'Status', 'Plan Type', 'Recipes', 'Limit', 'Joined'].join(','),
    ...users.map((user: any) => [
      user.email || '',
      user.full_name || '',
      user.subscriptions?.[0]?.status || 'free',
      user.subscriptions?.[0]?.plan_type || 'free',
      user.subscriptions?.[0]?.recipe_count || 0,
      user.subscriptions?.[0]?.recipe_limit || 25,
      new Date(user.created_at).toLocaleDateString(),
    ].join(',')),
  ].join('\n')

  return csv
}

export async function exportMetricsCSV() {
  await requireAdmin()
  if (!(await hasPermission('export_data'))) {
    throw new Error('Permission denied')
  }

  const metrics = await getDashboardMetrics()

  const csv = [
    ['Metric', 'Value'].join(','),
    ['Total Users', metrics.users.total].join(','),
    ['Active Users (30d)', metrics.users.active].join(','),
    ['New Users This Month', metrics.users.newThisMonth].join(','),
    ['Free Users', metrics.users.byTier.free].join(','),
    ['Monthly Subscribers', metrics.users.byTier.monthly].join(','),
    ['Annual Subscribers', metrics.users.byTier.annual].join(','),
    ['Promo Users', metrics.users.byTier.promo].join(','),
    ['Total Recipes', metrics.recipes.total].join(','),
    ['Recipes This Month', metrics.recipes.thisMonth].join(','),
    ['Avg Recipes/User', metrics.recipes.averagePerUser].join(','),
    ['Total Cookbooks', metrics.cookbooks.total].join(','),
    ['Shared Cookbooks', metrics.cookbooks.shared].join(','),
    ['Max Cookbook Members', metrics.cookbooks.maxMembers].join(','),
    ['MRR', '$' + metrics.subscriptions.mrr].join(','),
    ['ARR', '$' + metrics.subscriptions.arr].join(','),
    ['ARPU', '$' + metrics.subscriptions.arpu].join(','),
    ['LTV', '$' + metrics.subscriptions.ltv].join(','),
    ['Churn Rate', metrics.subscriptions.churnRate + '%'].join(','),
    ['GRR', metrics.retention.grr + '%'].join(','),
    ['NRR', metrics.retention.nrr + '%'].join(','),
    ['Quick Ratio', metrics.retention.quickRatio].join(','),
    ['Monthly New MRR', '$' + metrics.retention.monthlyNewMRR].join(','),
    ['Monthly Churn MRR', '$' + metrics.retention.monthlyChurnMRR].join(','),
    ['Churn This Month', metrics.events.churnThisMonth].join(','),
    ['Total Churn', metrics.events.totalChurn].join(','),
    ['Activation Rate', metrics.activation.activationRate + '%'].join(','),
    ['Activated Users', metrics.activation.activatedUsers].join(','),
    ['Cookbook Adoption', metrics.featureAdoption.cookbookAdoption + '%'].join(','),
    ['Shared Cookbook Adoption', metrics.featureAdoption.sharedCookbookAdoption + '%'].join(','),
    ['Cookbook Collaboration', metrics.featureAdoption.cookbookCollaboration + '%'].join(','),
    ['Power Users (Multiple Cookbooks)', metrics.featureAdoption.multipleCookbookUsers + '%'].join(','),
    ['Promo Code Usage', metrics.featureAdoption.promoCodeUsage + '%'].join(','),
    ['DAU (Daily Active Users)', metrics.engagement.dau].join(','),
    ['WAU (Weekly Active Users)', metrics.engagement.wau].join(','),
    ['MAU (Monthly Active Users)', metrics.engagement.mau].join(','),
    ['Stickiness (DAU/MAU)', metrics.engagement.stickiness + '%'].join(','),
    ['Avg Daily Pageviews', metrics.engagement.avgDailyPageViews].join(','),
    ['Avg Recipes Viewed Per User', metrics.engagement.avgRecipesViewedPerUser].join(','),
    ['Day 1 Retention', metrics.cohorts.day1 + '%'].join(','),
    ['Day 1 Eligible Users', metrics.cohorts.eligibleForMeasurement?.day1 || 0].join(','),
    ['Day 7 Retention', metrics.cohorts.day7 + '%'].join(','),
    ['Day 7 Eligible Users', metrics.cohorts.eligibleForMeasurement?.day7 || 0].join(','),
    ['Day 30 Retention', metrics.cohorts.day30 + '%'].join(','),
    ['Day 30 Eligible Users', metrics.cohorts.eligibleForMeasurement?.day30 || 0].join(','),
    ['Day 90 Retention', metrics.cohorts.day90 + '%'].join(','),
    ['Day 90 Eligible Users', metrics.cohorts.eligibleForMeasurement?.day90 || 0].join(','),
  ].join('\n')

  return csv
}
