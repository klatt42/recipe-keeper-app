'use client'

interface UsageStatsProps {
  inputTokens?: number
  outputTokens?: number
  totalTokens?: number
  estimatedCost?: number
}

export function UsageStats({ inputTokens = 0, outputTokens = 0, totalTokens = 0, estimatedCost = 0 }: UsageStatsProps) {
  const formatCost = (cost: number) => {
    if (cost < 0.01) {
      return `$${(cost * 1000).toFixed(4)}` // Show in millidollars for very small amounts
    }
    return `$${cost.toFixed(4)}`
  }

  return (
    <div className="rounded-lg bg-gray-50 p-4 text-xs text-gray-600">
      <h4 className="mb-2 font-medium text-gray-700">API Usage</h4>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="text-gray-500">Tokens:</span> {totalTokens.toLocaleString()}
        </div>
        <div>
          <span className="text-gray-500">Cost:</span> {formatCost(estimatedCost)}
        </div>
      </div>
    </div>
  )
}
