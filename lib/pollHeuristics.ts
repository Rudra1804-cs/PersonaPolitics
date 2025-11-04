export type PollContext = {
  approval: number
  power: number
  standing: number
  economy: { gdp: number; infl: number; unemp: number; conf: number }
  policyId: string
  decision: "approve" | "reject"
  result: "win" | "loss"
  difficulty: "EASY" | "MEDIUM" | "HARD"
}

export function pollShift(ctx: PollContext): Partial<{
  age: Partial<Record<"18_30" | "31_60" | "60_80" | "80_plus", number>>
  gender: Partial<Record<"male" | "female" | "other", number>>
  ownParty: number
  urban: number
  rural: number
  undecided: number
  overall: number
}> {
  const { approval, economy, policyId, decision, result, difficulty } = ctx
  const hard = difficulty === "HARD" ? 1.15 : 1.0
  const sign = decision === "approve" ? 1 : -1
  const won = result === "win" ? 1 : -1

  const jitter = (n: number) => n + (Math.random() * 1.4 - 0.7)
  const scale = (n: number) => jitter(n * hard * (won > 0 ? 1 : 0.6))

  const out: any = { age: {}, gender: {} }

  if (policyId === "infrastructure") {
    out.age["18_30"] = scale(+2.6) * sign
    out.age["31_60"] = scale(+1.8) * sign
    out.age["60_80"] = scale(+0.8) * sign
    out.gender["female"] = scale(+1.2) * sign
    out.urban = scale(+1.5) * sign
    out.rural = scale(+0.8) * sign
    out.undecided = -Math.abs(scale(0.9)) * sign
  }
  if (policyId === "military") {
    out.age["18_30"] = scale(-0.6) * sign
    out.age["31_60"] = scale(+1.0) * sign
    out.age["60_80"] = scale(+1.6) * sign
    out.gender["male"] = scale(+1.3) * sign
    out.gender["female"] = scale(-0.4) * sign
    out.urban = scale(+0.6) * sign
    out.undecided = -Math.abs(scale(0.5)) * sign
  }
  if (policyId === "justice") {
    out.gender["female"] = scale(+1.8) * sign
    out.age["18_30"] = scale(+1.4) * sign
    out.age["31_60"] = scale(+0.9) * sign
    out.age["60_80"] = scale(+0.5) * sign
    out.urban = scale(+0.9) * sign
    out.undecided = -Math.abs(scale(0.7)) * sign
  }

  // Economy cross-effects
  if (economy.unemp < 5.5) out.age["18_30"] = (out.age["18_30"] ?? 0) + 0.6
  if (economy.infl > 8) out.age["60_80"] = (out.age["60_80"] ?? 0) - 0.8

  // Own party follows Standing & winning
  out.ownParty = jitter((approval - 50) * 0.06 + (won > 0 ? 0.8 : -0.8))

  // Overall moves toward Approval
  out.overall = jitter((approval - 50) * 0.04)

  return out
}

export function pollTimeDrift(approval: number) {
  return {
    undecided: approval >= 60 ? -0.6 : +0.6,
    overall: (approval - 50) * 0.02 + (Math.random() * 0.6 - 0.3),
  }
}
