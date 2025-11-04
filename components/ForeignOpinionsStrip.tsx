"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useGameStore, type BlocKey } from "@/lib/state"

const BLOC_CONFIG: Record<
  BlocKey,
  {
    emoji: string
    name: string
  }
> = {
  NATO: { emoji: "🛡️", name: "NATO" },
  EU: { emoji: "🇪🇺", name: "EU" },
  BRICS: { emoji: "🌍", name: "BRICS" },
  OIC: { emoji: "🕊️", name: "OIC" },
  SCO: { emoji: "🧭", name: "SCO" },
}

export function ForeignOpinionsStrip() {
  const foreignOpinions = useGameStore((state) => state.foreignOpinions)
  const termOver = useGameStore((state) => state.termOver)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-slate-800/50 p-4 backdrop-blur"
    >
      <h3 className="text-sm font-semibold text-slate-300 mb-3">Foreign Blocs Opinion</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {(Object.keys(BLOC_CONFIG) as BlocKey[]).map((bloc) => (
          <BlocCard key={bloc} bloc={bloc} opinion={foreignOpinions[bloc]} termOver={termOver} />
        ))}
      </div>
    </motion.div>
  )
}

interface BlocCardProps {
  bloc: BlocKey
  opinion: {
    score: number
    stance: "Supportive" | "Neutral" | "Critical"
    reason: string
    history: Array<{ t: number; score: number }>
  }
  termOver: boolean
}

function BlocCard({ bloc, opinion, termOver }: BlocCardProps) {
  const config = BLOC_CONFIG[bloc]
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const prevScoreRef = useRef(opinion.score)

  const stanceColors = {
    Supportive: {
      bg: "bg-emerald-600/20",
      border: "border-emerald-400",
      text: "text-emerald-100",
      pill: "bg-emerald-500/30 text-emerald-200",
    },
    Neutral: {
      bg: "bg-slate-700/30",
      border: "border-slate-400",
      text: "text-slate-100",
      pill: "bg-slate-500/30 text-slate-200",
    },
    Critical: {
      bg: "bg-rose-700/20",
      border: "border-rose-400",
      text: "text-rose-100",
      pill: "bg-rose-500/30 text-rose-200",
    },
  }

  const colors = stanceColors[opinion.stance]
  const hasChanged = prevScoreRef.current !== opinion.score

  useEffect(() => {
    prevScoreRef.current = opinion.score
  }, [opinion.score])

  // Draw sparkline
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    ctx.clearRect(0, 0, width, height)

    if (opinion.history.length < 2) return

    ctx.strokeStyle = termOver ? "#64748b" : "#3b82f6"
    ctx.lineWidth = 1
    ctx.globalAlpha = 0.5
    ctx.beginPath()

    opinion.history.forEach((point, i) => {
      const x = (i / (opinion.history.length - 1)) * width
      const y = height - (point.score / 100) * height

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()
    ctx.globalAlpha = 1
  }, [opinion.history, termOver])

  return (
    <motion.div
      role="status"
      aria-label={`${config.name} opinion: ${opinion.stance}, score ${opinion.score}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: 1,
        scale: 1,
        boxShadow: hasChanged && !termOver ? "0 0 20px rgba(59, 130, 246, 0.3)" : "none",
      }}
      transition={{ duration: 0.3 }}
      className={`relative rounded-lg border ${colors.border} ${colors.bg} p-3 space-y-2 max-h-[88px] ${
        termOver ? "grayscale" : ""
      }`}
    >
      <canvas
        ref={canvasRef}
        width={120}
        height={40}
        className="absolute inset-0 w-full h-full rounded-lg pointer-events-none"
      />

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">
            {config.emoji}
          </span>
          <span className={`text-xs font-semibold ${colors.text}`}>{config.name}</span>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${colors.pill}`}>{opinion.stance}</span>
      </div>

      <div className="relative z-10 space-y-1">
        <div className="flex items-center justify-between">
          <div className="h-1.5 flex-1 bg-slate-900/50 rounded-full overflow-hidden mr-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${opinion.score}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`h-full ${
                opinion.stance === "Supportive"
                  ? "bg-emerald-400"
                  : opinion.stance === "Critical"
                    ? "bg-rose-400"
                    : "bg-slate-400"
              }`}
            />
          </div>
          <motion.span
            key={opinion.score}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className={`text-[10px] font-bold ${colors.text}`}
          >
            {opinion.score.toFixed(2)}
          </motion.span>
        </div>

        {opinion.reason && (
          <p className="text-[10px] text-slate-300 truncate leading-tight" title={opinion.reason}>
            {opinion.reason}
          </p>
        )}
      </div>
    </motion.div>
  )
}
