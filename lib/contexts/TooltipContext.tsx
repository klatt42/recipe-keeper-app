'use client'

import { createContext, useContext, useState, useEffect } from 'react'

interface TooltipContextType {
  enabled: boolean
  toggle: () => void
  enable: () => void
  disable: () => void
}

const TooltipContext = createContext<TooltipContextType | undefined>(undefined)

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Load preference from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('tooltips-enabled')
    if (stored !== null) {
      setEnabled(stored === 'true')
    }
    setMounted(true)
  }, [])

  // Save preference to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('tooltips-enabled', String(enabled))
    }
  }, [enabled, mounted])

  const toggle = () => setEnabled((prev) => !prev)
  const enable = () => setEnabled(true)
  const disable = () => setEnabled(false)

  return (
    <TooltipContext.Provider value={{ enabled, toggle, enable, disable }}>
      {children}
    </TooltipContext.Provider>
  )
}

export function useTooltips() {
  const context = useContext(TooltipContext)
  if (context === undefined) {
    throw new Error('useTooltips must be used within a TooltipProvider')
  }
  return context
}
