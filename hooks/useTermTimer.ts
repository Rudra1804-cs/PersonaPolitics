"use client"

import { useEffect } from "react"
import { useGameStore } from "@/lib/state"

export function useTermTimer() {
  const { termStarted, termOver, tickTerm } = useGameStore()

  useEffect(() => {
    if (!termStarted || termOver) return

    const interval = setInterval(() => {
      tickTerm()
    }, 1000)

    return () => clearInterval(interval)
  }, [termStarted, termOver, tickTerm])
}
