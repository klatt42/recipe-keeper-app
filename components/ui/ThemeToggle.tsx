'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true)
  }, [])

  // Consistent button styling for both placeholder and actual button
  const buttonClasses = "rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm p-2.5 text-white shadow-md transition-all hover:scale-110 border border-white/30"

  if (!mounted) {
    // Return a placeholder with the exact same dimensions and styling
    return (
      <button
        className={buttonClasses}
        aria-label="Toggle theme"
        disabled
      >
        <div className="h-5 w-5" />
      </button>
    )
  }

  return (
    <button
      onClick={() => {
        const newTheme = theme === 'dark' ? 'light' : 'dark'
        setTheme(newTheme)
      }}
      className={buttonClasses}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  )
}
