'use client'

import { Component, ReactNode } from 'react'
import * as Sentry from '@sentry/nextjs'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * Error Boundary component for catching and reporting React errors
 * Wraps components to prevent entire app from crashing
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to Sentry
    Sentry.withScope((scope) => {
      scope.setContext('errorInfo', errorInfo)
      Sentry.captureException(error)
    })

    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              We've been notified and are working to fix the issue.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="btn-primary"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Simpler error fallback for smaller components
 */
export function ErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-red-600 text-xl">⚠️</span>
        <h3 className="font-semibold text-red-900">Error</h3>
      </div>
      <p className="text-sm text-red-700 mb-3">
        {error.message || 'Something went wrong'}
      </p>
      <button
        onClick={reset}
        className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Try again
      </button>
    </div>
  )
}
