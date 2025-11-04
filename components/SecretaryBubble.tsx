"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useGameStore } from "@/lib/state"
import type { RemarkTone } from "@/lib/state"

const TONE_STYLES: Record<RemarkTone, { border: string; bg: string; emoji: string; textColor: string }> = {
  surprised: {
    border: "border-indigo-500/50",
    bg: "bg-indigo-500/10",
    emoji: "😲",
    textColor: "text-indigo-300",
  },
  proud: {
    border: "border-emerald-500/50",
    bg: "bg-emerald-500/10",
    emoji: "😌",
    textColor: "text-emerald-300",
  },
  neutral: {
    border: "border-slate-500/50",
    bg: "bg-slate-500/10",
    emoji: "🙂",
    textColor: "text-slate-300",
  },
  concerned: {
    border: "border-amber-500/50",
    bg: "bg-amber-500/10",
    emoji: "😬",
    textColor: "text-amber-300",
  },
  roast: {
    border: "border-rose-500/50",
    bg: "bg-rose-500/10",
    emoji: "😏",
    textColor: "text-rose-300",
  },
}

export function SecretaryBubble() {
  const { secretary, termOver } = useGameStore()
  const currentRemark = secretary.queue[0]
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!currentRemark) {
      setIsVisible(false)
      return
    }

    setIsVisible(true)

    const timer = setTimeout(() => {
      secretary.shift()
      setIsVisible(false)
    }, 3500)

    return () => clearTimeout(timer)
  }, [currentRemark, secretary])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && currentRemark) {
        secretary.shift()
        setIsVisible(false)
      }
    }

    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [currentRemark, secretary])

  if (termOver || !currentRemark) return null

  const styles = TONE_STYLES[currentRemark.tone]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 z-50 max-w-sm"
          role="status"
          aria-live="polite"
        >
          <div
            className={`flex items-start gap-3 rounded-xl border ${styles.border} ${styles.bg} p-4 backdrop-blur shadow-2xl`}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-xs font-bold text-white">
              Sec.
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase ${styles.textColor}`}>{currentRemark.tone}</span>
                <span className="text-lg">{styles.emoji}</span>
              </div>
              <p className="text-sm text-white leading-relaxed">{currentRemark.text}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
