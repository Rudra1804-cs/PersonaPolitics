"use client"

import { useEffect, useState } from "react"
import { useGameStore } from "@/lib/state"
import { cn } from "@/lib/utils"

type BudgetTier = "great" | "stable" | "strained"
type MoodTier = "cheering" | "cautious" | "booing"

export function AmbienceGauges() {
  const { stats, policyLog, termOver } = useGameStore()
  const [prevBudgetTier, setPrevBudgetTier] = useState<BudgetTier | null>(null)
  const [prevMoodTier, setPrevMoodTier] = useState<MoodTier | null>(null)

  const budgetScore = Math.round((stats.power + stats.standing) / 2)
  const budgetTier: BudgetTier = budgetScore >= 80 ? "great" : budgetScore >= 50 ? "stable" : "strained"

  const last3 = policyLog.slice(-3)
  let moodTier: MoodTier = "cautious"

  if (last3.length >= 2) {
    const approvalDeltas = last3.map((entry) => entry.delta.approval)
    const totalDelta = approvalDeltas.reduce((sum, d) => sum + d, 0)
    const avgDelta = totalDelta / approvalDeltas.length

    if (avgDelta > 3) {
      moodTier = "cheering"
    } else if (avgDelta < -3) {
      moodTier = "booing"
    }
  }

  useEffect(() => {
    if (prevBudgetTier !== null && prevBudgetTier !== budgetTier) {
      // Tier changed
    }
    setPrevBudgetTier(budgetTier)
  }, [budgetTier, prevBudgetTier])

  useEffect(() => {
    if (prevMoodTier !== null && prevMoodTier !== moodTier) {
      // Tier changed
    }
    setPrevMoodTier(moodTier)
  }, [moodTier, prevMoodTier])

  const budgetImproved = prevBudgetTier !== null && getBudgetRank(budgetTier) > getBudgetRank(prevBudgetTier)
  const moodImproved = prevMoodTier !== null && getMoodRank(moodTier) > getMoodRank(prevMoodTier)

  return (
    <div className="flex gap-4 justify-center">
      <RadialGauge
        label="Budget Health"
        value={budgetScore}
        tier={budgetTier}
        tierLabel={budgetTier.charAt(0).toUpperCase() + budgetTier.slice(1)}
        color={getBudgetColor(budgetTier)}
        glow={budgetImproved}
        grayscale={termOver}
      />
      <RadialGauge
        label="Public Mood"
        value={stats.approval}
        tier={moodTier}
        tierLabel={moodTier.charAt(0).toUpperCase() + moodTier.slice(1)}
        color={getMoodColor(moodTier)}
        glow={moodImproved}
        grayscale={termOver}
      />
    </div>
  )
}

function getBudgetRank(tier: BudgetTier): number {
  return tier === "great" ? 3 : tier === "stable" ? 2 : 1
}

function getMoodRank(tier: MoodTier): number {
  return tier === "cheering" ? 3 : tier === "cautious" ? 2 : 1
}

function getBudgetColor(tier: BudgetTier): string {
  return tier === "great" ? "#10b981" : tier === "stable" ? "#f59e0b" : "#ef4444"
}

function getMoodColor(tier: MoodTier): string {
  return tier === "cheering" ? "#10b981" : tier === "cautious" ? "#f59e0b" : "#ef4444"
}

interface RadialGaugeProps {
  label: string
  value: number
  tier: string
  tierLabel: string
  color: string
  glow: boolean
  grayscale: boolean
}

function RadialGauge({ label, value, tier, tierLabel, color, glow, grayscale }: RadialGaugeProps) {
  const radius = 32
  const strokeWidth = 6
  const normalizedRadius = radius - strokeWidth / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (value / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs font-medium text-blue-200">{label}</p>
      <div className="relative">
        <svg
          height={radius * 2}
          width={radius * 2}
          className={cn("transition-all duration-500", grayscale && "grayscale")}
        >
          {/* Background circle */}
          <circle
            stroke="#1e293b"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress circle */}
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{
              strokeDashoffset,
              transition: "stroke-dashoffset 0.5s ease-out",
              transform: "rotate(-90deg)",
              transformOrigin: "50% 50%",
              filter: glow ? `drop-shadow(0 0 8px ${color})` : "none",
            }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white">{value}</span>
        </div>
      </div>
      <p
        className={cn("text-xs font-semibold transition-colors duration-300", grayscale && "text-gray-500")}
        style={{ color: grayscale ? undefined : color }}
      >
        {tierLabel}
      </p>
    </div>
  )
}
