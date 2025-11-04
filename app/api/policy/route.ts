import { type NextRequest, NextResponse } from "next/server"
import { PolicyRequestSchema, PolicyResponseSchema } from "@/lib/schema"

const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434/api/generate"
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "mistral"

const FALLBACK_RESPONSE = {
  decision_effect: "Outcome recorded.",
  approval_change: 0,
  power_change: 0,
  standing_change: 0,
  advisor_comment: "Keeping it steady for now.",
}

function buildPrompt(policy: string, outcome: string, stats: any): string {
  return `You are a political advisor. A policy decision has been made. Return ONLY valid JSON matching this exact schema:

{
  "decision_effect": "string (short sentence describing the outcome)",
  "approval_change": "integer (-10 to +10)",
  "power_change": "integer (-15 to +15)",
  "standing_change": "integer (-10 to +10)",
  "advisor_comment": "string (witty one-liner, no emojis)"
}

Examples:

Policy: Infrastructure Deal, Outcome: approved, Stats: {approval: 50, power: 50, standing: 50}
{"decision_effect":"The infrastructure bill passes with bipartisan support.","approval_change":8,"power_change":-5,"standing_change":6,"advisor_comment":"Building bridges, literally and politically."}

Policy: Military Spending, Outcome: rejected, Stats: {approval: 45, power: 60, standing: 55}
{"decision_effect":"Defense hawks are furious about the budget cut.","approval_change":-6,"power_change":-10,"standing_change":3,"advisor_comment":"Peace through... budget constraints?"}

Policy: Criminal Justice Reform, Outcome: approved, Stats: {approval: 55, power: 48, standing: 52}
{"decision_effect":"Reform passes, progressive base energized.","approval_change":7,"power_change":2,"standing_change":5,"advisor_comment":"Justice delayed is justice denied, but justice delivered is votes earned."}

Now respond for:
Policy: ${policy}, Outcome: ${outcome}, Stats: ${JSON.stringify(stats)}

Return ONLY the JSON object, no markdown, no code fences, no additional text.`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedRequest = PolicyRequestSchema.parse(body)

    const prompt = buildPrompt(validatedRequest.policy, validatedRequest.outcome, validatedRequest.stats)

    console.log("[v0] Calling Ollama at:", OLLAMA_URL)
    console.log("[v0] Using model:", OLLAMA_MODEL)

    // Call Ollama
    const ollamaResponse = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        format: "json", // Request JSON format explicitly
      }),
    })

    console.log("[v0] Ollama response status:", ollamaResponse.status)

    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text()
      console.error("[v0] Ollama request failed:", ollamaResponse.statusText)
      console.error("[v0] Error response:", errorText)
      return NextResponse.json(FALLBACK_RESPONSE)
    }

    const ollamaData = await ollamaResponse.json()
    console.log("[v0] Ollama data structure:", Object.keys(ollamaData))

    const responseText = ollamaData.response || ""
    console.log("[v0] Raw Ollama response:", responseText.substring(0, 200))

    if (!responseText || responseText.trim().length === 0) {
      console.error("[v0] Empty response from Ollama")
      return NextResponse.json(FALLBACK_RESPONSE)
    }

    // Try to parse the JSON response
    let parsedResponse
    try {
      // Remove any markdown code fences if present
      const cleanedText = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim()

      if (!cleanedText.startsWith("{") && !cleanedText.startsWith("[")) {
        console.error("[v0] Response doesn't look like JSON:", cleanedText.substring(0, 100))
        return NextResponse.json(FALLBACK_RESPONSE)
      }

      parsedResponse = JSON.parse(cleanedText)
      console.log("[v0] Successfully parsed JSON response")

      // Validate with Zod
      const validatedResponse = PolicyResponseSchema.parse(parsedResponse)
      console.log("[v0] Response validated successfully")
      return NextResponse.json(validatedResponse)
    } catch (parseError) {
      console.error("[v0] Failed to parse Ollama response:", parseError)
      console.error("[v0] Raw response text:", responseText)
      return NextResponse.json(FALLBACK_RESPONSE)
    }
  } catch (error) {
    console.error("[v0] Policy API error:", error)
    if (error instanceof Error) {
      console.error("[v0] Error message:", error.message)
      console.error("[v0] Error stack:", error.stack)
    }
    return NextResponse.json(FALLBACK_RESPONSE)
  }
}
