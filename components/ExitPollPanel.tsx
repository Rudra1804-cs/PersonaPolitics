"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { useGameStore, type AgeKey, type GenderKey } from "@/lib/state"

const AGE_LABELS: Record<AgeKey, string> = {
  "18_30": "18-30",
  "31_60": "31-60",
  "60_80": "60-80",
  "80_plus": "80+",
}

const GENDER_LABELS: Record<GenderKey, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
}

export function ExitPollPanel() {
  const exitPoll = useGameStore((state) => state.exitPoll)
  const termOver = useGameStore((state) => state.termOver)
  const [timeAgo, setTimeAgo] = useState("just now")

  useEffect(() => {
    const interval = setInterval(() => {
      const seconds = Math.floor((Date.now() - exitPoll.lastUpdated) / 1000)
      if (seconds < 5) {
        setTimeAgo("just now")
      } else if (seconds < 60) {
        setTimeAgo(`${seconds}s ago`)
      } else {
        const mins = Math.floor(seconds / 60)
        setTimeAgo(`${mins}:${(seconds % 60).toString().padStart(2, "0")} ago`)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [exitPoll.lastUpdated])

  const ownPartyStance = exitPoll.ownParty >= 70 ? "Strong" : exitPoll.ownParty >= 55 ? "Leaning" : "Fractured"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl bg-slate-800/50 p-4 backdrop-blur space-y-4 ${termOver ? "grayscale" : ""}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300">
          Exit Poll (n={exitPoll.sample.toLocaleString()} • ±{exitPoll.moe.toFixed(1)}%)
        </h3>
        <span className="text-xs text-slate-400">Updated {timeAgo}</span>
      </div>

      {/* Age Groups */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-slate-400">Age Groups</h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {(Object.keys(AGE_LABELS) as AgeKey[]).map((key) => (
            <AgeCard
              key={key}
              label={AGE_LABELS[key]}
              value={exitPoll.age[key]}
              trend={exitPoll.trends.age[key]}
              termOver={termOver}
            />
          ))}
        </div>
      </div>

      {/* Gender */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-slate-400">Gender</h4>
        <div className="grid grid-cols-3 gap-3">
          {(Object.keys(GENDER_LABELS) as GenderKey[]).map((key) => (
            <GenderCard
              key={key}
              label={GENDER_LABELS[key]}
              value={exitPoll.gender[key]}
              trend={exitPoll.trends.gender[key]}
              termOver={termOver}
            />
          ))}
        </div>
      </div>

      {/* Own Party */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-slate-400">Own Party Support</h4>
        <OwnPartyCard
          value={exitPoll.ownParty}
          stance={ownPartyStance}
          trend={exitPoll.trends.ownParty}
          termOver={termOver}
        />
      </div>

      {/* Urban vs Rural & Undecided */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <SimpleBar label="Urban" value={exitPoll.urban} termOver={termOver} />
        <SimpleBar label="Rural" value={exitPoll.rural} termOver={termOver} />
        <SimpleBar label="Undecided" value={exitPoll.undecided} color="amber" termOver={termOver} />
      </div>

      {/* Overall Trend */}
      <div className="pt-2 border-t border-slate-700/50">
        <OverallTrend trend={exitPoll.trends.overall} termOver={termOver} />
      </div>
    </motion.div>
  )
}

interface AgeCardProps {
  label: string
  value: number
  trend: Array<{ t: number; value: number }>
  termOver: boolean
}

function AgeCard({ label, value, trend }: AgeCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const prevValueRef = useRef(value)
  const hasLargeChange = Math.abs(value - prevValueRef.current) >= 3

  useEffect(() => {
    prevValueRef.current = value
  }, [value])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    ctx.clearRect(0, 0, width, height)

    if (trend.length < 2) return

    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 1.5
    ctx.globalAlpha = 0.6
    ctx.beginPath()

    trend.forEach((point, i) => {
      const x = (i / (trend.length - 1)) * width
      const y = height - (point.value / 100) * height
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })

    ctx.stroke()
    ctx.globalAlpha = 1
  }, [trend])

  const isRising = trend.length >= 2 && trend[trend.length - 1].value > trend[trend.length - 2].value
  const ariaLabel = `${label} support ${value} percent, ${isRising ? "rising" : "falling"}`

  return (
    <motion.div
      role="status"
      aria-label={ariaLabel}
      initial={{ scale: 1 }}
      animate={{ scale: hasLargeChange ? [1, 1.02, 1] : 1 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-lg bg-slate-900/50 p-3 space-y-2"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-300">{label}</span>
        <motion.span
          key={value}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="text-lg font-bold text-blue-300"
        >
          {value}%
        </motion.span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full bg-blue-400"
        />
      </div>
      <canvas ref={canvasRef} width={80} height={20} className="w-full h-5" />
    </motion.div>
  )
}

interface GenderCardProps {
  label: string
  value: number
  trend: Array<{ t: number; value: number }>
  termOver: boolean
}

function GenderCard({ label, value, trend }: GenderCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const prevValueRef = useRef(value)
  const hasLargeChange = Math.abs(value - prevValueRef.current) >= 3

  useEffect(() => {
    prevValueRef.current = value
  }, [value])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    ctx.clearRect(0, 0, width, height)

    if (trend.length < 2) return

    ctx.strokeStyle = "#8b5cf6"
    ctx.lineWidth = 1.5
    ctx.globalAlpha = 0.6
    ctx.beginPath()

    trend.forEach((point, i) => {
      const x = (i / (trend.length - 1)) * width
      const y = height - (point.value / 100) * height
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })

    ctx.stroke()
    ctx.globalAlpha = 1
  }, [trend])

  const isRising = trend.length >= 2 && trend[trend.length - 1].value > trend[trend.length - 2].value
  const ariaLabel = `${label} support ${value} percent, ${isRising ? "rising" : "falling"}`

  return (
    <motion.div
      role="status"
      aria-label={ariaLabel}
      initial={{ scale: 1 }}
      animate={{ scale: hasLargeChange ? [1, 1.02, 1] : 1 }}
      transition={{ duration: 0.4 }}
      className="rounded-lg bg-slate-900/50 p-3 space-y-2"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-300">{label}</span>
        <motion.span
          key={value}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="text-lg font-bold text-purple-300"
        >
          {value}%
        </motion.span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full bg-purple-400"
        />
      </div>
      <canvas ref={canvasRef} width={60} height={20} className="w-full h-5" />
    </motion.div>
  )
}

interface OwnPartyCardProps {
  value: number
  stance: string
  trend: Array<{ t: number; value: number }>
  termOver: boolean
}

function OwnPartyCard({ value, stance, trend }: OwnPartyCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const prevValueRef = useRef(value)
  const hasLargeChange = Math.abs(value - prevValueRef.current) >= 3

  useEffect(() => {
    prevValueRef.current = value
  }, [value])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    ctx.clearRect(0, 0, width, height)

    if (trend.length < 2) return

    ctx.strokeStyle = "#10b981"
    ctx.lineWidth = 2
    ctx.globalAlpha = 0.7
    ctx.beginPath()

    trend.forEach((point, i) => {
      const x = (i / (trend.length - 1)) * width
      const y = height - (point.value / 100) * height
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })

    ctx.stroke()
    ctx.globalAlpha = 1
  }, [trend])

  const stanceColor =
    stance === "Strong"
      ? "bg-emerald-500/30 text-emerald-200"
      : stance === "Leaning"
        ? "bg-blue-500/30 text-blue-200"
        : "bg-rose-500/30 text-rose-200"

  const isRising = trend.length >= 2 && trend[trend.length - 1].value > trend[trend.length - 2].value
  const ariaLabel = `Own party support ${value} percent, ${stance}, ${isRising ? "rising" : "falling"}`

  return (
    <motion.div
      role="status"
      aria-label={ariaLabel}
      initial={{ scale: 1 }}
      animate={{ scale: hasLargeChange ? [1, 1.02, 1] : 1 }}
      transition={{ duration: 0.4 }}
      className="rounded-lg bg-slate-900/50 p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-300">Own Party</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${stanceColor}`}>{stance}</span>
        </div>
        <motion.span
          key={value}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="text-2xl font-bold text-emerald-300"
        >
          {value}%
        </motion.span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full bg-emerald-400"
        />
      </div>
      <canvas ref={canvasRef} width={200} height={30} className="w-full h-8" />
    </motion.div>
  )
}

interface SimpleBarProps {
  label: string
  value: number
  color?: "blue" | "amber"
  termOver: boolean
}

function SimpleBar({ label, value, color = "blue" }: SimpleBarProps) {
  const barColor = color === "amber" ? "bg-amber-400" : "bg-blue-400"
  const textColor = color === "amber" ? "text-amber-300" : "text-blue-300"

  return (
    <div className="rounded-lg bg-slate-900/50 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-300">{label}</span>
        <motion.span
          key={value}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className={`text-sm font-bold ${textColor}`}
        >
          {value}%
        </motion.span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`h-full ${barColor}`}
        />
      </div>
    </div>
  )
}

interface OverallTrendProps {
  trend: Array<{ t: number; value: number }>
  termOver: boolean
}

function OverallTrend({ trend }: OverallTrendProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    ctx.clearRect(0, 0, width, height)

    if (trend.length < 2) return

    ctx.strokeStyle = "#60a5fa"
    ctx.lineWidth = 2
    ctx.globalAlpha = 0.8
    ctx.beginPath()

    trend.forEach((point, i) => {
      const x = (i / (trend.length - 1)) * width
      const y = height - (point.value / 100) * height
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })

    ctx.stroke()
    ctx.globalAlpha = 1
  }, [trend])

  const currentValue = trend.length > 0 ? trend[trend.length - 1].value : 50

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">Overall Trend</span>
        <span className="text-sm font-bold text-blue-300">{currentValue.toFixed(1)}%</span>
      </div>
      <canvas ref={canvasRef} width={400} height={40} className="w-full h-10 rounded" />
    </div>
  )
}
