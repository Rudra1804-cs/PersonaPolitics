"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import { useGameStore } from "@/lib/state"
import type { MiniGameDef, Difficulty, GameResult } from "@/lib/games/types"

interface GameModalProps {
  isOpen: boolean
  onClose: () => void
  game: MiniGameDef
  difficulty: Difficulty
  onComplete: (result: GameResult) => void
}

export function GameModal({ isOpen, onClose, game, difficulty, onComplete }: GameModalProps) {
  const termOver = useGameStore((state) => state.termOver)

  useEffect(() => {
    if (termOver && isOpen) {
      onClose()
    }
  }, [termOver, isOpen, onClose])

  const handleComplete = (result: GameResult) => {
    if (useGameStore.getState().termOver) {
      console.log("[v0] Game completed after term ended - ignoring result")
      return
    }
    onComplete(result)
  }

  if (!isOpen) return null

  const GameComponent = game.Component

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-2xl rounded-xl bg-card p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold text-foreground">{game.label} — Win to Approve</h2>
            <p className="text-sm text-muted-foreground">
              Difficulty: <span className="font-bold text-destructive uppercase">{difficulty}</span>
            </p>
          </div>

          <GameComponent difficulty={difficulty} onComplete={handleComplete} />
        </div>
      </div>
    </div>
  )
}
