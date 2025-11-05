"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BusinessOpinionPanel } from "@/components/BusinessOpinionPanel"
import { useGameStore } from "@/lib/state"
import { motion, AnimatePresence } from "framer-motion"

interface PolicyCardProps {
  id: string
  title: string
  description: string
  difficulty: string
  type?: "economic" | "defense" | "social" | "diplomatic" | "education" | "security" | "environment" | "technology"
  onApprove: () => void
  onReject: () => void
}

const CATEGORY_CONFIG = {
  economic: { icon: "🪙", label: "Economy", color: "text-amber-400", bg: "bg-amber-500/10" },
  defense: { icon: "🪖", label: "Defense", color: "text-red-400", bg: "bg-red-500/10" },
  education: { icon: "🎓", label: "Education", color: "text-blue-400", bg: "bg-blue-500/10" },
  social: { icon: "🏥", label: "Social", color: "text-green-400", bg: "bg-green-500/10" },
  security: { icon: "🔒", label: "Security", color: "text-purple-400", bg: "bg-purple-500/10" },
  diplomatic: { icon: "🌍", label: "International", color: "text-cyan-400", bg: "bg-cyan-500/10" },
  environment: { icon: "🌱", label: "Environment", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  technology: { icon: "⚙️", label: "Technology", color: "text-indigo-400", bg: "bg-indigo-500/10" },
}

export function PolicyCard({ id, title, description, difficulty, type, onApprove, onReject }: PolicyCardProps) {
  const termOver = useGameStore((state) => state.termOver)
  const setHoveredPolicy = useGameStore((state) => state.setHoveredPolicy)
  const cardExiting = useGameStore((state) => state.cardExiting)
  const isExiting = cardExiting === id

  const categoryConfig = type ? CATEGORY_CONFIG[type] : null

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
    <AnimatePresence mode="wait">
      <motion.div
        key={id}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="h-full"
      >
        <Card
          className={`flex h-full flex-col transition-all duration-300 ${isExiting ? "opacity-50 scale-95" : ""} ${categoryConfig ? `border-l-4 ${categoryConfig.bg}` : ""}`}
          style={categoryConfig ? { borderLeftColor: `var(--${type}-color, currentColor)` } : undefined}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onFocus={handleFocus}
          onBlur={handleBlur}
          tabIndex={0}
        >
          <CardHeader>
            {categoryConfig && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{categoryConfig.icon}</span>
                <span className={`text-xs font-semibold uppercase tracking-wide ${categoryConfig.color}`}>
                  {categoryConfig.label}
                </span>
              </div>
            )}
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
              <Button onClick={handleApprove} className="flex-1" variant="default" disabled={termOver || isExiting}>
                Approve
              </Button>
              <Button
                onClick={handleReject}
                className="flex-1 bg-transparent"
                variant="outline"
                disabled={termOver || isExiting}
              >
                Reject
              </Button>
            </div>
            <BusinessOpinionPanel policyId={id} difficulty={difficulty.toLowerCase() as "easy" | "medium" | "hard"} />
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
