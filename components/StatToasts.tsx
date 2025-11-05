"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useGameStore } from "@/lib/state"

export function StatToasts() {
  const { statToasts, clearOldStatToasts, termOver } = useGameStore()
  const [currentToast, setCurrentToast] = useState<(typeof statToasts)[0] | null>(null)

  useEffect(() => {
    if (statToasts.length > 0) {
      const latest = statToasts[statToasts.length - 1]
      setCurrentToast(latest)

      const timeout = setTimeout(() => {
        setCurrentToast(null)
        clearOldStatToasts()
      }, 5000)

      return () => clearTimeout(timeout)
    }
  }, [statToasts, clearOldStatToasts])

  if (termOver || !currentToast) return null

  return (
    <div className="fixed top-4 right-4 z-40 pointer-events-none lg:right-[22rem]">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentToast.id}
          initial={{ y: -20, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -10, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex items-center gap-2 rounded-lg bg-slate-900/90 backdrop-blur border border-blue-500/30 px-3 py-2 shadow-lg"
        >
          {currentToast.a !== undefined && currentToast.a !== 0 && (
            <span className={`text-xs font-bold ${currentToast.a > 0 ? "text-green-400" : "text-red-400"}`}>
              {currentToast.a > 0 ? "+" : ""}
              {currentToast.a} A
            </span>
          )}
          {currentToast.p !== undefined && currentToast.p !== 0 && (
            <span className={`text-xs font-bold ${currentToast.p > 0 ? "text-green-400" : "text-red-400"}`}>
              {currentToast.p > 0 ? "+" : ""}
              {currentToast.p} P
            </span>
          )}
          {currentToast.s !== undefined && currentToast.s !== 0 && (
            <span className={`text-xs font-bold ${currentToast.s > 0 ? "text-green-400" : "text-red-400"}`}>
              {currentToast.s > 0 ? "+" : ""}
              {currentToast.s} S
            </span>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
