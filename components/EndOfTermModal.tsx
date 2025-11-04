"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useGameStore } from "@/lib/state"
import { StatsBar } from "@/components/StatsBar"
import { getTier, tierCopy, tierStyles } from "@/lib/scoring"
import confetti from "canvas-confetti"

export function EndOfTermModal() {
  const { termOver, stats, policyLog, resetTerm, startTerm, worldEvents } = useGameStore()
  const [copied, setCopied] = useState(false)

  const totalScore = stats.approval + stats.power + stats.standing
  const tier = getTier(totalScore)
  const { title: tierTitle, line: tierLine } = tierCopy(tier)
  const styles = tierStyles(tier)

  // Trigger confetti for legendary performance
  const handleOpen = () => {
    if (tier === "legendary") {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    }
  }

  const handleNewTerm = () => {
    resetTerm()
    startTerm()
  }

  const handleShare = () => {
    const summary = `Persona Politics - Term Complete!\n\nApproval: ${stats.approval}\nPower: ${stats.power}\nStanding: ${stats.standing}\nTotal: ${totalScore}\n\nTier: ${tierTitle}\n${tierLine}\n\nPolicies Resolved: ${policyLog.length}\nWorld Events: ${worldEvents.length}`
    navigator.clipboard.writeText(summary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AnimatePresence>
      {termOver && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
            style={{ filter: tier === "bad" ? "grayscale(0.3)" : "none" }}
            onAnimationComplete={handleOpen}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-4xl rounded-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8 shadow-2xl border border-blue-500/30 my-8"
              role="dialog"
              aria-modal="true"
              aria-labelledby="term-complete-title"
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                  <h2 id="term-complete-title" className="text-4xl font-bold text-white">
                    Term Complete
                  </h2>
                  <p className="text-sm text-blue-300">Time's up. History will judge.</p>
                </div>

                {/* Final Stats */}
                <div className="rounded-xl bg-slate-800/50 p-6 backdrop-blur space-y-4">
                  <h3 className="text-xl font-bold text-white">Final Stats</h3>
                  <StatsBar label="Approval" value={stats.approval} />
                  <StatsBar label="Power" value={stats.power} />
                  <StatsBar label="Standing" value={stats.standing} />
                  <div className="pt-4 border-t border-slate-700">
                    <p className="text-center text-2xl font-bold text-white">Total Score: {totalScore}</p>
                  </div>
                </div>

                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className={`rounded-xl p-6 backdrop-blur border-2 ${styles.box}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`px-4 py-2 rounded-lg ${styles.pill} font-bold text-white text-lg shadow-lg`}>
                      {tierTitle}
                    </div>
                    <p className="text-lg font-medium flex-1">{tierLine}</p>
                  </div>
                </motion.div>

                {/* World Events Summary */}
                {worldEvents.length > 0 && (
                  <div className="rounded-xl bg-slate-800/50 p-6 backdrop-blur space-y-4">
                    <h3 className="text-xl font-bold text-white">
                      World Events During Your Term ({worldEvents.length})
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-500/50 scrollbar-track-transparent">
                      {worldEvents.map((event, idx) => (
                        <div key={idx} className="rounded-lg bg-slate-700/30 p-3 border border-slate-600/30">
                          <div className="flex items-start gap-2 mb-1">
                            <span
                              className={`text-xs font-bold uppercase ${
                                event.urgency === "high"
                                  ? "text-red-300"
                                  : event.urgency === "medium"
                                    ? "text-yellow-300"
                                    : "text-green-300"
                              }`}
                            >
                              {event.urgency}
                            </span>
                            <span className="text-xs text-slate-400">
                              {Math.floor(event.time / 60)}:{(event.time % 60).toString().padStart(2, "0")}
                            </span>
                          </div>
                          <p className="text-sm text-white font-medium">{event.headline}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Policy Summary Table */}
                {policyLog.length > 0 && (
                  <div className="rounded-xl bg-slate-800/50 p-6 backdrop-blur space-y-4">
                    <h3 className="text-xl font-bold text-white">Policy Summary</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-700">
                            <th className="text-left py-2 px-2 text-blue-200 font-semibold">Title</th>
                            <th className="text-left py-2 px-2 text-blue-200 font-semibold">Decision</th>
                            <th className="text-left py-2 px-2 text-blue-200 font-semibold">Result</th>
                            <th className="text-right py-2 px-2 text-blue-200 font-semibold">ΔA</th>
                            <th className="text-right py-2 px-2 text-blue-200 font-semibold">ΔP</th>
                            <th className="text-right py-2 px-2 text-blue-200 font-semibold">ΔS</th>
                            <th className="text-right py-2 px-2 text-blue-200 font-semibold">Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {policyLog.map((entry, idx) => (
                            <tr key={idx} className="border-b border-slate-700/50">
                              <td className="py-2 px-2 text-white">{entry.title}</td>
                              <td className="py-2 px-2">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                                    entry.decision === "approve"
                                      ? "bg-green-500/20 text-green-300"
                                      : "bg-red-500/20 text-red-300"
                                  }`}
                                >
                                  {entry.decision}
                                </span>
                              </td>
                              <td className="py-2 px-2">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                                    entry.result === "win"
                                      ? "bg-blue-500/20 text-blue-300"
                                      : "bg-orange-500/20 text-orange-300"
                                  }`}
                                >
                                  {entry.result}
                                </span>
                              </td>
                              <td
                                className={`py-2 px-2 text-right font-mono ${
                                  entry.delta.approval > 0
                                    ? "text-green-400"
                                    : entry.delta.approval < 0
                                      ? "text-red-400"
                                      : "text-slate-400"
                                }`}
                              >
                                {entry.delta.approval > 0 ? "+" : ""}
                                {entry.delta.approval}
                              </td>
                              <td
                                className={`py-2 px-2 text-right font-mono ${
                                  entry.delta.power > 0
                                    ? "text-green-400"
                                    : entry.delta.power < 0
                                      ? "text-red-400"
                                      : "text-slate-400"
                                }`}
                              >
                                {entry.delta.power > 0 ? "+" : ""}
                                {entry.delta.power}
                              </td>
                              <td
                                className={`py-2 px-2 text-right font-mono ${
                                  entry.delta.standing > 0
                                    ? "text-green-400"
                                    : entry.delta.standing < 0
                                      ? "text-red-400"
                                      : "text-slate-400"
                                }`}
                              >
                                {entry.delta.standing > 0 ? "+" : ""}
                                {entry.delta.standing}
                              </td>
                              <td className="py-2 px-2 text-right text-slate-400 font-mono text-xs">
                                {Math.floor(entry.time / 60)}:{(entry.time % 60).toString().padStart(2, "0")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button onClick={handleNewTerm} className="flex-1 h-12 text-lg" size="lg">
                    Start New Term
                  </Button>
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="flex-1 h-12 text-lg bg-transparent"
                    size="lg"
                  >
                    {copied ? "Copied!" : "Share Result"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
