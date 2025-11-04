import type { BlocKey } from "./state"

type Difficulty = "easy" | "medium" | "hard"
type Decision = "approve" | "reject"
type Result = "win" | "loss"

export interface GeoImpact {
  bloc: BlocKey
  delta: number
  reason: string
}

interface Context {
  consecutiveWins: number
  consecutiveLosses: number
  difficulty: Difficulty
}

// Track consecutive defense approvals for OIC
let consecutiveDefenseApprovals = 0

function addNoise(value: number): number {
  return value + (Math.random() - 0.5) * 2
}

function getDifficultyMultiplier(difficulty: Difficulty): number {
  return difficulty === "hard" ? 1.25 : difficulty === "medium" ? 1.0 : 0.85
}

export function realizedGeoImpact(policyId: string, decision: Decision, result: Result, context: Context): GeoImpact[] {
  const impacts: GeoImpact[] = []
  const diffMult = getDifficultyMultiplier(context.difficulty)

  // Track defense approvals for OIC
  if (policyId === "military" && decision === "approve") {
    consecutiveDefenseApprovals++
  } else if (policyId !== "military") {
    consecutiveDefenseApprovals = 0
  }

  // NATO: likes defense increases, dislikes cuts & justice reforms
  if (policyId === "military") {
    if (decision === "approve") {
      let delta = (4 + Math.random() * 3) * diffMult
      if (result === "loss") delta *= 0.5
      impacts.push({
        bloc: "NATO",
        delta: addNoise(delta),
        reason: "Welcomes stronger defense posture.",
      })
    } else {
      impacts.push({
        bloc: "NATO",
        delta: addNoise(-(4 + Math.random() * 2)),
        reason: "Concerned about defense budget cuts.",
      })
    }
  } else if (policyId === "infrastructure") {
    let delta = 1 + Math.random()
    if (result === "loss") delta *= 0.5
    impacts.push({
      bloc: "NATO",
      delta: addNoise(delta),
      reason: "Neutral on infrastructure spending.",
    })
  } else if (policyId === "justice") {
    impacts.push({
      bloc: "NATO",
      delta: addNoise(-(1 + Math.random() * 2)),
      reason: "Wary of justice reforms.",
    })
  }

  // EU: likes infrastructure and justice reform, cautious on heavy defense
  if (policyId === "infrastructure") {
    if (decision === "approve") {
      let delta = (4 + Math.random() * 2) * diffMult
      if (result === "loss") delta *= 0.5
      impacts.push({
        bloc: "EU",
        delta: addNoise(delta),
        reason: "Applauds infrastructure investment.",
      })
    } else {
      impacts.push({
        bloc: "EU",
        delta: addNoise(-(3 + Math.random() * 2)),
        reason: "Disappointed by infrastructure rejection.",
      })
    }
  } else if (policyId === "justice") {
    if (decision === "approve") {
      let delta = (3 + Math.random() * 2) * diffMult
      if (result === "loss") delta *= 0.5
      impacts.push({
        bloc: "EU",
        delta: addNoise(delta),
        reason: "Applauds social justice reforms.",
      })
    } else {
      impacts.push({
        bloc: "EU",
        delta: addNoise(-(3 + Math.random() * 2)),
        reason: "Regrets rejection of justice reforms.",
      })
    }
  } else if (policyId === "military" && decision === "approve") {
    impacts.push({
      bloc: "EU",
      delta: addNoise(-(1 + Math.random() * 2)),
      reason: "Cautious about military escalation.",
    })
  }

  // BRICS: favors sovereignty/defense and large infrastructure
  if (policyId === "military" || policyId === "infrastructure") {
    if (decision === "approve") {
      let delta = (3 + Math.random() * 3) * diffMult
      if (result === "loss") delta *= 0.5
      impacts.push({
        bloc: "BRICS",
        delta: addNoise(delta),
        reason: policyId === "military" ? "Backs defense sovereignty." : "Backs major infrastructure build-out.",
      })
    } else if (policyId === "infrastructure") {
      impacts.push({
        bloc: "BRICS",
        delta: addNoise(-(3 + Math.random() * 2)),
        reason: "Disappointed by infrastructure rejection.",
      })
    }
  }

  // OIC: leans to justice & social reforms; neutral on defense unless repeatedly increased
  if (policyId === "justice") {
    if (decision === "approve") {
      let delta = (4 + Math.random() * 2) * diffMult
      if (result === "loss") delta *= 0.5
      impacts.push({
        bloc: "OIC",
        delta: addNoise(delta),
        reason: "Supports social justice initiatives.",
      })
    }
  } else if (consecutiveDefenseApprovals >= 2) {
    impacts.push({
      bloc: "OIC",
      delta: addNoise(-(3 + Math.random() * 2)),
      reason: "Concerns over escalating militarization.",
    })
  }

  // SCO: similar to BRICS but more stability-minded (dislikes volatility)
  if (policyId === "military") {
    if (decision === "approve") {
      let delta = (3 + Math.random() * 2) * diffMult
      if (result === "loss") delta *= 0.5
      impacts.push({
        bloc: "SCO",
        delta: addNoise(delta),
        reason: "Appreciates defense commitment.",
      })
    }
  } else if (policyId === "infrastructure") {
    if (decision === "approve") {
      let delta = (2 + Math.random() * 2) * diffMult
      if (result === "loss") delta *= 0.5
      impacts.push({
        bloc: "SCO",
        delta: addNoise(delta),
        reason: "Supports infrastructure development.",
      })
    }
  }

  // SCO dislikes consecutive losses (instability)
  if (context.consecutiveLosses >= 2) {
    impacts.push({
      bloc: "SCO",
      delta: addNoise(-(3 + Math.random() * 3)),
      reason: "Uneasy with recent instability.",
    })
  }

  return impacts
}
