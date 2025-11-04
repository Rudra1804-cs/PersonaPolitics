import type { Stats, PolicyLogEntry } from "./state"

export interface EventTrigger {
  condition: (stats: Stats, policyLog: PolicyLogEntry[]) => boolean
  headlines: string[]
  details: string[]
  urgency: "low" | "medium" | "high"
}

// Helper to get recent policy decisions
const getRecentDecisions = (policyLog: PolicyLogEntry[], count: number) => {
  return policyLog.slice(-count)
}

const countRejects = (policyLog: PolicyLogEntry[]) => {
  return policyLog.filter((p) => p.decision === "reject").length
}

const countApprovals = (policyLog: PolicyLogEntry[]) => {
  return policyLog.filter((p) => p.decision === "approve").length
}

const countWins = (policyLog: PolicyLogEntry[]) => {
  return policyLog.filter((p) => p.result === "win").length
}

const countLosses = (policyLog: PolicyLogEntry[]) => {
  return policyLog.filter((p) => p.result === "loss").length
}

// Event trigger definitions
export const EVENT_TRIGGERS: EventTrigger[] = [
  // Cabinet Crisis - Multiple rejections
  {
    condition: (stats, policyLog) => countRejects(policyLog) >= 3,
    headlines: [
      "Emergency cabinet meeting after repeated reform failures",
      "Senior advisors express concern over policy gridlock",
      "Cabinet holds midnight briefing on stalled agenda",
    ],
    details: [
      "Key ministers are questioning the administration's direction.",
      "Internal tensions rise as reform efforts stall.",
      "Advisors urge decisive action to break the impasse.",
    ],
    urgency: "medium",
  },

  // Public Unrest - Low approval
  {
    condition: (stats) => stats.approval < 40,
    headlines: [
      "Protests erupt in capital demanding new leadership",
      "Public approval plummets as citizens take to streets",
      "Mass demonstrations challenge presidential authority",
    ],
    details: [
      "Thousands gather outside government buildings.",
      "Opposition leaders call for immediate reforms.",
      "Social media campaigns gain momentum nationwide.",
    ],
    urgency: "high",
  },

  // Global Influence - High power
  {
    condition: (stats) => stats.power > 80,
    headlines: [
      "Foreign envoys rush to secure new trade pacts",
      "International summit requests presidential keynote",
      "Global leaders seek alliance with administration",
    ],
    details: [
      "Your strong position attracts international attention.",
      "Diplomatic channels open across multiple continents.",
      "Economic partnerships are being fast-tracked.",
    ],
    urgency: "low",
  },

  // Internal Friction - Low standing
  {
    condition: (stats) => stats.standing < 30,
    headlines: [
      "Rumors of impeachment circulate among senior party members",
      "Party leadership questions president's effectiveness",
      "Internal revolt threatens administration stability",
    ],
    details: [
      "Key allies are distancing themselves publicly.",
      "Backroom negotiations intensify as factions form.",
      "Your political survival is now in question.",
    ],
    urgency: "high",
  },

  // Opposition Surge - Multiple approvals
  {
    condition: (stats, policyLog) => countApprovals(policyLog) >= 3,
    headlines: [
      "Opposition alliance forms united front against government",
      "Rival parties unite to challenge presidential agenda",
      "Opposition leaders coordinate resistance strategy",
    ],
    details: [
      "Your aggressive policy push has unified your opponents.",
      "A coalition of critics is gaining public support.",
      "Political analysts predict a contentious period ahead.",
    ],
    urgency: "medium",
  },

  // Economic Boom - Win streak
  {
    condition: (stats, policyLog) => {
      const recent = getRecentDecisions(policyLog, 5)
      return recent.length >= 5 && recent.every((p) => p.result === "win")
    },
    headlines: [
      "Markets surge as president hailed for decisive leadership",
      "Economic indicators reach record highs under administration",
      "Business confidence soars following policy victories",
    ],
    details: [
      "Stock markets hit all-time highs.",
      "Consumer confidence reaches decade-best levels.",
      "International investors flood into domestic markets.",
    ],
    urgency: "low",
  },

  // Diplomatic Fallout - Loss streak
  {
    condition: (stats, policyLog) => {
      const recent = getRecentDecisions(policyLog, 3)
      return recent.length >= 3 && recent.every((p) => p.result === "loss")
    },
    headlines: [
      "Neighbouring president criticizes unstable governance",
      "International allies express concern over leadership",
      "Diplomatic relations strain as failures mount",
    ],
    details: [
      "Foreign leaders are reconsidering partnerships.",
      "Trade negotiations are being put on hold.",
      "Your international reputation is suffering.",
    ],
    urgency: "high",
  },

  // Military Tensions - Defense policy impact
  {
    condition: (stats, policyLog) => {
      const militaryPolicy = policyLog.find((p) => p.id === "military")
      return militaryPolicy?.decision === "reject" && stats.power < 50
    },
    headlines: [
      "Neighbouring country begins border military exercises",
      "Regional tensions rise following defense budget cuts",
      "Military analysts warn of security vulnerabilities",
    ],
    details: [
      "Defense cuts have emboldened potential adversaries.",
      "Military readiness is being questioned by experts.",
      "Border security concerns dominate national discourse.",
    ],
    urgency: "high",
  },

  // Infrastructure Crisis - Infrastructure policy impact
  {
    condition: (stats, policyLog) => {
      const infraPolicy = policyLog.find((p) => p.id === "infrastructure")
      return infraPolicy?.decision === "reject" && stats.approval < 50
    },
    headlines: [
      "Major bridge collapse highlights infrastructure neglect",
      "Transportation crisis deepens as repairs are delayed",
      "Engineers warn of cascading infrastructure failures",
    ],
    details: [
      "Public anger grows over deteriorating conditions.",
      "Economic costs of inaction are mounting rapidly.",
      "Opposition seizes on infrastructure failures.",
    ],
    urgency: "medium",
  },

  // Justice Reform Impact - Justice policy
  {
    condition: (stats, policyLog) => {
      const justicePolicy = policyLog.find((p) => p.id === "justice")
      return justicePolicy?.decision === "approve" && stats.standing > 60
    },
    headlines: [
      "Criminal justice reform praised by civil rights groups",
      "Bipartisan support emerges for justice initiatives",
      "Reform advocates celebrate landmark policy victory",
    ],
    details: [
      "Your bold stance on justice is winning praise.",
      "Community leaders express renewed hope.",
      "The reform is being studied by other nations.",
    ],
    urgency: "low",
  },

  // Balanced Leadership - All stats moderate
  {
    condition: (stats) => {
      const allModerate =
        stats.approval >= 45 &&
        stats.approval <= 65 &&
        stats.power >= 45 &&
        stats.power <= 65 &&
        stats.standing >= 45 &&
        stats.standing <= 65
      return allModerate
    },
    headlines: [
      "Political analysts praise measured approach to governance",
      "Centrist coalition emerges in support of administration",
      "Moderate policies attract broad-based support",
    ],
    details: [
      "Your balanced approach is resonating with voters.",
      "Cross-party dialogue is becoming more productive.",
      "Stability is valued in uncertain times.",
    ],
    urgency: "low",
  },
]

// Generate a world event based on current game state
export function generateWorldEvent(
  stats: Stats,
  policyLog: PolicyLogEntry[],
  isHeadlineUsed?: (headline: string) => boolean,
): {
  headline: string
  detail: string
  urgency: "low" | "medium" | "high"
} | null {
  // Find all matching triggers
  const matchingTriggers = EVENT_TRIGGERS.filter((trigger) => trigger.condition(stats, policyLog))

  if (matchingTriggers.length === 0) return null

  // Pick a random matching trigger
  const trigger = matchingTriggers[Math.floor(Math.random() * matchingTriggers.length)]

  const availableHeadlines = isHeadlineUsed ? trigger.headlines.filter((h) => !isHeadlineUsed(h)) : trigger.headlines

  // If all headlines have been used, reset and use all headlines
  const headlinesToUse = availableHeadlines.length > 0 ? availableHeadlines : trigger.headlines

  // Pick random headline and detail
  const headline = headlinesToUse[Math.floor(Math.random() * headlinesToUse.length)]
  const detail = trigger.details[Math.floor(Math.random() * trigger.details.length)]

  return {
    headline,
    detail,
    urgency: trigger.urgency,
  }
}
