"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useGameStore } from "@/lib/state"

export function EconomySnapshot() {
  const economy = useGameStore((state) => state.economy)
  const termOver = useGameStore((state) => state.termOver)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-slate-800/50 p-4 backdrop-blur"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <EconMetric
          label="GDP"
          value={economy.gdp.toFixed(1)}
          history={economy.history.map((p) => p.gdp)}
          range={[70, 140]}
          termOver={termOver}
        />
        <EconMetric
          label="Inflation"
          value={`${economy.infl.toFixed(1)}%`}
          history={economy.history.map((p) => p.infl)}
          range={[1, 15]}
          alert={economy.infl > 8}
          termOver={termOver}
        />
        <EconMetric
          label="Unemployment"
          value={`${economy.unemp.toFixed(1)}%`}
          history={economy.history.map((p) => p.unemp)}
          range={[2, 20]}
          alert={economy.unemp > 12}
          termOver={termOver}
        />
        <EconMetric
          label="Market"
          value={economy.market.toFixed(1)}
          history={economy.history.map((p) => p.market)}
          range={[60, 160]}
          termOver={termOver}
        />
        <EconMetric
          label="Business Confidence"
          value={economy.conf.toFixed(0)}
          history={economy.history.map((p) => p.conf)}
          range={[0, 100]}
          alert={economy.conf < 30}
          termOver={termOver}
        />
      </div>
    </motion.div>
  )
}

interface EconMetricProps {
  label: string
  value: string
  history: number[]
  range: [number, number]
  alert?: boolean
  termOver: boolean
}

function EconMetric({ label, value, history, range, alert, termOver }: EconMetricProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const [min, max] = range

    ctx.clearRect(0, 0, width, height)

    if (history.length < 2) return

    // Draw sparkline
    ctx.strokeStyle = termOver ? "#64748b" : "#3b82f6"
    ctx.lineWidth = 1.5
    ctx.beginPath()

    history.forEach((val, i) => {
      const x = (i / (history.length - 1)) * width
      const normalized = (val - min) / (max - min)
      const y = height - normalized * height

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Highlight last point
    const lastVal = history[history.length - 1]
    const lastX = width
    const lastY = height - ((lastVal - min) / (max - min)) * height

    ctx.fillStyle = termOver ? "#64748b" : alert ? "#ef4444" : "#3b82f6"
    ctx.beginPath()
    ctx.arc(lastX, lastY, 2.5, 0, Math.PI * 2)
    ctx.fill()
  }, [history, range, alert, termOver])

  return (
    <div className="flex items-center gap-3">
      <canvas ref={canvasRef} width={60} height={24} className="opacity-80" />
      <div className="space-y-0.5">
        <div className="text-xs text-slate-400">{label}</div>
        <motion.div
          key={value}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className={`text-sm font-bold ${
            alert ? "text-red-400 animate-pulse" : termOver ? "text-slate-400" : "text-white"
          }`}
        >
          {value}
        </motion.div>
      </div>
    </div>
  )
}
