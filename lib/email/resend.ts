import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️  RESEND_API_KEY is not set. Email functionality will be disabled.')
}

export const resend = new Resend(process.env.RESEND_API_KEY || 'dummy-key')

// Check if emails are enabled
export const isEmailEnabled = () => {
  return !!process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'dummy-key'
}

// Email sender configuration
export const EMAIL_FROM = process.env.EMAIL_FROM || 'My Family Recipe Keeper <noreply@recipekeeper.app>'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3004'
