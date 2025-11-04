"use client"

import { Button } from "@/components/ui/button"
import { useGameStore } from "@/lib/state"

interface GameOverlayProps {
  result: "win" | "lose"
  onReset: () => void
}

export function GameOverlay({ result, onReset }: GameOverlayProps) {
  const legacy = useGameStore((state) => state.legacy)
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-card p-8 text-center shadow-2xl">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold text-foreground">
            {result === "win" ? "🎉 Re-elected!" : "📉 One-Term Wonder"}
          </h2>
          <p className="text-lg text-muted-foreground">
            {result === "win"
              ? "All stats above 70! The people love you!"
              : "A stat hit zero. Your presidency is over."}
          </p>
        </div>

        <div className="pt-4 border-t border-slate-700 space-y-2">
          <div className="text-sm text-slate-400">Legacy</div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">{currentTitle}</span>
            <span className="text-2xl font-bold text-blue-300">{Math.round(currentIndex)}</span>
          </div>
          {legacy.bestIndex > 0 && (
            <div className="text-xs text-slate-400">
              Best Ever: {Math.round(legacy.bestIndex)} — {legacy.bestTitle}
            </div>
          )}
        </div>

        <Button onClick={onReset} size="lg" className="w-full">
          Start New Term
        </Button>
      </div>
    </div>
  )
}
