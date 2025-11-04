"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useGameStore } from "@/lib/state"

export function StatToasts() {
  const { statToasts, clearOldStatToasts, termOver } = useGameStore()

  useEffect(() => {
    const interval = setInterval(() => {
      clearOldStatToasts()
    }, 1000)

    return () => clearInterval(interval)
  }, [clearOldStatToasts])

  if (termOver) return null

  return (
    <div className="fixed top-4 right-4 z-40 space-y-2 pointer-events-none lg:right-[22rem]">
      <AnimatePresence mode="popLayout">
        {statToasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ y: -20, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="flex items-center gap-2 rounded-lg bg-slate-900/90 backdrop-blur border border-blue-500/30 px-3 py-2 shadow-lg"
          >
            {toast.a !== undefined && toast.a !== 0 && (
              <span className={`text-xs font-bold ${toast.a > 0 ? "text-green-400" : "text-red-400"}`}>
                {toast.a > 0 ? "+" : ""}
                {toast.a} A
              </span>
            )}
            {toast.p !== undefined && toast.p !== 0 && (
              <span className={`text-xs font-bold ${toast.p > 0 ? "text-green-400" : "text-red-400"}`}>
                {toast.p > 0 ? "+" : ""}
                {toast.p} P
              </span>
            )}
            {toast.s !== undefined && toast.s !== 0 && (
              <span className={`text-xs font-bold ${toast.s > 0 ? "text-green-400" : "text-red-400"}`}>
                {toast.s > 0 ? "+" : ""}
                {toast.s} S
              </span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
