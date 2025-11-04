"use client"

import { useState } from "react"
import { PolicyCard } from "@/components/PolicyCard"
import { StatsBar } from "@/components/StatsBar"
import { GameModal } from "@/components/GameModal"
import { ToastContainer, showToast } from "@/components/Toast"
import { GameOverlay } from "@/components/GameOverlay"
import { EndOfTermModal } from "@/components/EndOfTermModal"
import { WorldEventsFeed } from "@/components/WorldEventsFeed"
import { SecretaryBubble } from "@/components/SecretaryBubble"
import { StatToasts } from "@/components/StatToasts"
import { WorldMapBackdrop } from "@/components/WorldMapBackdrop"
import { CabinetMeter } from "@/components/CabinetMeter"
import { AmbienceGauges } from "@/components/AmbienceGauges"
import { EconomySnapshot } from "@/components/EconomySnapshot"
import { ForeignOpinionsStrip } from "@/components/ForeignOpinionsStrip"
import { useGameStore } from "@/lib/state"
import { useTermTimer } from "@/hooks/useTermTimer"
import { pickGameForPolicy } from "@/lib/games/registry"
import { generateWorldEvent } from "@/lib/worldEvents"
import { pickSecretaryRemark } from "@/lib/secretaryRemarks"
import { realizedImpactFrom } from "@/lib/econHeuristics"
import { realizedGeoImpact } from "@/lib/geoHeuristics"
import { playEventSound } from "@/lib/audio"
import type { MiniGameDef, Difficulty, GameResult } from "@/lib/games/types"
import type { PolicyResolveResponse } from "@/lib/schema"

const POLICIES = [
  {
    id: "infrastructure",
    title: "Infrastructure Deal",
    description: "A massive $2 trillion investment in roads, bridges, and public transit.",
    difficulty: "hard" as Difficulty,
  },
  {
    id: "military",
    title: "Military Spending",
    description: "Increase defense budget by 15% to modernize armed forces.",
    difficulty: "hard" as Difficulty,
  },
  {
    id: "justice",
    title: "Criminal Justice Reform",
    description: "Comprehensive reform including sentencing guidelines and police accountability.",
    difficulty: "hard" as Difficulty,
  },
]

