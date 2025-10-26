'use client'

import { useMemo, useState } from 'react'

interface UsageRecord {
  id: string
  user_id: string
  service: string
  operation: string
  input_tokens: number
  output_tokens: number
  total_tokens: number
  estimated_cost: number
  created_at: string
}

interface UsageDashboardProps {
  usageData: UsageRecord[]
}

type TimeRange = '7d' | '30d' | 'all'

export function UsageDashboard({ usageData }: UsageDashboardProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')

  // Filter data based on time range
  const filteredData = useMemo(() => {
    if (timeRange === 'all') return usageData

    const now = new Date()
    const days = timeRange === '7d' ? 7 : 30
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    return usageData.filter((record) => new Date(record.created_at) >= cutoff)
  }, [usageData, timeRange])

  // Calculate summary statistics
  const stats = useMemo(() => {
    const totalCost = filteredData.reduce((sum, record) => sum + Number(record.estimated_cost), 0)
    const totalTokens = filteredData.reduce((sum, record) => sum + record.total_tokens, 0)
    const totalImports = filteredData.filter((r) => r.operation === 'recipe-import').length
    const totalImageGens = filteredData.filter((r) => r.operation === 'image-generation').length

    // Group by service
    const byService = filteredData.reduce(
      (acc, record) => {
        if (!acc[record.service]) {
          acc[record.service] = { cost: 0, tokens: 0, count: 0 }
        }
        acc[record.service].cost += Number(record.estimated_cost)
        acc[record.service].tokens += record.total_tokens
        acc[record.service].count += 1
        return acc
      },
      {} as Record<string, { cost: number; tokens: number; count: number }>
    )

    // Group by day for chart
    const byDay = filteredData.reduce(
      (acc, record) => {
        const date = new Date(record.created_at).toLocaleDateString()
        if (!acc[date]) {
          acc[date] = { cost: 0, count: 0 }
        }
        acc[date].cost += Number(record.estimated_cost)
        acc[date].count += 1
        return acc
      },
      {} as Record<string, { cost: number; count: number }>
    )

    return {
      totalCost,
      totalTokens,
      totalImports,
      totalImageGens,
      byService,
      byDay,
      avgCostPerImport: totalImports > 0 ? totalCost / totalImports : 0,
    }
  }, [filteredData])

  const formatCost = (cost: number) => {
    if (cost < 0.01) {
      return `$${(cost * 1000).toFixed(4)}` // Show in millidollars
    }
    return `$${cost.toFixed(4)}`
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setTimeRange('7d')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            timeRange === '7d'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Last 7 Days
        </button>
        <button
          onClick={() => setTimeRange('30d')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            timeRange === '30d'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Last 30 Days
        </button>
        <button
          onClick={() => setTimeRange('all')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            timeRange === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Time
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm font-medium text-gray-600">Total Cost</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {formatCost(stats.totalCost)}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {stats.totalTokens.toLocaleString()} tokens
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm font-medium text-gray-600">Recipe Imports</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{stats.totalImports}</div>
          <div className="mt-1 text-xs text-gray-500">
            Avg: {formatCost(stats.avgCostPerImport)} each
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm font-medium text-gray-600">Images Generated</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{stats.totalImageGens}</div>
          <div className="mt-1 text-xs text-gray-500">AI-generated food photos</div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm font-medium text-gray-600">Total Operations</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{filteredData.length}</div>
          <div className="mt-1 text-xs text-gray-500">API calls made</div>
        </div>
      </div>

      {/* Cost by Service */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Cost by Service</h2>
        <div className="space-y-4">
          {Object.entries(stats.byService).map(([service, data]) => (
            <div key={service}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">
                  {service === 'gemini-2.0-flash'
                    ? 'Gemini 2.0 Flash (Recipe Import)'
                    : service === 'fal-ai'
                      ? 'FAL.ai (Image Generation)'
                      : service}
                </span>
                <span className="font-semibold text-gray-900">{formatCost(data.cost)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-blue-600"
                    style={{
                      width: `${(data.cost / stats.totalCost) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500">
                  {data.count} {data.count === 1 ? 'call' : 'calls'}
                </span>
              </div>
            </div>
          ))}

          {Object.keys(stats.byService).length === 0 && (
            <p className="text-center text-sm text-gray-500">No API usage recorded yet</p>
          )}
        </div>
      </div>

      {/* Daily Usage Chart */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Daily Usage</h2>
        <div className="space-y-3">
          {Object.entries(stats.byDay)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .slice(0, 14) // Show last 14 days
            .map(([date, data]) => (
              <div key={date}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{date}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500">{data.count} operations</span>
                    <span className="font-semibold text-gray-900">{formatCost(data.cost)}</span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-green-600"
                    style={{
                      width: `${Math.min((data.cost / Math.max(...Object.values(stats.byDay).map((d) => d.cost))) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}

          {Object.keys(stats.byDay).length === 0 && (
            <p className="text-center text-sm text-gray-500">No usage data for this period</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Activity</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Date
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Service
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Operation
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Tokens
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Cost
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredData.slice(0, 20).map((record) => (
                <tr key={record.id}>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-900">
                    {new Date(record.created_at).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-700">
                    {record.service}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-700">
                    {record.operation}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-right text-sm text-gray-900">
                    {record.total_tokens.toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-right text-sm font-medium text-gray-900">
                    {formatCost(Number(record.estimated_cost))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredData.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-500">No activity recorded yet</p>
          )}
        </div>
      </div>

      {/* Cost Insights */}
      <div className="rounded-lg bg-blue-50 p-6">
        <h3 className="mb-2 text-sm font-semibold text-blue-900">Cost Insights</h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>
            • Gemini 2.0 Flash averages ~$0.0003 per recipe import (40x cheaper than alternatives)
          </li>
          <li>• Free tier: 15 imports/min, 1,500/day - perfect for personal use</li>
          <li>
            • At current rates: 100 imports = ~$0.03, 1,000 imports = ~$0.30, 10,000 imports =
            ~$3.00
          </li>
          {stats.totalImports > 0 && (
            <li>
              • Your actual average: {formatCost(stats.avgCostPerImport)} per import (
              {stats.totalImports} total)
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
