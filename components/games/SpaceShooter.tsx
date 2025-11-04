"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import type { MiniGameProps, GameResult } from "@/lib/games/types"

interface Rocket {
  x: number
  y: number
  width: number
  height: number
}

interface UFO {
  id: number
  x: number
  y: number
  width: number
  height: number
  speed: number
}

interface Projectile {
  id: number
  x: number
  y: number
  width: number
  height: number
  speed: number
}

interface Explosion {
  id: number
  x: number
  y: number
  frame: number
}

type GamePhase = "ready" | "playing" | "gameover"

export function SpaceShooter({ difficulty, onComplete }: MiniGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [phase, setPhase] = useState<GamePhase>("ready")
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [wave, setWave] = useState(1)
  const [secretaryComment, setSecretaryComment] = useState("")

  // Game state refs (not reactive)
  const rocketRef = useRef<Rocket>({ x: 220, y: 560, width: 40, height: 40 })
  const ufosRef = useRef<UFO[]>([])
  const projectilesRef = useRef<Projectile[]>([])
  const explosionsRef = useRef<Explosion[]>([])
  const keysRef = useRef<Set<string>>(new Set())
  const nextUFOIdRef = useRef(0)
  const nextProjectileIdRef = useRef(0)
  const nextExplosionIdRef = useRef(0)
  const lastSpawnRef = useRef(0)
  const waveRef = useRef(1)
  const scoreRef = useRef(0)
  const livesRef = useRef(3)
  const mouseXRef = useRef(220)

  const CANVAS_WIDTH = 480
  const CANVAS_HEIGHT = 640
  const ROCKET_SPEED = 6
  const PROJECTILE_SPEED = 10
  const BASE_UFO_SPEED = 2
  const BASE_SPAWN_INTERVAL = 1500

  const getSettings = () => {
    switch (difficulty) {
      case "easy":
        return { speedMultiplier: 0.8, spawnMultiplier: 1.2, targetScore: 50 }
      case "medium":
        return { speedMultiplier: 1.0, spawnMultiplier: 1.0, targetScore: 50 }
      case "hard":
        return { speedMultiplier: 1.3, spawnMultiplier: 0.8, targetScore: 50 }
      default:
        return { speedMultiplier: 1.0, spawnMultiplier: 1.0, targetScore: 50 }
    }
  }

  const settings = getSettings()

  const getSecretaryComment = (finalScore: number) => {
    if (finalScore < 50) {
      return "Astounding, sir — you've managed to lose both in space and politics."
    } else if (finalScore < 150) {
      return "Not bad. At least the UFOs fear you more than your cabinet does."
    } else if (finalScore < 300) {
      return "A galactic triumph! Maybe you should campaign in space next."
    } else {
      return "Impressive accuracy, Commander-in-Chief. Perhaps we'll rename the army after you — assuming there's still one left."
    }
  }

  const spawnUFO = () => {
    const ufo: UFO = {
      id: nextUFOIdRef.current++,
      x: Math.random() * (CANVAS_WIDTH - 40),
      y: -40,
      width: 40,
      height: 30,
      speed: (BASE_UFO_SPEED + waveRef.current * 0.3) * settings.speedMultiplier,
    }
    ufosRef.current.push(ufo)
  }

  const shootProjectile = () => {
    const rocket = rocketRef.current
    const projectile: Projectile = {
      id: nextProjectileIdRef.current++,
      x: rocket.x + rocket.width / 2 - 2,
      y: rocket.y,
      width: 4,
      height: 12,
      speed: PROJECTILE_SPEED,
    }
    projectilesRef.current.push(projectile)
  }

  const createExplosion = (x: number, y: number) => {
    const explosion: Explosion = {
      id: nextExplosionIdRef.current++,
      x,
      y,
      frame: 0,
    }
    explosionsRef.current.push(explosion)
  }

  const checkCollision = (
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number },
  ) => {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
  }

  const drawPixelRocket = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Simple pixel rocket (cyan)
    ctx.fillStyle = "#00ffff"
    ctx.fillRect(x + 15, y, 10, 10) // nose
    ctx.fillRect(x + 10, y + 10, 20, 15) // body
    ctx.fillRect(x + 5, y + 25, 10, 10) // left wing
    ctx.fillRect(x + 25, y + 25, 10, 10) // right wing
    ctx.fillRect(x + 15, y + 35, 10, 5) // thruster
  }

  const drawPixelUFO = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Simple pixel UFO (magenta)
    ctx.fillStyle = "#ff00ff"
    ctx.fillRect(x + 10, y, 20, 5) // top
    ctx.fillRect(x + 5, y + 5, 30, 10) // body
    ctx.fillRect(x, y + 15, 40, 5) // bottom
    ctx.fillRect(x + 15, y + 20, 10, 5) // beam
  }

  const drawProjectile = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = "#00ff00"
    ctx.fillRect(x, y, 4, 12)
  }

  const drawExplosion = (ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) => {
    const colors = ["#ff0000", "#ff8800", "#ffff00", "#ffffff"]
    const color = colors[Math.min(frame, colors.length - 1)]
    ctx.fillStyle = color
    const size = 8 + frame * 4
    ctx.fillRect(x - size / 2, y - size / 2, size, size)
  }

  const drawStarfield = (ctx: CanvasRenderingContext2D, offset: number) => {
    ctx.fillStyle = "#ffffff"
    for (let i = 0; i < 50; i++) {
      const x = (i * 37) % CANVAS_WIDTH
      const y = (i * 73 + offset) % CANVAS_HEIGHT
      const size = (i % 3) + 1
      ctx.fillRect(x, y, size, size)
    }
  }

  const gameLoop = (timestamp: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = "#0a0a1a"
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw starfield
    drawStarfield(ctx, timestamp / 50)

    // Update rocket position
    const rocket = rocketRef.current
    if (keysRef.current.has("ArrowLeft") || keysRef.current.has("a")) {
      rocket.x = Math.max(0, rocket.x - ROCKET_SPEED)
    }
    if (keysRef.current.has("ArrowRight") || keysRef.current.has("d")) {
      rocket.x = Math.min(CANVAS_WIDTH - rocket.width, rocket.x + ROCKET_SPEED)
    }

    // Mouse control
    if (mouseXRef.current !== null) {
      rocket.x = Math.max(0, Math.min(CANVAS_WIDTH - rocket.width, mouseXRef.current - rocket.width / 2))
    }

    // Spawn UFOs
    const spawnInterval = (BASE_SPAWN_INTERVAL / waveRef.current) * settings.spawnMultiplier
    if (timestamp - lastSpawnRef.current > spawnInterval) {
      spawnUFO()
      lastSpawnRef.current = timestamp
    }

    // Update UFOs
    ufosRef.current = ufosRef.current.filter((ufo) => {
      ufo.y += ufo.speed

      // Check if UFO passed bottom (miss)
      if (ufo.y > CANVAS_HEIGHT) {
        livesRef.current = Math.max(0, livesRef.current - 1)
        setLives(livesRef.current)
        if (livesRef.current === 0) {
          setPhase("gameover")
          const comment = getSecretaryComment(scoreRef.current)
          setSecretaryComment(comment)
          setTimeout(() => {
            const result: GameResult = {
              approved: scoreRef.current >= settings.targetScore,
              misses: 3,
              rounds: waveRef.current,
            }
            onComplete(result)
          }, 3000)
        }
        return false
      }

      return true
    })

    // Update projectiles
    projectilesRef.current = projectilesRef.current.filter((proj) => {
      proj.y -= proj.speed
      return proj.y > -proj.height
    })

    // Check collisions
    for (let i = projectilesRef.current.length - 1; i >= 0; i--) {
      const proj = projectilesRef.current[i]
      for (let j = ufosRef.current.length - 1; j >= 0; j--) {
        const ufo = ufosRef.current[j]
        if (checkCollision(proj, ufo)) {
          // Hit!
          createExplosion(ufo.x + ufo.width / 2, ufo.y + ufo.height / 2)
          projectilesRef.current.splice(i, 1)
          ufosRef.current.splice(j, 1)
          scoreRef.current += 10
          setScore(scoreRef.current)

          if (scoreRef.current >= 50) {
            setPhase("gameover")
            const comment = getSecretaryComment(scoreRef.current)
            setSecretaryComment(comment)
            setTimeout(() => {
              const result: GameResult = {
                approved: true,
                misses: 3 - livesRef.current,
                rounds: waveRef.current,
              }
              onComplete(result)
            }, 3000)
            break
          }

          break
        }
      }
    }

    // Update explosions
    explosionsRef.current = explosionsRef.current.filter((exp) => {
      exp.frame += 1
      return exp.frame < 8
    })

    // Draw everything
    drawPixelRocket(ctx, rocket.x, rocket.y)

    ufosRef.current.forEach((ufo) => {
      drawPixelUFO(ctx, ufo.x, ufo.y)
    })

    projectilesRef.current.forEach((proj) => {
      drawProjectile(ctx, proj.x, proj.y)
    })

    explosionsRef.current.forEach((exp) => {
      drawExplosion(ctx, exp.x, exp.y, exp.frame)
    })

    // Draw HUD
    ctx.fillStyle = "#ffffff"
    ctx.font = "16px monospace"
    ctx.fillText(`Score: ${scoreRef.current}`, 10, 25)
    ctx.fillText(`Lives: ${livesRef.current}`, 10, 50)
    ctx.fillText(`Wave: ${waveRef.current}`, 10, 75)
  }

  useEffect(() => {
    if (phase !== "playing") return

    let animationId: number

    const animate = (timestamp: number) => {
      gameLoop(timestamp)
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [phase])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== "playing") return
      keysRef.current.add(e.key.toLowerCase())

      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault()
        shootProjectile()
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase())
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [phase])

  const handleCanvasClick = () => {
    if (phase === "playing") {
      shootProjectile()
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (phase !== "playing") return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    mouseXRef.current = e.clientX - rect.left
  }

  const handleStart = () => {
    setPhase("playing")
    setScore(0)
    setLives(3)
    setWave(1)
    scoreRef.current = 0
    livesRef.current = 3
    waveRef.current = 1
    ufosRef.current = []
    projectilesRef.current = []
    explosionsRef.current = []
    lastSpawnRef.current = 0
  }

  return (
    <div className="space-y-4">
      {phase === "ready" && (
        <div className="space-y-4 text-center">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-foreground">Space Defense Protocol</h3>
            <p className="text-sm text-muted-foreground">UFOs are invading! Defend the nation by shooting them down.</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>Controls: Arrow Keys or A/D to move, Space or Click to shoot</p>
              <p>Target Score: {settings.targetScore} points to approve policy</p>
              <p>You have 3 lives. Don't let UFOs pass!</p>
            </div>
          </div>
          <button
            onClick={handleStart}
            className="rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Launch Defense
          </button>
        </div>
      )}

      {phase === "playing" && (
        <div className="flex flex-col items-center space-y-2">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            className="border-2 border-primary rounded-lg cursor-crosshair"
            aria-label="Space shooter game canvas"
          />
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>Score: {score}</span>
            <span>Lives: {lives}</span>
            <span>Wave: {wave}</span>
            <span>Target: {settings.targetScore}</span>
          </div>
        </div>
      )}

      {phase === "gameover" && (
        <div className="space-y-4 text-center py-8">
          <div className="space-y-2">
            <p className="text-3xl font-bold text-foreground">
              {score >= settings.targetScore ? "✓ Mission Success!" : "✗ Mission Failed"}
            </p>
            <p className="text-xl text-muted-foreground">Final Score: {score}</p>
            <p className="text-sm text-muted-foreground">
              {score >= settings.targetScore ? "Policy will be approved" : "Policy will be rejected"}
            </p>
          </div>
          <div className="rounded-lg bg-slate-800/50 p-4 border border-slate-700">
            <p className="text-sm font-medium text-blue-300 mb-2">Secretary's Assessment:</p>
            <p className="text-sm text-slate-300 italic">{secretaryComment}</p>
          </div>
        </div>
      )}
    </div>
  )
}
