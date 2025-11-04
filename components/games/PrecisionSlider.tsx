"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import type { MiniGameProps, GameResult } from "@/lib/games/types"

export function PrecisionSlider({ difficulty, onComplete }: MiniGameProps) {
  const [round, setRound] = useState(1)
  const [misses, setMisses] = useState(0)
  const [markerPosition, setMarkerPosition] = useState(50)
  const [isMoving, setIsMoving] = useState(true)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)

  const directionRef = useRef(1)
  const animationRef = useRef<number>()

  const maxRounds = 4
  const maxMisses = 2

  // Difficulty settings
  const getSettings = () => {
    const baseSpeed = 0.8
    const roundMultiplier = 1 + (round - 1) * 0.2

    switch (difficulty) {
      case "easy":
        return { targetSize: 20, speed: baseSpeed * roundMultiplier, jitter: 0 }
      case "medium":
        return { targetSize: 15, speed: baseSpeed * 1.3 * roundMultiplier, jitter: 1 }
      case "hard":
        return { targetSize: 12 - round, speed: baseSpeed * 1.6 * roundMultiplier, jitter: 2 }
      default:
        return { targetSize: 15, speed: baseSpeed * roundMultiplier, jitter: 0 }
    }
  }

  const settings = getSettings()
  const targetStart = 50 - settings.targetSize / 2
  const targetEnd = 50 + settings.targetSize / 2

  const animate = useCallback(() => {
    if (!isMoving) return

    setMarkerPosition((prev) => {
      let next = prev + directionRef.current * settings.speed

      if (settings.jitter > 0) {
        next += (Math.random() - 0.5) * settings.jitter
      }

      if (next >= 100) {
        directionRef.current = -1
        next = 100
      } else if (next <= 0) {
        directionRef.current = 1
        next = 0
      }

      return next
    })

    animationRef.current = requestAnimationFrame(animate)
  }, [isMoving, settings.speed, settings.jitter])

  useEffect(() => {
    if (isMoving && !gameOver) {
      animationRef.current = requestAnimationFrame(animate)
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isMoving, gameOver, animate])

  const handleStop = () => {
    if (!isMoving || gameOver) return

    setIsMoving(false)

    const hit = markerPosition >= targetStart && markerPosition <= targetEnd

    if (hit) {
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
          setMarkerPosition(50)
          setIsMoving(true)
        }, 800)
      }
    } else {
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
          setMarkerPosition(50)
          setIsMoving(true)
        }, 800)
      }
    }
  }

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault()
        handleStop()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isMoving, gameOver])

  return (
    <div className="space-y-6">
      {!gameOver ? (
        <>
          <div className="space-y-2 text-center">
            <p className="text-lg font-medium text-foreground">
              Round {round}/{maxRounds} • Stop the marker inside the target
            </p>
            <p className="text-sm text-muted-foreground">
              Misses: {misses}/{maxMisses}
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative h-16 w-full rounded-lg bg-muted">
              <div
                className="absolute top-0 h-full bg-green-500/30 border-2 border-green-500"
                style={{
                  left: `${targetStart}%`,
                  width: `${settings.targetSize}%`,
                }}
              />

              <div
                className="absolute top-1/2 h-12 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-lg transition-none"
                style={{
                  left: `${markerPosition}%`,
                }}
              />
            </div>

            <Button onClick={handleStop} disabled={!isMoving} size="lg" className="w-full text-lg font-bold">
              STOP (Space)
            </Button>
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
