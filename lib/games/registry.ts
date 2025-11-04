import type { MiniGameDef, Difficulty } from "./types"
import { PrecisionSlider } from "@/components/games/PrecisionSlider"
import { TargetClicker } from "@/components/games/TargetClicker"
import { MemorySequence } from "@/components/games/MemorySequence"

export const GAME_REGISTRY: MiniGameDef[] = [
  {
    id: "precision",
    label: "Precision Slider",
    Component: PrecisionSlider,
    defaults: {
      easy: { targetSize: 20, speedMultiplier: 1.0, jitter: 0 },
      medium: { targetSize: 15, speedMultiplier: 1.3, jitter: 1 },
      hard: { targetSize: 10, speedMultiplier: 1.6, jitter: 2 },
    },
  },
  {
    id: "target-click",
    label: "Target Clicker",
    Component: TargetClicker,
    defaults: {
      easy: { timeWindow: 3000, shrinkRate: 200 },
      medium: { timeWindow: 2500, shrinkRate: 300 },
      hard: { timeWindow: 2000, shrinkRate: 400 },
    },
  },
  {
    id: "memory-sequence",
    label: "Memory Sequence",
    Component: MemorySequence,
    defaults: {
      easy: { startLength: 3, flashDuration: 800 },
      medium: { startLength: 3, flashDuration: 600 },
      hard: { startLength: 4, flashDuration: 500 },
    },
  },
]

export function pickGameForPolicy(policyId: string, difficulty: Difficulty): MiniGameDef {
  // Simple random selection with seeded randomness based on policy ID
  const seed = policyId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const randomIndex = (seed + Date.now()) % GAME_REGISTRY.length
  return GAME_REGISTRY[randomIndex]
}

export function getGameById(id: string): MiniGameDef | undefined {
  return GAME_REGISTRY.find((game) => game.id === id)
}
