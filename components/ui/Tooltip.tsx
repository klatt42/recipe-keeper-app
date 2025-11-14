'use client'

import { useState, useRef, useEffect } from 'react'
import { useTooltips } from '@/lib/contexts/TooltipContext'

interface TooltipProps {
  content: string
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 500
}: TooltipProps) {
  const { enabled } = useTooltips()
  const [isVisible, setIsVisible] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const timeoutRef = useRef<NodeJS.Timeout>()
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleMouseEnter = () => {
    if (!enabled) return

    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current && tooltipRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect()
        const tooltipRect = tooltipRef.current.getBoundingClientRect()

        let x = 0
        let y = 0

        switch (position) {
          case 'top':
            x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2
            y = triggerRect.top - tooltipRect.height - 8
            break
          case 'bottom':
            x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2
            y = triggerRect.bottom + 8
            break
          case 'left':
            x = triggerRect.left - tooltipRect.width - 8
            y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2
            break
          case 'right':
            x = triggerRect.right + 8
            y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2
            break
        }

        // Keep tooltip within viewport
        const padding = 8
        x = Math.max(padding, Math.min(x, window.innerWidth - tooltipRect.width - padding))
        y = Math.max(padding, Math.min(y, window.innerHeight - tooltipRect.height - padding))

        setCoords({ x, y })
        setIsVisible(true)
      }
    }, delay)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  if (!enabled) {
    return <>{children}</>
  }

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            left: `${coords.x}px`,
            top: `${coords.y}px`,
            zIndex: 9999,
          }}
          className="pointer-events-none animate-in fade-in slide-in-from-top-1 duration-200"
        >
          <div className="relative">
            {/* Tooltip content */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white text-sm px-3 py-2 rounded-lg shadow-xl border border-gray-700 max-w-xs backdrop-blur-sm">
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5"
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
                <span className="leading-tight">{content}</span>
              </div>
            </div>

            {/* Arrow */}
            {position === 'top' && (
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-1">
                <div className="w-2 h-2 bg-gray-800 rotate-45 border-r border-b border-gray-700" />
              </div>
            )}
            {position === 'bottom' && (
              <div className="absolute left-1/2 -translate-x-1/2 -top-1">
                <div className="w-2 h-2 bg-gray-900 rotate-45 border-l border-t border-gray-700" />
              </div>
            )}
            {position === 'left' && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 -mr-1">
                <div className="w-2 h-2 bg-gray-800 rotate-45 border-r border-t border-gray-700" />
              </div>
            )}
            {position === 'right' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-1">
                <div className="w-2 h-2 bg-gray-900 rotate-45 border-l border-b border-gray-700" />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

// Quick tooltip for buttons
export function ButtonTooltip({
  content,
  children,
}: {
  content: string
  children: React.ReactNode
}) {
  return (
    <Tooltip content={content} position="bottom" delay={300}>
      {children}
    </Tooltip>
  )
}
