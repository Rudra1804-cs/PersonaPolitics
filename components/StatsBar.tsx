"use client"

import { cn } from "@/lib/utils"

interface StatsBarProps {
  label: string
  value: number
  className?: string
}

export function StatsBar({ label, value, className }: StatsBarProps) {
  const getColor = () => {
    if (value >= 60) return "bg-green-500"
    if (value >= 40) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm font-bold text-foreground">{value}</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full transition-all duration-500 ease-out", getColor())} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}
