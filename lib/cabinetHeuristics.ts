import type { MinisterKey } from "./state"

export interface CabinetDelta {
  key: MinisterKey
  delta: number
  reason: string
}

interface CabinetContext {
  defenseApprovalsInRow: number
}

export function cabinetDeltas(
  policyId: string,
  decision: "approve" | "reject",
  result: "win" | "loss",
  context: CabinetContext,
): CabinetDelta[] {
  const deltas: CabinetDelta[] = []
  const isLoss = result === "loss"

  // Helper to add delta with loss penalty
  const addDelta = (key: MinisterKey, base: number, reason: string) => {
    const final = isLoss && base > 0 ? Math.floor(base / 2) : base
    deltas.push({ key, delta: final, reason })
  }

  // Infrastructure policy
  if (policyId === "infrastructure") {
    if (decision === "approve") {
      addDelta("finance", 3 + Math.floor(Math.random() * 4), "Infrastructure spending approved")
      addDelta("justice", 1 + Math.floor(Math.random() * 2), "Public welfare investment")
    } else {
      addDelta("finance", -4 - Math.floor(Math.random() * 3), "Infrastructure deal rejected")
      addDelta("justice", -1 - Math.floor(Math.random() * 2), "Missed public investment")
    }
  }

  // Defense/Military policy
  if (policyId === "military") {
    if (decision === "approve") {
      addDelta("defense", 4 + Math.floor(Math.random() * 4), "Defense budget increased")
      addDelta("foreign", 1 + Math.floor(Math.random() * 3), "Military strength signaled")

      // Consecutive defense approvals upset justice
      if (context.defenseApprovalsInRow >= 2) {
        deltas.push({
          key: "justice",
          delta: -2 - Math.floor(Math.random() * 2),
          reason: "Militarization concerns",
        })
      }
    } else {
      addDelta("defense", -5 - Math.floor(Math.random() * 3), "Defense budget cut")
    }
  }

  // Criminal Justice Reform
  if (policyId === "justice") {
    if (decision === "approve") {
      addDelta("justice", 4 + Math.floor(Math.random() * 3), "Reform championed")
      addDelta("foreign", 1 + Math.floor(Math.random() * 2), "International praise for reform")
    } else {
      addDelta("justice", -4 - Math.floor(Math.random() * 2), "Reform blocked")
    }
  }

  return deltas
}
