'use client'

import { useTooltips } from '@/lib/contexts/TooltipContext'
import { toast } from 'sonner'

export function TooltipToggle() {
  const { enabled, toggle } = useTooltips()

  const handleToggle = () => {
    toggle()
    if (enabled) {
      toast.success('Help tooltips hidden', {
        description: 'You can re-enable them anytime',
        duration: 2000,
      })
    } else {
      toast.success('Help tooltips enabled', {
        description: 'Hover over buttons to see helpful tips',
        duration: 2000,
      })
    }
  }

  return (
    <button
      onClick={handleToggle}
      className="group relative rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-2 text-sm font-semibold text-white transition-all border border-white/30 hover:border-white/50 flex items-center gap-2"
      aria-label={enabled ? 'Disable help tooltips' : 'Enable help tooltips'}
    >
      {/* Icon */}
      <div className="relative w-5 h-5">
        {enabled ? (
          <svg
            className="w-5 h-5 text-green-400 animate-in fade-in zoom-in duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5 text-gray-400 animate-in fade-in zoom-in duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
            />
          </svg>
        )}
      </div>

      {/* Text */}
      <span className="hidden sm:inline">
        {enabled ? 'Tips On' : 'Tips Off'}
      </span>

      {/* Indicator dot */}
      <div
        className={`w-2 h-2 rounded-full transition-colors ${
          enabled ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
        }`}
      />
    </button>
  )
}

// Compact version for mobile
export function TooltipToggleCompact() {
  const { enabled, toggle } = useTooltips()

  return (
    <button
      onClick={toggle}
      className="group relative rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm p-2 text-white transition-all border border-white/30 hover:border-white/50"
      aria-label={enabled ? 'Disable help tooltips' : 'Enable help tooltips'}
      title={enabled ? 'Hide help tips' : 'Show help tips'}
    >
      <div className="relative w-5 h-5">
        {enabled ? (
          <svg
            className="w-5 h-5 text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
            />
          </svg>
        )}
      </div>
      {enabled && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-gray-900" />
      )}
    </button>
  )
}
