import * as Sentry from '@sentry/nextjs'

/**
 * Wraps a server action with Sentry error tracking
 * @param action The server action function to wrap
 * @param actionName A descriptive name for the action (used in Sentry)
 * @returns The wrapped server action
 */
export function withSentry<T extends (...args: any[]) => any>(
  action: T,
  actionName: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await action(...args)
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          action: actionName,
          type: 'server_action',
        },
        contexts: {
          action: {
            name: actionName,
            args: args.length, // Don't log actual args to avoid PII
          },
        },
      })
      throw error
    }
  }) as T
}

/**
 * Manually capture an exception to Sentry
 * @param error The error to capture
 * @param context Additional context information
 */
export function captureError(
  error: Error,
  context?: {
    tags?: Record<string, string>
    extra?: Record<string, any>
    user?: { id?: string; email?: string }
  }
) {
  Sentry.captureException(error, {
    tags: context?.tags,
    extra: context?.extra,
    user: context?.user,
  })
}

/**
 * Capture a message to Sentry
 * @param message The message to capture
 * @param level The severity level
 */
export function captureMessage(
  message: string,
  level: 'debug' | 'info' | 'warning' | 'error' | 'fatal' = 'info'
) {
  Sentry.captureMessage(message, level)
}
