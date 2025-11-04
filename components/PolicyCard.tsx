"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useGameStore } from "@/lib/state"

interface PolicyCardProps {
  id: string
  title: string
  description: string
  difficulty: string
  onApprove: () => void
  onReject: () => void
}

export function PolicyCard({ id, title, description, difficulty, onApprove, onReject }: PolicyCardProps) {
  const termOver = useGameStore((state) => state.termOver)
  const setHoveredPolicy = useGameStore((state) => state.setHoveredPolicy)

  const handleApprove = () => {
    if (termOver) return
    onApprove()
  }

  const handleReject = () => {
    if (termOver) return
    onReject()
  }

  const handleMouseEnter = () => {
    setHoveredPolicy({
      id,
      title,
      difficulty: difficulty.toLowerCase() as "easy" | "medium" | "hard",
    })
  }

  const handleMouseLeave = () => {
    setHoveredPolicy(null)
  }

  const handleFocus = () => {
    setHoveredPolicy({
      id,
      title,
      difficulty: difficulty.toLowerCase() as "easy" | "medium" | "hard",
    })
  }

  const handleBlur = () => {
    setHoveredPolicy(null)
  }

  return (
    <Card
      className="flex h-full flex-col"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      tabIndex={0}
    >
      <CardHeader>
        <CardTitle className="text-balance">{title}</CardTitle>
        <CardDescription className="text-pretty">{description}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium">Challenge Required</span>
          <span>•</span>
          <span>
            Difficulty: <span className="font-bold text-destructive">{difficulty}</span>
          </span>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleApprove} className="flex-1" variant="default" disabled={termOver}>
            Approve
          </Button>
          <Button onClick={handleReject} className="flex-1 bg-transparent" variant="outline" disabled={termOver}>
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
