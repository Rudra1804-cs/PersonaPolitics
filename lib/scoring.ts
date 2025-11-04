export type Tier = "legendary" | "good" | "average" | "poor" | "bad"

export function getTier(total: number): Tier {
  if (total >= 240) return "legendary"
  if (total >= 200) return "good"
  if (total >= 150) return "average"
  if (total >= 100) return "poor"
  return "bad"
}

export function tierCopy(tier: Tier) {
  switch (tier) {
    case "legendary":
      return { title: "Legendary", line: "Re-elected in a landslide. History remembers you." }
    case "good":
      return { title: "Good", line: "Solid term with clear wins. The people approve." }
    case "average":
      return { title: "Average", line: "Some highs, some lows. Respectable, not remarkable." }
    case "poor":
      return { title: "Poor", line: "Missteps outweighed gains. Tough press conferences." }
    default:
      return { title: "Bad", line: "One-Term Wonder. Time to write that memoir." }
  }
}

export function tierStyles(tier: Tier) {
  // bg / border / text accents for Tailwind utility classes
  if (tier === "legendary")
    return {
      box: "bg-indigo-700/25 border-indigo-400 text-indigo-100 shadow-[0_0_40px_rgba(99,102,241,.25)]",
      pill: "bg-indigo-500",
    }
  if (tier === "good") return { box: "bg-emerald-700/25 border-emerald-400 text-emerald-100", pill: "bg-emerald-500" }
  if (tier === "average") return { box: "bg-amber-700/20 border-amber-400 text-amber-100", pill: "bg-amber-500" }
  if (tier === "poor") return { box: "bg-orange-800/20 border-orange-400 text-orange-100", pill: "bg-orange-500" }
  return { box: "bg-rose-800/20 border-rose-400 text-rose-100 grayscale-[.15]", pill: "bg-rose-500" }
}
