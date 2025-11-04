import { z } from "zod"

export const PolicyResponseSchema = z.object({
  decision_effect: z.string(),
  approval_change: z.number().int(),
  power_change: z.number().int(),
  standing_change: z.number().int(),
  advisor_comment: z.string(),
})

export type PolicyResponse = z.infer<typeof PolicyResponseSchema>

export const PolicyRequestSchema = z.object({
  policy: z.string(),
  outcome: z.enum(["approved", "rejected"]),
  stats: z.object({
    approval: z.number(),
    power: z.number(),
    standing: z.number(),
  }),
})

export type PolicyRequest = z.infer<typeof PolicyRequestSchema>

export const PolicyResolveRequestSchema = z.object({
  policyId: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  approved: z.boolean(),
  misses: z.number().int().min(0),
  rounds: z.number().int().min(1),
})

export type PolicyResolveRequest = z.infer<typeof PolicyResolveRequestSchema>

export const PolicyResolveResponseSchema = z.object({
  approval_change: z.number().int(),
  power_change: z.number().int(),
  standing_change: z.number().int(),
  advisor_comment: z.string(),
})

export type PolicyResolveResponse = z.infer<typeof PolicyResolveResponseSchema>
