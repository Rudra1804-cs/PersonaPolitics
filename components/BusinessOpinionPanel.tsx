"use client"

import { motion } from "framer-motion"
import { predictPolicyImpact } from "@/lib/econHeuristics"
import { useGameStore } from "@/lib/state"

interface BusinessOpinionPanelProps {
  policyId: string
  difficulty: "easy" | "medium" | "hard"
}

export function BusinessOpinionPanel({ policyId, difficulty }: BusinessOpinionPanelProps) {
  const termOver = useGameStore((state) => state.termOver)

  const approvePreview = predictPolicyImpact(policyId, difficulty, "approve")
  const rejectPreview = predictPolicyImpact(policyId, difficulty, "reject")

  // Compute opinion score for Approve action
  const approveScore =
    2 * approvePreview.gdp +
    2 * approvePreview.market +
    approvePreview.conf -
    approvePreview.infl -
    approvePreview.unemp

  const opinion =
    approveScore > 5
      ? { label: "Favorable", color: "text-green-400" }
      : approveScore < -5
        ? { label: "Concern", color: "text-rose-400" }
        : { label: "Mixed", color: "text-amber-400" }

  const formatDelta = (value: number, metric: string) => {
    if (Math.abs(value) < 0.05) return null
    const arrow = value > 0 ? "▲" : "▼"
    const sign = value > 0 ? "+" : ""
    return (
      <span key={metric} className="text-xs whitespace-nowrap">
        {metric} {arrow} {sign}
        {value.toFixed(1)}
      </span>
    )
  }

  const renderDeltas = (delta: typeof approvePreview) => {
    const items = [
      formatDelta(delta.gdp, "GDP"),
      formatDelta(delta.infl, "Infl"),
      formatDelta(delta.unemp, "Unemp"),
      formatDelta(delta.market, "Mkt"),
      formatDelta(delta.conf, "Conf"),
    ].filter(Boolean)

    return items.length > 0 ? (
      <div className="flex flex-wrap gap-1.5">{items}</div>
    ) : (
      <span className="text-xs text-muted-foreground">No change</span>
    )
  }

  if (termOver) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-3 space-y-2 rounded-lg border border-slate-700/50 bg-slate-800/30 p-3"
    >
      <div className="flex items-center gap-2" title="Based on current conditions and difficulty">
        <span className="text-xs font-semibold text-slate-300">Business Opinion</span>
        <span className={`text-xs font-bold ${opinion.color}`}>{opinion.label}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-slate-300">
        <div className="space-y-1">
          <div className="text-xs font-medium text-green-400">Approve</div>
          {renderDeltas(approvePreview)}
        </div>
        <div className="space-y-1">
          <div className="text-xs font-medium text-rose-400">Reject</div>
          {renderDeltas(rejectPreview)}
        </div>
      </div>
    </motion.div>
  )
}
