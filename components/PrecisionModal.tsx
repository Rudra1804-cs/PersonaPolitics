"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface PrecisionModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (won: boolean) => void
  difficulty: "EASY" | "MEDIUM" | "HARD"
}

export function PrecisionModal({ isOpen, onClose, onComplete, difficulty }: PrecisionModalProps) {
  const [round, setRound] = useState(1)
  const [misses, setMisses] = useState(0)
  const [markerPosition, setMarkerPosition] = useState(50)
  const [isMoving, setIsMoving] = useState(true)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)

  const directionRef = useRef(1)
  const animationRef = useRef<number>()
  const trackRef = useRef<HTMLDivElement>(null)

  const maxRounds = 2
  const maxMisses = 2

  // Difficulty settings
  const getSettings = () => {
    const baseSpeed = 0.8
    const roundMultiplier = 1 + (round - 1) * 0.2

    switch (difficulty) {
      case "EASY":
        return { targetSize: 20, speed: baseSpeed * roundMultiplier, jitter: 0 }
      case "MEDIUM":
        return { targetSize: 15, speed: baseSpeed * 1.3 * roundMultiplier, jitter: 1 }
      case "HARD":
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

      // Add jitter for hard difficulty
      if (settings.jitter > 0) {
        next += (Math.random() - 0.5) * settings.jitter
      }

      // Bounce at edges
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
    if (isOpen && isMoving && !gameOver) {
      animationRef.current = requestAnimationFrame(animate)
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isOpen, isMoving, gameOver, animate])

  const handleStop = () => {
    if (!isMoving || gameOver) return

    setIsMoving(false)

    // Check if marker is within target
    const hit = markerPosition >= targetStart && markerPosition <= targetEnd

    if (hit) {
      // Round won
      if (round >= maxRounds) {
        // Game won!
        setGameOver(true)
        setWon(true)
        setTimeout(() => {
          onComplete(true)
          handleReset()
        }, 1500)
      } else {
        // Next round
        setTimeout(() => {
          setRound((r) => r + 1)
          setMarkerPosition(50)
          setIsMoving(true)
        }, 800)
      }
    } else {
      // Miss
      const newMisses = misses + 1
      setMisses(newMisses)

      if (newMisses > maxMisses) {
        // Game lost
        setGameOver(true)
        setWon(false)
        setTimeout(() => {
          onComplete(false)
          handleReset()
        }, 1500)
      } else {
        // Continue
        setTimeout(() => {
          setMarkerPosition(50)
          setIsMoving(true)
        }, 800)
      }
    }
  }

  const handleReset = () => {
    setRound(1)
    setMisses(0)
    setMarkerPosition(50)
    setIsMoving(true)
    setGameOver(false)
    setWon(false)
    onClose()
  }

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !gameOver) {
        setMisses((m) => m + 1)
        onClose()
        handleReset()
      }
    },
    [gameOver, onClose],
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, handleEscape])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-2xl rounded-xl bg-card p-6 shadow-2xl">
        <button
          onClick={() => {
            if (!gameOver) setMisses((m) => m + 1)
            handleReset()
          }}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold text-foreground">Precision Slider — Win to Approve</h2>
            <p className="text-sm text-muted-foreground">
              Difficulty: <span className="font-bold text-destructive">{difficulty}</span>
            </p>
          </div>

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
                <div ref={trackRef} className="relative h-16 w-full rounded-lg bg-muted">
                  {/* Target window */}
                  <div
                    className="absolute top-0 h-full bg-green-500/30 border-2 border-green-500"
                    style={{
                      left: `${targetStart}%`,
                      width: `${settings.targetSize}%`,
                    }}
                  />

                  {/* Moving marker */}
                  <div
                    className="absolute top-1/2 h-12 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-lg transition-none"
                    style={{
                      left: `${markerPosition}%`,
                    }}
                  />
                </div>

                <Button onClick={handleStop} disabled={!isMoving} size="lg" className="w-full text-lg font-bold">
                  STOP
                </Button>
              </div>
            </>
          ) : (
            <div className="py-8 text-center">
              <p className="text-3xl font-bold text-foreground">{won ? "✓ Challenge Won!" : "✗ Challenge Failed"}</p>
              <p className="mt-2 text-muted-foreground">
                {won ? "Policy will be approved" : "Policy will be rejected"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
