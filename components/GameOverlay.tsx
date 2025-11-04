"use client"

import { Button } from "@/components/ui/button"

interface GameOverlayProps {
  result: "win" | "lose"
  onReset: () => void
}

export function GameOverlay({ result, onReset }: GameOverlayProps) {
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
        <Button onClick={onReset} size="lg" className="w-full">
          Start New Term
        </Button>
      </div>
    </div>
  )
}
