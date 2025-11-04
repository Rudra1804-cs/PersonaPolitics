import { type NextRequest, NextResponse } from "next/server"
import { PolicyResolveRequestSchema } from "@/lib/schema"
import type { PolicyResolveResponse } from "@/lib/types" // Declare the PolicyResolveResponse variable

const OLLAMA_URL = process.env.OLLAMA_URL
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "mistral"

// Policy stat deltas based on difficulty and outcome
const POLICY_EFFECTS: Record<string, Record<string, { approval: number; power: number; standing: number }>> = {
  infrastructure: {
    "easy-approved": { approval: 5, power: -2, standing: 4 },
    "easy-rejected": { approval: -3, power: 1, standing: -2 },
    "medium-approved": { approval: 7, power: -4, standing: 6 },
    "medium-rejected": { approval: -5, power: 2, standing: -4 },
    "hard-approved": { approval: 10, power: -6, standing: 8 },
    "hard-rejected": { approval: -8, power: 3, standing: -6 },
  },
  military: {
    "easy-approved": { approval: -2, power: 6, standing: 3 },
    "easy-rejected": { approval: 2, power: -4, standing: -2 },
    "medium-approved": { approval: -4, power: 9, standing: 5 },
    "medium-rejected": { approval: 3, power: -6, standing: -4 },
    "hard-approved": { approval: -6, power: 12, standing: 7 },
    "hard-rejected": { approval: 5, power: -9, standing: -6 },
  },
  justice: {
    "easy-approved": { approval: 6, power: 1, standing: 5 },
    "easy-rejected": { approval: -4, power: -1, standing: -3 },
    "medium-approved": { approval: 8, power: 2, standing: 7 },
    "medium-rejected": { approval: -6, power: -2, standing: -5 },
    "hard-approved": { approval: 11, power: 3, standing: 9 },
    "hard-rejected": { approval: -9, power: -3, standing: -7 },
  },
}

const FALLBACK_COMMENTS = [
  "Interesting choice. Let's see how this plays out.",
  "The people have spoken... sort of.",
  "Bold move. History will be the judge.",
  "Well, that's one way to govern.",
  "Democracy in action, for better or worse.",
]

async function getAdvisorComment(
  policyId: string,
  difficulty: string,
  approved: boolean,
  misses: number,
): Promise<string> {
  // If no Ollama configured, return fallback
  if (!OLLAMA_URL) {
    return FALLBACK_COMMENTS[Math.floor(Math.random() * FALLBACK_COMMENTS.length)]
  }

  try {
    const prompt = `You are a witty political advisor. A policy decision was just made. Respond with ONE short, clever comment (max 15 words, no emojis).

Policy: ${policyId}
Difficulty: ${difficulty}
Outcome: ${approved ? "approved" : "rejected"}
Performance: ${misses} mistakes

Comment:`

    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
      }),
      signal: AbortSignal.timeout(5000), // 5s timeout
    })

    if (!response.ok) {
      throw new Error("Ollama request failed")
    }

    const data = await response.json()
    const comment = data.response?.trim() || ""

    if (comment.length > 0 && comment.length < 100) {
      return comment
    }

    return FALLBACK_COMMENTS[Math.floor(Math.random() * FALLBACK_COMMENTS.length)]
  } catch (error) {
    console.log("[v0] Ollama unavailable, using fallback comment")
    return FALLBACK_COMMENTS[Math.floor(Math.random() * FALLBACK_COMMENTS.length)]
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = PolicyResolveRequestSchema.parse(body)

    const { policyId, difficulty, approved, misses, rounds } = validated

    // Get stat deltas
    const effectKey = `${difficulty}-${approved ? "approved" : "rejected"}`
    const effects = POLICY_EFFECTS[policyId]?.[effectKey] || { approval: 0, power: 0, standing: 0 }

    // Get advisor comment (async, with fallback)
    const advisor_comment = await getAdvisorComment(policyId, difficulty, approved, misses)

    const response: PolicyResolveResponse = {
      approval_change: effects.approval,
      power_change: effects.power,
      standing_change: effects.standing,
      advisor_comment,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("[v0] Policy resolve error:", error)

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }

    return NextResponse.json(
      {
        approval_change: 0,
        power_change: 0,
        standing_change: 0,
        advisor_comment: "Something went wrong. No changes applied.",
      },
      { status: 500 },
    )
  }
}
