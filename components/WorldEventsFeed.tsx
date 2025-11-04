"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useGameStore } from "@/lib/state"
import { X } from "lucide-react"

interface WorldEventCardProps {
  id: string
  headline: string
  detail: string
  urgency: "low" | "medium" | "high"
  time: number
  onRemove: (id: string) => void
}

function WorldEventCard({ id, headline, detail, urgency, time, onRemove }: WorldEventCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (isHovered) return

    const timer = setTimeout(() => {
      onRemove(id)
    }, 25000)

    return () => clearTimeout(timer)
  }, [id, onRemove, isHovered])

  const urgencyStyles = {
    low: {
      border: "border-green-500/30",
      bg: "bg-green-500/10",
      text: "text-green-300",
      glow: "",
    },
    medium: {
      border: "border-yellow-500/40",
      bg: "bg-yellow-500/10",
      text: "text-yellow-300",
      glow: "shadow-yellow-500/20",
    },
    high: {
      border: "border-red-500/50",
      bg: "bg-red-500/10",
      text: "text-red-300",
      glow: "shadow-lg shadow-red-500/30 animate-pulse",
    },
  }

  const styles = urgencyStyles[urgency]

  return (
    <motion.div
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 60, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`relative rounded-lg border ${styles.border} ${styles.bg} ${styles.glow} p-4 backdrop-blur`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={() => onRemove(id)}
        className="absolute top-2 right-2 text-slate-400 hover:text-white transition-colors"
        aria-label="Dismiss event"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="space-y-2 pr-6">
        <div className="flex items-start gap-2">
          <span className={`text-xs font-bold uppercase ${styles.text}`}>{urgency}</span>
          <span className="text-xs text-slate-400">
            {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, "0")}
          </span>
        </div>
        <h4 className="text-sm font-bold text-white leading-tight">{headline}</h4>
        <p className="text-xs text-slate-300 leading-relaxed">{detail}</p>
      </div>
    </motion.div>
  )
}

export function WorldEventsFeed() {
  const { worldEvents, removeWorldEvent, termOver } = useGameStore()
  const [isCollapsed, setIsCollapsed] = useState(false)

  if (termOver) return null

  return (
    <>
      {/* Desktop: Fixed right sidebar */}
      <div className="hidden lg:block fixed right-4 top-4 w-80 max-h-[calc(100vh-2rem)] z-40">
        <div className="rounded-xl bg-slate-900/90 backdrop-blur border border-blue-500/30 p-4 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">World in Motion</h3>
            <span className="text-xs text-blue-300">{worldEvents.length} active</span>
          </div>

          <div className="space-y-3 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-500/50 scrollbar-track-transparent">
            <AnimatePresence mode="popLayout">
              {worldEvents.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-slate-400 text-center py-8"
                >
                  No events yet. Your decisions will shape the world...
                </motion.p>
              ) : (
                worldEvents.map((event) => (
                  <WorldEventCard
                    key={event.id}
                    id={event.id}
                    headline={event.headline}
                    detail={event.detail}
                    urgency={event.urgency}
                    time={event.time}
                    onRemove={removeWorldEvent}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile: Collapsible bottom drawer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
        <motion.div
          initial={false}
          animate={{ y: isCollapsed ? 0 : 0 }}
          className="bg-slate-900/95 backdrop-blur border-t border-blue-500/30 shadow-2xl"
        >
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full px-4 py-3 flex items-center justify-between text-white"
          >
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold">World in Motion</h3>
              <span className="text-xs text-blue-300">({worldEvents.length})</span>
            </div>
            <motion.div animate={{ rotate: isCollapsed ? 0 : 180 }} transition={{ duration: 0.2 }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </button>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-3 max-h-64 overflow-y-auto">
                  <AnimatePresence mode="popLayout">
                    {worldEvents.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">
                        No events yet. Your decisions will shape the world...
                      </p>
                    ) : (
                      worldEvents.map((event) => (
                        <WorldEventCard
                          key={event.id}
                          id={event.id}
                          headline={event.headline}
                          detail={event.detail}
                          urgency={event.urgency}
                          time={event.time}
                          onRemove={removeWorldEvent}
                        />
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  )
}
