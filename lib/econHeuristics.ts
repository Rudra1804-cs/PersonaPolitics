type Difficulty = "easy" | "medium" | "hard"
type Action = "approve" | "reject"
type Result = "win" | "loss"

interface EconDelta {
  gdp: number
  infl: number
  unemp: number
  market: number
  conf: number
}

// Base policy effects
const POLICY_EFFECTS: Record<string, { approve: EconDelta; reject: EconDelta }> = {
  infrastructure: {
    approve: { gdp: 2.0, market: 1.5, conf: 4.0, unemp: -0.3, infl: 0.2 },
    reject: { gdp: -1.0, market: -1.0, conf: -3.0, unemp: 0, infl: 0 },
  },
  military: {
    approve: { gdp: 1.2, conf: 1.0, market: 0.8, infl: 0.3, unemp: 0 },
    reject: { gdp: 0, conf: -2.0, market: -1.0, infl: 0, unemp: 0 },
  },
  justice: {
    approve: { gdp: 0.5, conf: 2.0, market: 0, infl: 0, unemp: 0 },
    reject: { gdp: 0, conf: -2.0, market: 0, infl: 0, unemp: 0 },
  },
}

// Add small noise for variety
function addNoise(value: number): number {
  return value + (Math.random() - 0.5) * 0.2
}

// Apply difficulty multiplier
function applyDifficulty(delta: EconDelta, difficulty: Difficulty): EconDelta {
  const multiplier = difficulty === "hard" ? 1.25 : difficulty === "medium" ? 1.0 : 0.75
  return {
    gdp: delta.gdp * multiplier,
    infl: delta.infl * multiplier,
    unemp: delta.unemp * multiplier,
    market: delta.market * multiplier,
    conf: delta.conf * multiplier,
  }
}

// Predict policy impact (for preview)
export function predictPolicyImpact(policyId: string, difficulty: Difficulty, action: Action): EconDelta {
  const baseEffect = POLICY_EFFECTS[policyId]?.[action] || {
    gdp: 0,
    infl: 0,
    unemp: 0,
    market: 0,
    conf: 0,
  }

  return applyDifficulty(baseEffect, difficulty)
}

// Realized impact after decision (with result and noise)
export function realizedImpactFrom(
  policyId: string,
  difficulty: Difficulty,
  decision: Action,
  result: Result,
): EconDelta {
  const baseEffect = POLICY_EFFECTS[policyId]?.[decision] || {
    gdp: 0,
    infl: 0,
    unemp: 0,
    market: 0,
    conf: 0,
  }

  let adjusted = applyDifficulty(baseEffect, difficulty)

  // If mini-game was lost, cut positive effects in half, keep negative effects
  if (result === "loss") {
    adjusted = {
      gdp: adjusted.gdp > 0 ? adjusted.gdp * 0.5 : adjusted.gdp,
      infl: adjusted.infl > 0 ? adjusted.infl : adjusted.infl, // Inflation increase is bad, so keep it
      unemp: adjusted.unemp > 0 ? adjusted.unemp : adjusted.unemp * 0.5, // Unemployment increase is bad
      market: adjusted.market > 0 ? adjusted.market * 0.5 : adjusted.market,
      conf: adjusted.conf > 0 ? adjusted.conf * 0.5 : adjusted.conf,
    }
  }

  // Add noise
  return {
    gdp: addNoise(adjusted.gdp),
    infl: addNoise(adjusted.infl),
    unemp: addNoise(adjusted.unemp),
    market: addNoise(adjusted.market),
    conf: addNoise(adjusted.conf),
  }
}
