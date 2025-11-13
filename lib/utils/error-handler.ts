import * as Sentry from '@sentry/nextjs'

/**
 * Centralized error handling utility
 * Use this to capture and report errors to Sentry with proper context
 */

export interface ErrorContext {
  userId?: string
  action?: string
  metadata?: Record<string, any>
}

/**
 * Capture an error with Sentry and return a user-friendly message
 */
export function captureError(
  error: unknown,
  context?: ErrorContext
): string {
  // Add context to Sentry scope
  if (context) {
    Sentry.withScope((scope) => {
      if (context.userId) {
        scope.setUser({ id: context.userId })
      }
      if (context.action) {
        scope.setTag('action', context.action)
      }
      if (context.metadata) {
        scope.setContext('metadata', context.metadata)
      }

      // Capture the exception
      Sentry.captureException(error)
    })
  } else {
    // No context, just capture
    Sentry.captureException(error)
  }

  // Return user-friendly error message
  if (error instanceof Error) {
    // In production, don't expose internal error details
    if (process.env.NODE_ENV === 'production') {
      return 'An error occurred. Our team has been notified.'
    }
    return error.message
  }

  return 'An unexpected error occurred'
}

/**
 * Capture a message (non-error event) to Sentry
 */
export function captureMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug' = 'info',
  context?: ErrorContext
) {
  Sentry.withScope((scope) => {
    if (context?.userId) {
      scope.setUser({ id: context.userId })
    }
    if (context?.action) {
      scope.setTag('action', context.action)
    }
    if (context?.metadata) {
      scope.setContext('metadata', context.metadata)
    }

    Sentry.captureMessage(message, level)
  })
}

/**
 * Start a new Sentry transaction for performance monitoring
 */
export function startTransaction(name: string, op: string) {
  return Sentry.startTransaction({
    name,
    op,
  })
}
