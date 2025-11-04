"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useGameStore, type MinisterKey } from "@/lib/state"

const MINISTER_LABELS: Record<MinisterKey, string> = {
  defense: "Defense",
  finance: "Finance",
  justice: "Justice",
  foreign: "Foreign",
}

const MINISTER_INITIALS: Record<MinisterKey, string> = {
  defense: "RH",
  finance: "VP",
  justice: "LR",
  foreign: "AC",
}

export function CabinetLoyaltyPanel() {
  const cabinet = useGameStore((state) => state.cabinet)
  const termOver = useGameStore((state) => state.termOver)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl bg-slate-800/50 p-4 backdrop-blur space-y-4 ${termOver ? "grayscale" : ""}`}
    >
      <h3 className="text-sm font-semibold text-slate-300">Cabinet Loyalty</h3>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(Object.keys(MINISTER_LABELS) as MinisterKey[]).map((key) => (
          <MinisterCard key={key} ministerKey={key} minister={cabinet[key]} termOver={termOver} />
        ))}
      </div>
    </motion.div>
  )
}

interface MinisterCardProps {
  ministerKey: MinisterKey
  minister: {
    name: string
    loyalty: number
    trend: number[]
    status: "active" | "resigned"
    lastReason?: string
  }
  termOver: boolean
}

function MinisterCard({ ministerKey, minister }: MinisterCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const prevLoyaltyRef = useRef(minister.loyalty)
  const hasLargeChange = Math.abs(minister.loyalty - prevLoyaltyRef.current) >= 3

  useEffect(() => {
    prevLoyaltyRef.current = minister.loyalty
  }, [minister.loyalty])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    ctx.clearRect(0, 0, width, height)

    if (minister.trend.length < 2) return

    const color = minister.loyalty >= 70 ? "#10b981" : minister.loyalty >= 40 ? "#f59e0b" : "#f43f5e"
    ctx.strokeStyle = color
    ctx.lineWidth = 1.5
    ctx.globalAlpha = 0.6
    ctx.beginPath()

    minister.trend.forEach((point, i) => {
      const x = (i / (minister.trend.length - 1)) * width
      const y = height - (point / 100) * height
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })

    ctx.stroke()
    ctx.globalAlpha = 1
  }, [minister.trend, minister.loyalty])

  const loyaltyColor =
    minister.loyalty >= 70
      ? "text-emerald-300 bg-emerald-400"
      : minister.loyalty >= 40
        ? "text-amber-300 bg-amber-400"
        : "text-rose-300 bg-rose-400"

  const statusColor =
    minister.status === "active" ? "bg-emerald-500/30 text-emerald-200" : "bg-rose-500/30 text-rose-200"

  const ariaLabel = `${MINISTER_LABELS[ministerKey]} minister ${minister.name}, loyalty ${minister.loyalty} percent, ${minister.status}`

  return (
    <motion.div
      role="status"
      aria-label={ariaLabel}
      initial={{ scale: 1 }}
      animate={{ scale: hasLargeChange ? [1, 1.03, 1] : 1 }}
      transition={{ duration: 0.4 }}
      className={`relative rounded-lg bg-slate-900/50 p-3 space-y-2 ${minister.status === "resigned" ? "opacity-50 saturate-50" : ""}`}
      title={minister.lastReason}
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
          {MINISTER_INITIALS[ministerKey]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-slate-300 truncate">{MINISTER_LABELS[ministerKey]}</div>
          <div className="text-[10px] text-slate-400 truncate">{minister.name}</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <motion.span
          key={minister.loyalty}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className={`text-lg font-bold ${loyaltyColor.split(" ")[0]}`}
        >
          {minister.loyalty}
        </motion.span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${statusColor}`}>
          {minister.status === "active" ? "Active" : "Resigned"}
        </span>
      </div>

      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${minister.loyalty}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`h-full ${loyaltyColor.split(" ")[1]}`}
        />
      </div>

      <canvas ref={canvasRef} width={80} height={20} className="w-full h-5" />

      {minister.lastReason && (
        <div className="text-[9px] text-slate-400 truncate" title={minister.lastReason}>
          {minister.lastReason}
        </div>
      )}
    </motion.div>
  )
}
