import type React from "react"
export type Difficulty = "easy" | "medium" | "hard"

export interface GameResult {
  approved: boolean
  misses: number
  rounds: number
}

export interface MiniGameProps {
  difficulty: Difficulty
  onComplete: (result: GameResult) => void
}

export interface MiniGameDef {
  id: "precision" | "target-click" | "space-shooter" | "tic-tac-toe" | "fruit-slicer"
  label: string
  Component: React.FC<MiniGameProps>
  defaults?: Record<Difficulty, Record<string, number>>
}
