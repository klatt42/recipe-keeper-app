export async function register() {
  // TEMPORARILY DISABLED SENTRY TO DEBUG SERVER ACTIONS
  console.log('[instrumentation] Sentry disabled for debugging')
  return

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}
