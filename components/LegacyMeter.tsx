"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useGameStore } from "@/lib/state"

export function LegacyMeter() {
  const legacy = useGameStore((state) => state.legacy)
  const termOver = useGameStore((state) => state.termOver)
  const stats = useGameStore((state) => state.stats)
  const economy = useGameStore((state) => state.economy)
  const computeLegacyIndex = useGameStore((state) => state.computeLegacyIndex)

  const currentIndex = computeLegacyIndex({
    approval: stats.approval,
    power: stats.power,
    standing: stats.standing,
    economy: { gdp: economy.gdp, unemp: economy.unemp },
  })

  const currentTitle =
    currentIndex >= 85
      ? "Visionary Leader"
      : currentIndex >= 70
        ? "Respected Statesman"
        : currentIndex >= 50
          ? "Pragmatic Politician"
          : "Disgraced Official"

  const titleColor =
    currentIndex >= 85
      ? "bg-purple-500/30 text-purple-200"
      : currentIndex >= 70
        ? "bg-blue-500/30 text-blue-200"
        : currentIndex >= 50
          ? "bg-amber-500/30 text-amber-200"
          : "bg-rose-500/30 text-rose-200"

  const gaugeColor =
    currentIndex >= 85
      ? "bg-purple-400"
      : currentIndex >= 70
        ? "bg-blue-400"
        : currentIndex >= 50
          ? "bg-amber-400"
          : "bg-rose-400"

  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    ctx.clearRect(0, 0, width, height)

    if (legacy.history.length < 2) return

    const color = currentIndex >= 70 ? "#60a5fa" : currentIndex >= 50 ? "#fbbf24" : "#f87171"
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.globalAlpha = 0.7
    ctx.beginPath()

    legacy.history.forEach((point, i) => {
      const x = (i / (legacy.history.length - 1)) * width
      const y = height - (point.index / 100) * height
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })

    ctx.stroke()
    ctx.globalAlpha = 1
  }, [legacy.history, currentIndex])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl bg-slate-800/50 p-6 backdrop-blur space-y-4 ${termOver ? "grayscale" : ""}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300">Legacy Index</h3>
        <span className={`text-xs px-3 py-1 rounded-full ${titleColor}`}>{currentTitle}</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgb(30 41 59)" strokeWidth="8" />
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={gaugeColor.replace("bg-", "rgb(var(--")}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 40}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - currentIndex / 100) }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={gaugeColor}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span
              key={currentIndex}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-2xl font-bold text-white"
            >
              {Math.round(currentIndex)}
            </motion.span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div className="space-y-1">
            <div className="text-xs text-slate-400">Current Term</div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${currentIndex}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full ${gaugeColor}`}
              />
            </div>
          </div>

          {legacy.bestIndex > 0 && (
            <div className="text-xs text-slate-400">
              Best Ever: <span className="font-semibold text-slate-300">{Math.round(legacy.bestIndex)}</span> —{" "}
              <span className="text-slate-300">{legacy.bestTitle}</span>
            </div>
          )}

          {legacy.history.length > 0 && (
            <canvas ref={canvasRef} width={200} height={30} className="w-full h-8 rounded" />
          )}
        </div>
      </div>
    </motion.div>
  )
}
