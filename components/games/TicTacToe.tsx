"use client"

import { useState, useEffect } from "react"
import type { MiniGameProps, GameResult } from "@/lib/games/types"

type Cell = "X" | "O" | null
type Board = Cell[]

const WINNING_COMBOS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

const AI_TAUNTS = [
  "Oh, a bold move, Mr. President—but not bold enough.",
  "Interesting strategy. Did you learn that from your cabinet?",
  "I've seen better tactics from a rubber stamp.",
  "Predictable. Just like your approval ratings.",
  "That's... certainly a choice, sir.",
  "Bold. Historically terrible, but bold.",
]

const AI_WIN_COMMENTS = [
  "Perhaps stick to politics, sir. Oh wait...",
  "Better luck with your next policy decision.",
  "I'll add this to your list of strategic failures.",
  "The media will love this one.",
]

const PLAYER_WIN_COMMENTS = [
  "Impressive, sir. Don't let it go to your head.",
  "A rare victory. Savor it while it lasts.",
  "Well played. The public might actually approve.",
  "Finally, a decision that worked out.",
]

type GamePhase = "ready" | "playing" | "gameover"

export function TicTacToe({ difficulty, onComplete }: MiniGameProps) {
  const [phase, setPhase] = useState<GamePhase>("ready")
  const [board, setBoard] = useState<Board>(Array(9).fill(null))
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [winner, setWinner] = useState<"player" | "ai" | "draw" | null>(null)
  const [aiComment, setAiComment] = useState("")
  const [finalComment, setFinalComment] = useState("")

  const checkWinner = (currentBoard: Board): "X" | "O" | "draw" | null => {
    for (const combo of WINNING_COMBOS) {
      const [a, b, c] = combo
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return currentBoard[a]
      }
    }
    if (currentBoard.every((cell) => cell !== null)) {
      return "draw"
    }
    return null
  }

  const getAIMove = (currentBoard: Board): number => {
    const aiDifficulty = difficulty === "easy" ? 0.3 : difficulty === "medium" ? 0.6 : 0.9

    // Smart AI move with difficulty-based randomness
    if (Math.random() > aiDifficulty) {
      // Random move
      const available = currentBoard.map((cell, i) => (cell === null ? i : -1)).filter((i) => i !== -1)
      return available[Math.floor(Math.random() * available.length)]
    }

    // Try to win
    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] === null) {
        const testBoard = [...currentBoard]
        testBoard[i] = "O"
        if (checkWinner(testBoard) === "O") return i
      }
    }

    // Block player win
    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] === null) {
        const testBoard = [...currentBoard]
        testBoard[i] = "X"
        if (checkWinner(testBoard) === "X") return i
      }
    }

    // Take center
    if (currentBoard[4] === null) return 4

    // Take corners
    const corners = [0, 2, 6, 8]
    const availableCorners = corners.filter((i) => currentBoard[i] === null)
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)]
    }

    // Take any available
    const available = currentBoard.map((cell, i) => (cell === null ? i : -1)).filter((i) => i !== -1)
    return available[Math.floor(Math.random() * available.length)]
  }

  const handleCellClick = (index: number) => {
    if (phase !== "playing" || !isPlayerTurn || board[index] !== null || winner) return

    const newBoard = [...board]
    newBoard[index] = "X"
    setBoard(newBoard)

    const result = checkWinner(newBoard)
    if (result) {
      handleGameEnd(result, newBoard)
      return
    }

    setIsPlayerTurn(false)
    setAiComment(AI_TAUNTS[Math.floor(Math.random() * AI_TAUNTS.length)])
  }

  const handleGameEnd = (result: "X" | "O" | "draw", finalBoard: Board) => {
    let gameWinner: "player" | "ai" | "draw"
    let comment: string

    if (result === "X") {
      gameWinner = "player"
      comment = PLAYER_WIN_COMMENTS[Math.floor(Math.random() * PLAYER_WIN_COMMENTS.length)]
    } else if (result === "O") {
      gameWinner = "ai"
      comment = AI_WIN_COMMENTS[Math.floor(Math.random() * AI_WIN_COMMENTS.length)]
    } else {
      gameWinner = "draw"
      comment = "A draw. How... diplomatic of you, sir."
    }

    setWinner(gameWinner)
    setFinalComment(comment)
    setPhase("gameover")

    setTimeout(() => {
      const gameResult: GameResult = {
        approved: gameWinner === "player",
        misses: gameWinner === "ai" ? 1 : 0,
        rounds: 1,
      }
      onComplete(gameResult)
    }, 3000)
  }

  useEffect(() => {
    if (phase === "playing" && !isPlayerTurn && !winner) {
      const timer = setTimeout(() => {
        const aiMove = getAIMove(board)
        const newBoard = [...board]
        newBoard[aiMove] = "O"
        setBoard(newBoard)

        const result = checkWinner(newBoard)
        if (result) {
          handleGameEnd(result, newBoard)
        } else {
          setIsPlayerTurn(true)
          setAiComment("")
        }
      }, 800)

      return () => clearTimeout(timer)
    }
  }, [isPlayerTurn, phase, board, winner])

  const handleStart = () => {
    setPhase("playing")
    setBoard(Array(9).fill(null))
    setIsPlayerTurn(true)
    setWinner(null)
    setAiComment("")
    setFinalComment("")
  }

  return (
    <div className="space-y-4">
      {phase === "ready" && (
        <div className="space-y-4 text-center">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-foreground">Strategic Challenge</h3>
            <p className="text-sm text-muted-foreground">Face off against your AI Secretary in a battle of wits.</p>
            <p className="text-xs text-muted-foreground">Win to approve the policy. Lose and it's rejected.</p>
          </div>
          <button
            onClick={handleStart}
            className="rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Begin Challenge
          </button>
        </div>
      )}

      {phase === "playing" && (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{isPlayerTurn ? "Your turn (X)" : "Secretary's turn (O)"}</p>
            {aiComment && (
              <p className="text-xs text-blue-300 italic mt-2 min-h-[2rem] animate-in fade-in duration-300">
                "{aiComment}"
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
            {board.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={!isPlayerTurn || cell !== null}
                className={`aspect-square rounded-lg border-2 text-4xl font-bold transition-all ${
                  cell === null
                    ? "border-slate-600 bg-slate-800 hover:bg-slate-700 hover:border-blue-500"
                    : cell === "X"
                      ? "border-blue-500 bg-blue-900/30 text-blue-400"
                      : "border-red-500 bg-red-900/30 text-red-400"
                } ${!isPlayerTurn || cell !== null ? "cursor-not-allowed" : "cursor-pointer"}`}
              >
                {cell}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === "gameover" && (
        <div className="space-y-4 text-center py-8">
          <div className="space-y-2">
            <p className="text-3xl font-bold text-foreground">
              {winner === "player" ? "✓ Victory!" : winner === "ai" ? "✗ Defeated" : "⊘ Draw"}
            </p>
            <p className="text-sm text-muted-foreground">
              {winner === "player" ? "Policy will be approved" : "Policy will be rejected"}
            </p>
          </div>
          <div className="rounded-lg bg-slate-800/50 p-4 border border-slate-700">
            <p className="text-sm font-medium text-blue-300 mb-2">Secretary's Assessment:</p>
            <p className="text-sm text-slate-300 italic">"{finalComment}"</p>
          </div>
          {winner === "player" && <div className="text-sm text-green-400 animate-pulse">Public Confidence +5%</div>}
          {winner === "ai" && <div className="text-sm text-red-400 animate-pulse">Media mocks your strategy</div>}
        </div>
      )}
    </div>
  )
}
