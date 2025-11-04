import type { RemarkTone } from "./state"

export const SECRETARY_REMARKS: Record<string, { tone: RemarkTone; lines: string[] }[]> = {
  // Positive outcomes (Δ total ≥ +6)
  positive: [
    {
      tone: "surprised",
      lines: [
        "I… didn't expect that to work. Nicely played.",
        "Well, that's a pleasant surprise. Color me impressed.",
        "Against all odds, you pulled it off. Remarkable.",
        "I stand corrected. That was actually brilliant.",
        "Astonishing. Did you actually read the briefing this time?",
        "Well, well. Perhaps there's hope for this administration yet.",
      ],
    },
    {
      tone: "proud",
      lines: [
        "Approval up, power up—schedule the victory lap?",
        "Now that's leadership. The people are listening.",
        "Textbook execution. I'll update your legacy file.",
        "Masterful. Your opponents are taking notes.",
        "Finally, a decision worthy of the office.",
        "Brilliant, sir. Almost makes up for last week.",
      ],
    },
  ],
  // Small positive (0 to +5)
  smallPositive: [
    {
      tone: "neutral",
      lines: [
        "A step forward. Try not to trip on the next one.",
        "Progress, albeit modest. We'll take it.",
        "Small wins add up. Eventually.",
        "Not bad. Not great. But not bad.",
        "Baby steps, Mr. President. Baby steps.",
        "Well, it's not a disaster. That's something.",
      ],
    },
  ],
  // Negative outcomes (Δ total ≤ −6)
  negative: [
    {
      tone: "roast",
      lines: [
        "Brave strategy: disappoint everyone equally.",
        "Well, at least you're consistent… at failing.",
        "I've seen better decisions from a magic 8-ball.",
        "Bold move. Historically terrible, but bold.",
        "The history books will have questions.",
        "Mr. President, that's one way to tank the economy—in record time.",
        "Diplomacy is about balance… not bulldozing, sir.",
        "Your approval rating is dropping faster than our stock market.",
        "Congratulations. You've united the opposition—against you.",
        "I'll prepare the apology tour itinerary.",
      ],
    },
    {
      tone: "concerned",
      lines: [
        "Sir, the markets are practicing fainting.",
        "We may need to update the crisis protocols.",
        "I'll prepare the damage control briefing.",
        "This is… concerning. Very concerning.",
        "The cabinet is requesting an emergency meeting.",
        "Perhaps we should reconsider our approach, sir.",
      ],
    },
  ],
  // Small negative (−1 to −5)
  smallNegative: [
    {
      tone: "neutral",
      lines: [
        "Paper cuts still bleed, sir.",
        "A minor setback. Emphasis on minor.",
        "Could be worse. Could also be better.",
        "Not ideal, but we've survived worse.",
        "A stumble, not a fall. Yet.",
        "The opposition is taking notes. Unflattering ones.",
      ],
    },
  ],
}

export function pickSecretaryRemark(deltaTotal: number): { text: string; tone: RemarkTone } {
  let category: string
  let options: { tone: RemarkTone; lines: string[] }[]

  if (deltaTotal >= 6) {
    category = "positive"
    options = SECRETARY_REMARKS.positive
  } else if (deltaTotal > 0) {
    category = "smallPositive"
    options = SECRETARY_REMARKS.smallPositive
  } else if (deltaTotal <= -6) {
    category = "negative"
    options = SECRETARY_REMARKS.negative
  } else {
    category = "smallNegative"
    options = SECRETARY_REMARKS.smallNegative
  }

  // Pick random option from category
  const option = options[Math.floor(Math.random() * options.length)]
  const text = option.lines[Math.floor(Math.random() * option.lines.length)]

  return { text, tone: option.tone }
}
