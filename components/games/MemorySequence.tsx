"use client"

import { useState, useEffect } from "react"
import type { MiniGameProps, GameResult } from "@/lib/games/types"

const COLORS = [
  { id: 0, name: "Red", bg: "bg-red-500", active: "bg-red-300" },
  { id: 1, name: "Blue", bg: "bg-blue-500", active: "bg-blue-300" },
  { id: 2, name: "Green", bg: "bg-green-500", active: "bg-green-300" },
  { id: 3, name: "Yellow", bg: "bg-yellow-500", active: "bg-yellow-300" },
]

type GamePhase = "showing" | "waiting" | "inputting" | "success" | "fail"

export function MemorySequence({ difficulty, onComplete }: MiniGameProps) {
  const [round, setRound] = useState(1)
  const [misses, setMisses] = useState(0)
  const [sequence, setSequence] = useState<number[]>([])
  const [userInput, setUserInput] = useState<number[]>([])
  const [phase, setPhase] = useState<GamePhase>("waiting")
  const [activeColor, setActiveColor] = useState<number | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)

  const maxRounds = 4
  const maxMisses = 2

  const getSettings = () => {
    switch (difficulty) {
      case "easy":
        return { startLength: 3, flashDuration: 800 }
      case "medium":
        return { startLength: 3, flashDuration: 600 }
      case "hard":
        return { startLength: 4, flashDuration: 500 }
      default:
        return { startLength: 3, flashDuration: 600 }
    }
  }

  const settings = getSettings()

  const generateSequence = () => {
    const length = settings.startLength + round - 1
    const newSeq = Array.from({ length }, () => Math.floor(Math.random() * 4))
    setSequence(newSeq)
    setUserInput([])
    return newSeq
  }

  const showSequence = async (seq: number[]) => {
    setPhase("showing")
    for (let i = 0; i < seq.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      setActiveColor(seq[i])
      await new Promise((resolve) => setTimeout(resolve, settings.flashDuration))
      setActiveColor(null)
    }
    setPhase("inputting")
  }

  useEffect(() => {
    if (phase === "waiting" && !gameOver) {
      const seq = generateSequence()
      setTimeout(() => showSequence(seq), 1000)
    }
  }, [phase, round, gameOver])

  const handleColorClick = (colorId: number) => {
    if (phase !== "inputting" || gameOver) return

    const newInput = [...userInput, colorId]
    setUserInput(newInput)

    // Flash the color
    setActiveColor(colorId)
    setTimeout(() => setActiveColor(null), 200)

    // Check if correct
    if (sequence[newInput.length - 1] !== colorId) {
      // Wrong!
      setPhase("fail")
      const newMisses = misses + 1
      setMisses(newMisses)

      if (newMisses > maxMisses) {
        setGameOver(true)
        setWon(false)
        setTimeout(() => {
          const result: GameResult = { approved: false, misses: newMisses, rounds: round }
          onComplete(result)
        }, 1500)
      } else {
        setTimeout(() => {
          setPhase("waiting")
        }, 1000)
      }
      return
    }

    // Check if sequence complete
    if (newInput.length === sequence.length) {
      setPhase("success")

      if (round >= maxRounds) {
        setGameOver(true)
        setWon(true)
        setTimeout(() => {
          const result: GameResult = { approved: true, misses, rounds: maxRounds }
          onComplete(result)
        }, 1500)
      } else {
        setTimeout(() => {
          setRound((r) => r + 1)
          setPhase("waiting")
        }, 1000)
      }
    }
  }

  // Keyboard support (1-4 keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== "inputting") return
      const key = Number.parseInt(e.key)
      if (key >= 1 && key <= 4) {
        handleColorClick(key - 1)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [phase, userInput, sequence])

  return (
    <div className="space-y-6">
      {!gameOver ? (
        <>
          <div className="space-y-2 text-center">
            <p className="text-lg font-medium text-foreground">
              Round {round}/{maxRounds} • Memorize and repeat the sequence
            </p>
            <p className="text-sm text-muted-foreground">
              Misses: {misses}/{maxMisses} • Length: {sequence.length}
            </p>
          </div>

          <div className="space-y-4">
            {/* Status */}
            <div className="text-center">
              {phase === "showing" && <p className="text-sm font-medium text-primary">Watch carefully...</p>}
              {phase === "inputting" && (
                <p className="text-sm font-medium text-green-500">Your turn! Click the sequence</p>
              )}
              {phase === "success" && <p className="text-sm font-medium text-green-500">Correct!</p>}
              {phase === "fail" && <p className="text-sm font-medium text-destructive">Wrong!</p>}
            </div>

            {/* Color pads */}
            <div className="grid grid-cols-2 gap-4">
              {COLORS.map((color) => (
                <button
                  key={color.id}
                  onClick={() => handleColorClick(color.id)}
                  disabled={phase !== "inputting"}
                  className={`h-24 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                    activeColor === color.id ? color.active : color.bg
                  } ${phase === "inputting" ? "hover:opacity-80 cursor-pointer" : "cursor-not-allowed opacity-50"}`}
                  aria-label={`${color.name} pad (Press ${color.id + 1})`}
                >
                  <span className="sr-only">{color.name}</span>
                </button>
              ))}
            </div>

            <p className="text-center text-xs text-muted-foreground">Keyboard: Press 1-4 to select colors</p>
          </div>
        </>
      ) : (
        <div className="py-8 text-center">
          <p className="text-3xl font-bold text-foreground">{won ? "✓ Challenge Won!" : "✗ Challenge Failed"}</p>
          <p className="mt-2 text-muted-foreground">{won ? "Policy will be approved" : "Policy will be rejected"}</p>
        </div>
      )}
    </div>
  )
}