export default function Home() {
  const {
    stats,
    isGameOver,
    gameResult,
    updateStats,
    resetGame,
    termSecondsLeft,
    termSecondsTotal,
    termStarted,
    termOver,
    startTerm,
    addPolicyLog,
    policyLog,
    addWorldEvent,
    secretary,
    pushStatToast,
    applyEconomyDelta,
    applyForeignDelta,
    recomputeBlocStance,
  } = useGameStore()

  useTermTimer()

  const [modalOpen, setModalOpen] = useState(false)
  const [currentPolicy, setCurrentPolicy] = useState<{ id: string; title: string } | null>(null)
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>("hard")
  const [selectedGame, setSelectedGame] = useState<MiniGameDef | null>(null)

  const worldEvents = useGameStore((state) => state.worldEvents)
  const highUrgencyCount = worldEvents.filter((e) => e.urgency === "high").length
  const shouldDimBackground = highUrgencyCount >= 3

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handlePolicyClick = (policyId: string, policyTitle: string, difficulty: Difficulty) => {
    if (termOver) {
      console.log("[v0] Cannot start policy - term is over")
      return
    }

    if (!termStarted) {
      startTerm()
    }

    setCurrentPolicy({ id: policyId, title: policyTitle })
    setCurrentDifficulty(difficulty)

    const game = pickGameForPolicy(policyId, difficulty)
    setSelectedGame(game)
    setModalOpen(true)
  }

  const handleGameComplete = async (result: GameResult) => {
    if (termOver) {
      console.log("[v0] Game completed after term ended - ignoring")
      setModalOpen(false)
      return
    }

    setModalOpen(false)

    if (!currentPolicy) return

    try {
      const response = await fetch("/api/policy/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          policyId: currentPolicy.id,
          difficulty: currentDifficulty,
          approved: result.approved,
          misses: result.misses,
          rounds: result.rounds,
        }),
      })

      if (!response.ok) {
        throw new Error("API request failed")
      }

      const data: PolicyResolveResponse = await response.json()

      if (useGameStore.getState().termOver) {
        console.log("[v0] Term ended during API call - ignoring result")
        return
      }

      const da = data.approval_change
      const dp = data.power_change
      const ds = data.standing_change
      const deltaTotal = da + dp + ds

      updateStats({
        approval: da,
        power: dp,
        standing: ds,
      })

      pushStatToast({
        a: da !== 0 ? da : undefined,
        p: dp !== 0 ? dp : undefined,
        s: ds !== 0 ? ds : undefined,
      })

      const econDelta = realizedImpactFrom(
        currentPolicy.id,
        currentDifficulty,
        result.approved ? "approve" : "reject",
        result.approved ? "win" : "loss",
      )
      applyEconomyDelta(econDelta)

      const currentPolicyLog = useGameStore.getState().policyLog
      const consecutiveLosses = currentPolicyLog.slice(-2).filter((entry) => entry.result === "loss").length

      const geoContext = {
        consecutiveWins: useGameStore.getState().policyLog.filter((e) => e.result === "win").length,
        consecutiveLosses,
        difficulty: currentDifficulty.toUpperCase() as "EASY" | "MEDIUM" | "HARD",
      }

      const geoImpacts = realizedGeoImpact(
        currentPolicy.id,
        result.approved ? "approve" : "reject",
        result.approved ? "win" : "loss",
        geoContext,
      )

      for (const impact of geoImpacts) {
        applyForeignDelta(impact.bloc, { score: impact.delta, reason: impact.reason })
        recomputeBlocStance(impact.bloc)
      }

      const remark = pickSecretaryRemark(deltaTotal)
      secretary.push(remark)

      addPolicyLog({
        id: currentPolicy.id,
        title: currentPolicy.title,
        decision: result.approved ? "approve" : "reject",
        result: result.approved ? "win" : "loss",
        delta: {
          approval: da,
          power: dp,
          standing: ds,
        },
        time: termSecondsTotal - termSecondsLeft,
      })

      const currentStats = useGameStore.getState().stats
      const updatedPolicyLog = useGameStore.getState().policyLog
      const worldEvent = generateWorldEvent(currentStats, updatedPolicyLog)

      if (worldEvent) {
        addWorldEvent(worldEvent.headline, worldEvent.detail, worldEvent.urgency)
        playEventSound(worldEvent.urgency)
      }

      const statChanges = [
        da !== 0 && `Approval ${da > 0 ? "+" : ""}${da}`,
        dp !== 0 && `Power ${dp > 0 ? "+" : ""}${dp}`,
        ds !== 0 && `Standing ${ds > 0 ? "+" : ""}${ds}`,
      ]
        .filter(Boolean)
        .join(", ")

      showToast({
        title: result.approved ? "Policy Approved" : "Policy Rejected",
        description: statChanges || "No change",
        details: data.advisor_comment,
      })
    } catch (error) {
      console.error("[v0] Failed to process policy:", error)
      showToast({
        title: "Error processing policy",
        description: "Using neutral outcome",
      })
    }
  }

  return (
    <>
      <WorldMapBackdrop />

      <div
        className={`min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-8 transition-all duration-500 ${
          shouldDimBackground ? "brightness-75" : ""
        }`}
      >
        <div className="mx-auto max-w-7xl space-y-8 lg:mr-96">
          <div className="text-center space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-white text-balance">Persona Politics – Local Edition</h1>
            <p className="text-lg text-blue-200 text-pretty">
              You are the President. Make policy choices, win challenges, and manage your stats.
            </p>
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="w-full space-y-4 rounded-xl bg-slate-800/50 p-6 backdrop-blur md:w-80">
              <h2 className="text-xl font-bold text-white">Presidential Stats</h2>
              <StatsBar label="Approval" value={stats.approval} />
              <StatsBar label="Power" value={stats.power} />
              <StatsBar label="Standing" value={stats.standing} />

              <div className="pt-4 border-t border-slate-700/50">
                <AmbienceGauges />
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl bg-slate-800/50 p-4 backdrop-blur">
                <div className="text-center space-y-2">
                  <p className="text-sm text-blue-200">Time Remaining</p>
                  <p
                    className={`text-3xl font-bold ${
                      termSecondsLeft <= 30 ? "text-red-400 animate-pulse" : "text-white"
                    }`}
                  >
                    {formatTime(termSecondsLeft)}
                  </p>
                  {!termStarted && !termOver && <p className="text-xs text-blue-300">Click any policy to start</p>}
                </div>
              </div>

              <div className="hidden md:block">
                <CabinetMeter />
              </div>
            </div>
          </div>

          <div className="md:hidden">
            <CabinetMeter />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {POLICIES.map((policy) => (
              <PolicyCard
                key={policy.id}
                id={policy.id}
                title={policy.title}
                description={policy.description}
                difficulty={policy.difficulty.toUpperCase() as "EASY" | "MEDIUM" | "HARD"}
                onApprove={() => handlePolicyClick(policy.id, policy.title, policy.difficulty)}
                onReject={() => handlePolicyClick(policy.id, policy.title, policy.difficulty)}
              />
            ))}
          </div>

          <EconomySnapshot />

          <ForeignOpinionsStrip />

          <div className="text-center">
            <p className="text-sm text-blue-300">Runs locally using Ollama (Mistral). No external LLMs.</p>
          </div>
        </div>
      </div>

      <SecretaryBubble />
      <StatToasts />
      <WorldEventsFeed />

      {selectedGame && (
        <GameModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          game={selectedGame}
          difficulty={currentDifficulty}
          onComplete={handleGameComplete}
        />
      )}

      {isGameOver && gameResult && <GameOverlay result={gameResult} onReset={resetGame} />}

      <EndOfTermModal />

      <ToastContainer />
    </>
  )
}
