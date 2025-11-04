"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { GameModal } from "@/components/GameModal"
import { GAME_REGISTRY } from "@/lib/games/registry"
import { useGameStore } from "@/lib/state"
import type { MiniGameDef, Difficulty, GameResult } from "@/lib/games/types"

export default function DebugPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedGame, setSelectedGame] = useState<MiniGameDef | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("medium")
  const [lastResult, setLastResult] = useState<GameResult | null>(null)

  const { termSecondsLeft, termStarted, termOver, startTerm, endTerm, resetTerm } = useGameStore()

  const handleTestGame = (game: MiniGameDef, difficulty: Difficulty) => {
    setSelectedGame(game)
    setSelectedDifficulty(difficulty)
    setModalOpen(true)
  }

  const handleComplete = (result: GameResult) => {
    setLastResult(result)
    setModalOpen(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">Mini-Game Debug Console</h1>
          <p className="text-blue-200">Test each game at different difficulty levels</p>
        </div>

        <div className="rounded-xl bg-slate-800/50 p-6 backdrop-blur space-y-4">
          <h3 className="text-xl font-bold text-white">Term Timer Controls</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-blue-200 mb-1">Time Left</p>
              <p className="text-2xl font-bold text-white">{formatTime(termSecondsLeft)}</p>
            </div>
            <div className="flex-1">
              <p className="text-sm text-blue-200 mb-1">Status</p>
              <p className="text-lg font-semibold text-white">
                {termOver ? "Over" : termStarted ? "Running" : "Not Started"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={startTerm}
              disabled={termStarted || termOver}
              variant="outline"
              className="flex-1 bg-transparent"
            >
              Start Term
            </Button>
            <Button onClick={endTerm} disabled={termOver} variant="outline" className="flex-1 bg-transparent">
              End Term
            </Button>
            <Button onClick={resetTerm} variant="outline" className="flex-1 bg-transparent">
              Reset Term
            </Button>
          </div>
        </div>

        {lastResult && (
          <div className="rounded-lg bg-slate-800/50 p-4 backdrop-blur">
            <h3 className="font-bold text-white mb-2">Last Result:</h3>
            <p className="text-blue-200">
              Approved: {lastResult.approved ? "Yes" : "No"} | Misses: {lastResult.misses} | Rounds: {lastResult.rounds}
            </p>
          </div>
        )}

        <div className="space-y-6">
          {GAME_REGISTRY.map((game) => (
            <div key={game.id} className="rounded-xl bg-slate-800/50 p-6 backdrop-blur">
              <h2 className="text-2xl font-bold text-white mb-4">{game.label}</h2>
              <div className="flex gap-4">
                <Button onClick={() => handleTestGame(game, "easy")} variant="outline" className="flex-1">
                  Test Easy
                </Button>
                <Button onClick={() => handleTestGame(game, "medium")} variant="outline" className="flex-1">
                  Test Medium
                </Button>
                <Button onClick={() => handleTestGame(game, "hard")} variant="outline" className="flex-1">
                  Test Hard
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button onClick={() => (window.location.href = "/")} variant="secondary">
            Back to Game
          </Button>
        </div>
      </div>

      {selectedGame && (
        <GameModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          game={selectedGame}
          difficulty={selectedDifficulty}
          onComplete={handleComplete}
        />
      )}
    </div>
  )
}
