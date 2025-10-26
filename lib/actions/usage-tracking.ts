'use server'

import { createClient } from '@/lib/supabase/server'

interface UsageData {
  userId: string
  service: string // 'gemini-2.0-flash', 'fal-ai', 'anthropic'
  operation: string // 'recipe-import', 'image-generation', etc.
  inputTokens: number
  outputTokens: number
  totalTokens: number
  estimatedCost: number
}

/**
 * Track API usage for cost monitoring
 */
export async function trackAPIUsage(data: UsageData) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from('api_usage').insert({
      user_id: data.userId,
      service: data.service,
      operation: data.operation,
      input_tokens: data.inputTokens,
      output_tokens: data.outputTokens,
      total_tokens: data.totalTokens,
      estimated_cost: data.estimatedCost,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error('Failed to track API usage:', error)
    }
  } catch (error) {
    console.error('Usage tracking error:', error)
  }
}

/**
 * Track feature usage (AI variations, etc.)
 */
export async function trackUsage(
  userId: string,
  feature: string,
  count: number = 1
) {
  try {
    const supabase = await createClient()

    // Get or create usage tracking record for this month
    const now = new Date()
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const { data: existing } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('month', monthKey)
      .single()

    if (existing) {
      // Update existing record
      const updates: Record<string, number> = {}
      updates[feature] = (existing[feature] || 0) + count

      await supabase
        .from('usage_tracking')
        .update(updates)
        .eq('id', existing.id)
    } else {
      // Create new record
      const record: Record<string, any> = {
        user_id: userId,
        month: monthKey,
      }
      record[feature] = count

      await supabase.from('usage_tracking').insert(record)
    }
  } catch (error) {
    console.error('Feature usage tracking error:', error)
  }
}

/**
 * Get usage statistics for a user
 */
export async function getUserUsageStats(userId?: string) {
  try {
    const supabase = await createClient()

    let query = userId
      ? supabase.from('api_usage').select('*').eq('user_id', userId)
      : supabase.from('api_usage').select('*')

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return { stats: null, error: error.message }
    }

    // Calculate totals
    const totalCost = data.reduce((sum, item) => sum + (item.estimated_cost || 0), 0)
    const totalTokens = data.reduce((sum, item) => sum + (item.total_tokens || 0), 0)
    const totalImports = data.filter(item => item.operation.includes('import')).length

    // Group by service
    const byService = data.reduce((acc: any, item) => {
      if (!acc[item.service]) {
        acc[item.service] = {
          count: 0,
          totalCost: 0,
          totalTokens: 0,
        }
      }
      acc[item.service].count++
      acc[item.service].totalCost += item.estimated_cost || 0
      acc[item.service].totalTokens += item.total_tokens || 0
      return acc
    }, {})

    // Group by day
    const byDay = data.reduce((acc: any, item) => {
      const date = new Date(item.created_at).toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = {
          count: 0,
          cost: 0,
        }
      }
      acc[date].count++
      acc[date].cost += item.estimated_cost || 0
      return acc
    }, {})

    return {
      stats: {
        totalCost,
        totalTokens,
        totalImports,
        byService,
        byDay,
        recentUsage: data.slice(0, 10),
      },
      error: null,
    }
  } catch (error: any) {
    return { stats: null, error: error.message }
  }
}
