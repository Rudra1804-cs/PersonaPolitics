"use client"

import { useGameStore } from "@/lib/state"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

interface CabinetOpinion {
  reformists: number // 0-100
  cautious: number // 0-100
  hardliners: number // 0-100
  supportScore: number // 0-100 overall support
}

function computeCabinetOpinion(
  policyId: string,
  difficulty: "easy" | "medium" | "hard",
  policyLog: ReturnType<typeof useGameStore.getState>["policyLog"],
  stats: ReturnType<typeof useGameStore.getState>["stats"],
): CabinetOpinion {
  // Base support from difficulty (harder = more cautious)
  const difficultyMap = { easy: 70, medium: 50, hard: 30 }
  const baseSupport = difficultyMap[difficulty]

  // Analyze recent policy outcomes (last 3)
  const recentPolicies = policyLog.slice(-3)
  let recentWins = 0
  let recentLosses = 0
  let avgDelta = 0

  recentPolicies.forEach((entry) => {
    if (entry.result === "win") recentWins++
    else recentLosses++
    avgDelta += entry.delta.approval + entry.delta.power + entry.delta.standing
  })

  if (recentPolicies.length > 0) {
    avgDelta /= recentPolicies.length
  }

  // Winning streak boosts support
  const streakBonus = recentWins * 5
  const lossePenalty = recentLosses * 3

  // Current stats influence (higher stats = more confidence)
  const avgStat = (stats.approval + stats.power + stats.standing) / 3
  const statBonus = (avgStat - 50) * 0.3 // ±15 max

  // Compute overall support score
  let supportScore = baseSupport + streakBonus - lossePenalty + statBonus + avgDelta * 0.5
  supportScore = Math.max(0, Math.min(100, supportScore))

  // Distribute opinion across factions based on support score
  let reformists = 0
  let cautious = 0
  let hardliners = 0

  if (supportScore >= 70) {
    // High support: Reformists lead
    reformists = 50 + (supportScore - 70) * 1.5
    cautious = 30
    hardliners = 20 - (supportScore - 70) * 0.5
  } else if (supportScore >= 40) {
    // Moderate support: Cautious lead
    cautious = 40 + (supportScore - 40) * 0.5
    reformists = 30 + (supportScore - 40) * 0.3
    hardliners = 30 - (supportScore - 40) * 0.3
  } else {
    // Low support: Hardliners lead
    hardliners = 50 + (40 - supportScore) * 1.2
    cautious = 30
    reformists = 20 - (40 - supportScore) * 0.5
  }

  // Normalize to 100%
  const total = reformists + cautious + hardliners
  reformists = (reformists / total) * 100
  cautious = (cautious / total) * 100
  hardliners = (hardliners / total) * 100

  return {
    reformists: Math.max(0, Math.min(100, reformists)),
    cautious: Math.max(0, Math.min(100, cautious)),
    hardliners: Math.max(0, Math.min(100, hardliners)),
    supportScore: Math.round(supportScore),
  }
}

export function CabinetMeter() {
  const hoveredPolicy = useGameStore((state) => state.hoveredPolicy)
  const policyLog = useGameStore((state) => state.policyLog)
  const stats = useGameStore((state) => state.stats)
  const [showTooltip, setShowTooltip] = useState(false)

  if (!hoveredPolicy) return null

  const opinion = computeCabinetOpinion(hoveredPolicy.id, hoveredPolicy.difficulty, policyLog, stats)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="w-full rounded-lg bg-slate-800/70 p-4 backdrop-blur"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-blue-200">Cabinet Opinion</h3>
            <span className="text-xs text-slate-400">{hoveredPolicy.title}</span>
          </div>

          {/* Stacked bars */}
          <div className="relative h-6 w-full overflow-hidden rounded-full bg-slate-900/50">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${opinion.reformists}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute left-0 top-0 h-full bg-emerald-500"
              style={{ width: `${opinion.reformists}%` }}
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${opinion.cautious}%` }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
              className="absolute top-0 h-full bg-amber-500"
              style={{ left: `${opinion.reformists}%`, width: `${opinion.cautious}%` }}
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${opinion.hardliners}%` }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
              className="absolute top-0 h-full bg-red-500"
              style={{ left: `${opinion.reformists + opinion.cautious}%`, width: `${opinion.hardliners}%` }}
            />
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-slate-300">Reformists {Math.round(opinion.reformists)}%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-slate-300">Cautious {Math.round(opinion.cautious)}%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <span className="text-slate-300">Hardliners {Math.round(opinion.hardliners)}%</span>
            </div>
          </div>

          {/* Tooltip */}
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-md bg-slate-900 p-2 text-center text-xs text-blue-200"
              >
                Internal lean: <span className="font-bold text-white">{opinion.supportScore}%</span> for approval
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
