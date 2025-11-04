"use client"

import { useState, useEffect, useRef } from "react"
import type { MiniGameProps, GameResult } from "@/lib/games/types"

export function TargetClicker({ difficulty, onComplete }: MiniGameProps) {
  const [round, setRound] = useState(1)
  const [misses, setMisses] = useState(0)
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 })
  const [timeLeft, setTimeLeft] = useState(3000)
  const [isActive, setIsActive] = useState(true)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)

  const timerRef = useRef<NodeJS.Timeout>()
  const startTimeRef = useRef<number>(Date.now())

  const maxRounds = 4
  const maxMisses = 2

  const getSettings = () => {
    switch (difficulty) {
      case "easy":
        return { timeWindow: 3000, shrinkRate: 200 }
      case "medium":
        return { timeWindow: 2500, shrinkRate: 300 }
      case "hard":
        return { timeWindow: 2000, shrinkRate: 400 }
      default:
        return { timeWindow: 2500, shrinkRate: 300 }
    }
  }

  const settings = getSettings()

  // Generate random position
  const generateTarget = () => {
    setTargetPos({
      x: 10 + Math.random() * 80,
      y: 20 + Math.random() * 60,
    })
    setTimeLeft(settings.timeWindow)
    startTimeRef.current = Date.now()
    setIsActive(true)
  }

  useEffect(() => {
    if (!isActive || gameOver) return

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const remaining = Math.max(0, settings.timeWindow - elapsed)
      setTimeLeft(remaining)

      if (remaining === 0) {
        handleMiss()
      }
    }, 50)

    return () => clearInterval(interval)
  }, [isActive, gameOver, round])

  const handleMiss = () => {
    setIsActive(false)
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
        if (round < maxRounds) {
          generateTarget()
        }
      }, 1000)
    }
  }

  const handleClick = () => {
    if (!isActive || gameOver) return

    setIsActive(false)

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
        generateTarget()
      }, 800)
    }
  }

  useEffect(() => {
    generateTarget()
  }, [])

  const targetSize = Math.max(30, 60 - round * 5)
  const timePercent = (timeLeft / settings.timeWindow) * 100

  return (
    <div className="space-y-6">
      {!gameOver ? (
        <>
          <div className="space-y-2 text-center">
            <p className="text-lg font-medium text-foreground">
              Round {round}/{maxRounds} • Click the target before time runs out!
            </p>
            <p className="text-sm text-muted-foreground">
              Misses: {misses}/{maxMisses}
            </p>
          </div>

          <div className="space-y-4">
            {/* Timer bar */}
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary transition-all duration-100" style={{ width: `${timePercent}%` }} />
            </div>

            {/* Target area */}
            <div className="relative h-64 w-full rounded-lg bg-muted border-2 border-border">
              {isActive && (
                <button
                  onClick={handleClick}
                  className="absolute rounded-full bg-destructive hover:bg-destructive/90 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  style={{
                    left: `${targetPos.x}%`,
                    top: `${targetPos.y}%`,
                    width: `${targetSize}px`,
                    height: `${targetSize}px`,
                    transform: "translate(-50%, -50%)",
                  }}
                  aria-label="Click target"
                >
                  <span className="sr-only">Target</span>
                </button>
              )}
            </div>

            <p className="text-center text-sm text-muted-foreground">Time: {(timeLeft / 1000).toFixed(1)}s</p>
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
