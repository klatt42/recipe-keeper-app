'use client'

import { Clock, ChefHat, Flame, Timer } from 'lucide-react'

interface RecipeTimelineProps {
  prepTime?: number
  cookTime?: number
  restTime?: number
}

interface TimelineStage {
  name: string
  duration: number
  color: {
    bg: string
    text: string
    icon: string
  }
  icon: React.ReactNode
}

export function RecipeTimeline({ prepTime, cookTime, restTime }: RecipeTimelineProps) {
  // Build stages array with only non-zero durations
  const stages: TimelineStage[] = []

  if (prepTime && prepTime > 0) {
    stages.push({
      name: 'Prep',
      duration: prepTime,
      color: {
        bg: 'bg-blue-500 dark:bg-blue-600',
        text: 'text-blue-700 dark:text-blue-300',
        icon: 'text-blue-600 dark:text-blue-400'
      },
      icon: <ChefHat className="w-4 h-4" />
    })
  }

  if (cookTime && cookTime > 0) {
    stages.push({
      name: 'Cook',
      duration: cookTime,
      color: {
        bg: 'bg-orange-500 dark:bg-orange-600',
        text: 'text-orange-700 dark:text-orange-300',
        icon: 'text-orange-600 dark:text-orange-400'
      },
      icon: <Flame className="w-4 h-4" />
    })
  }

  if (restTime && restTime > 0) {
    stages.push({
      name: 'Rest',
      duration: restTime,
      color: {
        bg: 'bg-green-500 dark:bg-green-600',
        text: 'text-green-700 dark:text-green-300',
        icon: 'text-green-600 dark:text-green-400'
      },
      icon: <Timer className="w-4 h-4" />
    })
  }

  // If no stages, don't render anything
  if (stages.length === 0) return null

  const totalTime = stages.reduce((sum, stage) => sum + stage.duration, 0)

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="font-bold text-gray-900 dark:text-white">Cooking Timeline</h3>
      </div>

      {/* Timeline Bars */}
      <div className="flex gap-2 mb-4 h-12 rounded-lg overflow-hidden shadow-sm">
        {stages.map((stage, index) => {
          const widthPercentage = (stage.duration / totalTime) * 100

          return (
            <div
              key={index}
              style={{ width: `${widthPercentage}%` }}
              className={`${stage.color.bg} flex flex-col items-center justify-center px-2 py-1 transition-all hover:opacity-90 group relative`}
              title={`${stage.name}: ${stage.duration} min`}
            >
              <div className="flex items-center gap-1 text-white">
                {stage.icon}
                <span className="text-xs font-bold hidden sm:inline">
                  {stage.name}
                </span>
              </div>
              <span className="text-white text-sm font-semibold">
                {stage.duration}m
              </span>

              {/* Tooltip for mobile */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap sm:hidden">
                {stage.name}
              </div>
            </div>
          )
        })}
      </div>

      {/* Stage Details */}
      <div className="flex flex-wrap gap-4 mb-3">
        {stages.map((stage, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className={stage.color.icon}>
              {stage.icon}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {stage.name}
              </p>
              <p className={`text-sm font-bold ${stage.color.text}`}>
                {stage.duration} min
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Total Time */}
      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total Time
          </span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {totalTime} minutes
          </span>
        </div>
        {totalTime >= 60 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">
            ({Math.floor(totalTime / 60)}h {totalTime % 60}m)
          </p>
        )}
      </div>
    </div>
  )
}
