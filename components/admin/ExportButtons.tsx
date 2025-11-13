'use client'

import { useState } from 'react'
import { exportMetricsCSV, exportUsersCSV } from '@/lib/actions/admin'

export function ExportButtons() {
  const [loading, setLoading] = useState<'metrics' | 'users' | null>(null)

  const handleExportMetrics = async () => {
    setLoading('metrics')
    try {
      const csv = await exportMetricsCSV()
      downloadCSV(csv, 'recipe-keeper-metrics.csv')
    } catch (error) {
      console.error('Error exporting metrics:', error)
      alert('Failed to export metrics')
    } finally {
      setLoading(null)
    }
  }

  const handleExportUsers = async () => {
    setLoading('users')
    try {
      const csv = await exportUsersCSV()
      downloadCSV(csv, 'recipe-keeper-users.csv')
    } catch (error) {
      console.error('Error exporting users:', error)
      alert('Failed to export users')
    } finally {
      setLoading(null)
    }
  }

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleExportUsers}
        disabled={loading !== null}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading === 'users' ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Exporting...
          </span>
        ) : (
          '📥 Export Users CSV'
        )}
      </button>

      <button
        onClick={handleExportMetrics}
        disabled={loading !== null}
        className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading === 'metrics' ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Exporting...
          </span>
        ) : (
          '📊 Export Metrics CSV'
        )}
      </button>
    </div>
  )
}
