import { create } from "zustand"

export interface Stats {
  approval: number
  power: number
  standing: number
}

export interface PolicyResult {
  decision_effect: string
  approval_change: number
  power_change: number
  standing_change: number
  advisor_comment: string
}

export interface PolicyLogEntry {
  id: string
  title: string
  decision: "approve" | "reject"
  result: "win" | "loss"
  delta: {
    approval: number
    power: number
    standing: number
  }
  time: number
}

export interface WorldEvent {
  id: string
  headline: string
  detail: string
  urgency: "low" | "medium" | "high"
  time: number
}

export type RemarkTone = "surprised" | "proud" | "neutral" | "concerned" | "roast"

export interface SecretaryRemark {
  id: string
  text: string
  tone: RemarkTone
  time: number
}

export interface StatToast {
  id: string
  a?: number
  p?: number
  s?: number
  time: number
}

export interface HoveredPolicy {
  id: string
  title: string
  difficulty: "easy" | "medium" | "hard"
}

export interface EconPoint {
  t: number
  gdp: number
  infl: number
  unemp: number
  market: number
  conf: number
}

export interface Economy {
  gdp: number
  infl: number
  unemp: number
  market: number
  conf: number
  history: EconPoint[]
}

export type BlocKey = "NATO" | "EU" | "BRICS" | "OIC" | "SCO"

export interface BlocOpinion {
  score: number
  stance: "Supportive" | "Neutral" | "Critical"
  reason: string
  history: Array<{ t: number; score: number }>
}

interface GameState {
  stats: Stats
  isGameOver: boolean
  gameResult: "win" | "lose" | null
  termSecondsTotal: number
  termSecondsLeft: number
  termStarted: boolean
  termOver: boolean
  policyLog: PolicyLogEntry[]
  worldEvents: WorldEvent[]
  secretary: {
    queue: SecretaryRemark[]
    push: (r: { text: string; tone: RemarkTone }) => void
    shift: () => void
  }
  statToasts: StatToast[]
  pushStatToast: (t: { a?: number; p?: number; s?: number }) => void
  clearOldStatToasts: () => void
  hoveredPolicy: HoveredPolicy | null
  setHoveredPolicy: (policy: HoveredPolicy | null) => void
  economy: Economy
  initEconomy: () => void
  applyEconomyDelta: (d: { gdp?: number; infl?: number; unemp?: number; market?: number; conf?: number }) => void
  foreignOpinions: Record<BlocKey, BlocOpinion>
  initForeignOpinions: () => void
  applyForeignDelta: (bloc: BlocKey, d: { score?: number; reason?: string }) => void
  recomputeBlocStance: (bloc: BlocKey) => void
  updateStats: (changes: Partial<Stats>) => void
  resetGame: () => void
  checkGameOver: () => void
  startTerm: () => void
  tickTerm: () => void
  endTerm: () => void
  resetTerm: () => void
  addPolicyLog: (entry: PolicyLogEntry) => void
  addWorldEvent: (headline: string, detail: string, urgency?: "low" | "medium" | "high") => void
  removeWorldEvent: (id: string) => void
  clearWorldEvents: () => void
}

function clampEcon(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

export const useGameStore = create<GameState>((set, get) => ({
  stats: {
    approval: 50,
    power: 50,
    standing: 50,
  },
  isGameOver: false,
  gameResult: null,
  termSecondsTotal: 150,
  termSecondsLeft: 150,
  termStarted: false,
  termOver: false,
  policyLog: [],
  worldEvents: [],
  secretary: {
    queue: [],
    push: (r) => {
      const remark: SecretaryRemark = {
        id: `remark-${Date.now()}-${Math.random()}`,
        text: r.text,
        tone: r.tone,
        time: Date.now(),
      }
      set((state) => ({
        secretary: {
          ...state.secretary,
          queue: [...state.secretary.queue, remark],
        },
      }))
    },
    shift: () => {
      set((state) => ({
        secretary: {
          ...state.secretary,
          queue: state.secretary.queue.slice(1),
        },
      }))
    },
  },
  statToasts: [],
  pushStatToast: (t) => {
    const toast: StatToast = {
      id: `toast-${Date.now()}-${Math.random()}`,
      a: t.a,
      p: t.p,
      s: t.s,
      time: Date.now(),
    }
    set((state) => ({
      statToasts: [...state.statToasts, toast].slice(-3),
    }))
  },
  clearOldStatToasts: () => {
    const now = Date.now()
    set((state) => ({
      statToasts: state.statToasts.filter((toast) => now - toast.time < 5000),
    }))
  },
  hoveredPolicy: null,
  setHoveredPolicy: (policy) => set({ hoveredPolicy: policy }),
  economy: {
    gdp: 100,
    infl: 4.0,
    unemp: 6.0,
    market: 100,
    conf: 50,
    history: [{ t: 0, gdp: 100, infl: 4.0, unemp: 6.0, market: 100, conf: 50 }],
  },
  initEconomy: () => {
    set({
      economy: {
        gdp: 100,
        infl: 4.0,
        unemp: 6.0,
        market: 100,
        conf: 50,
        history: [{ t: 0, gdp: 100, infl: 4.0, unemp: 6.0, market: 100, conf: 50 }],
      },
    })
  },
  applyEconomyDelta: (d) => {
    set((state) => {
      const newGdp = clampEcon(state.economy.gdp + (d.gdp || 0), 70, 140)
      const newInfl = clampEcon(state.economy.infl + (d.infl || 0), 1, 15)
      const newUnemp = clampEcon(state.economy.unemp + (d.unemp || 0), 2, 20)
      const newMarket = clampEcon(state.economy.market + (d.market || 0), 60, 160)
      const newConf = clampEcon(state.economy.conf + (d.conf || 0), 0, 100)

      const newPoint: EconPoint = {
        t: state.termSecondsTotal - state.termSecondsLeft,
        gdp: newGdp,
        infl: newInfl,
        unemp: newUnemp,
        market: newMarket,
        conf: newConf,
      }

      const newHistory = [...state.economy.history, newPoint].slice(-60)

      return {
        economy: {
          gdp: newGdp,
          infl: newInfl,
          unemp: newUnemp,
          market: newMarket,
          conf: newConf,
          history: newHistory,
        },
      }
    })
  },
  foreignOpinions: {
    NATO: { score: 50, stance: "Neutral", reason: "", history: [{ t: 0, score: 50 }] },
    EU: { score: 50, stance: "Neutral", reason: "", history: [{ t: 0, score: 50 }] },
    BRICS: { score: 50, stance: "Neutral", reason: "", history: [{ t: 0, score: 50 }] },
    OIC: { score: 50, stance: "Neutral", reason: "", history: [{ t: 0, score: 50 }] },
    SCO: { score: 50, stance: "Neutral", reason: "", history: [{ t: 0, score: 50 }] },
  },
  initForeignOpinions: () => {
    set({
      foreignOpinions: {
        NATO: { score: 50, stance: "Neutral", reason: "", history: [{ t: 0, score: 50 }] },
        EU: { score: 50, stance: "Neutral", reason: "", history: [{ t: 0, score: 50 }] },
        BRICS: { score: 50, stance: "Neutral", reason: "", history: [{ t: 0, score: 50 }] },
        OIC: { score: 50, stance: "Neutral", reason: "", history: [{ t: 0, score: 50 }] },
        SCO: { score: 50, stance: "Neutral", reason: "", history: [{ t: 0, score: 50 }] },
      },
    })
  },
  applyForeignDelta: (bloc, d) => {
    set((state) => {
      const current = state.foreignOpinions[bloc]
      const newScore = Math.max(0, Math.min(100, current.score + (d.score || 0)))
      const newReason = d.reason !== undefined ? d.reason : current.reason

      const newPoint = {
        t: state.termSecondsTotal - state.termSecondsLeft,
        score: newScore,
      }

      const newHistory = [...current.history, newPoint].slice(-40)

      return {
        foreignOpinions: {
          ...state.foreignOpinions,
          [bloc]: {
            ...current,
            score: newScore,
            reason: newReason,
            history: newHistory,
          },
        },
      }
    })
  },
  recomputeBlocStance: (bloc) => {
    set((state) => {
      const current = state.foreignOpinions[bloc]
      let stance: "Supportive" | "Neutral" | "Critical"

      if (current.score >= 67) {
        stance = "Supportive"
      } else if (current.score >= 34) {
        stance = "Neutral"
      } else {
        stance = "Critical"
      }

      return {
        foreignOpinions: {
          ...state.foreignOpinions,
          [bloc]: {
            ...current,
            stance,
          },
        },
      }
    })
  },
  updateStats: (changes) => {
    if (get().termOver) return

    set((state) => {
      const newStats = {
        approval: Math.max(0, Math.min(100, state.stats.approval + (changes.approval || 0))),
        power: Math.max(0, Math.min(100, state.stats.power + (changes.power || 0))),
        standing: Math.max(0, Math.min(100, state.stats.standing + (changes.standing || 0))),
      }
      return { stats: newStats }
    })
    get().checkGameOver()
  },
  checkGameOver: () => {
    const { stats } = get()
    if (stats.approval === 0 || stats.power === 0 || stats.standing === 0) {
      set({ isGameOver: true, gameResult: "lose" })
    } else if (stats.approval >= 70 && stats.power >= 70 && stats.standing >= 70) {
      set({ isGameOver: true, gameResult: "win" })
    }
  },
  resetGame: () => {
    set({
      stats: { approval: 50, power: 50, standing: 50 },
      isGameOver: false,
      gameResult: null,
    })
  },
  startTerm: () => {
    set({ termStarted: true, termOver: false })
    get().initEconomy()
    get().initForeignOpinions()
  },
  tickTerm: () => {
    const state = get()
    if (state.termOver || !state.termStarted) return

    const newSecondsLeft = Math.max(0, state.termSecondsLeft - 1)
    set({ termSecondsLeft: newSecondsLeft })

    if (newSecondsLeft <= 0) {
      get().endTerm()
    }
  },
  endTerm: () => {
    set({ termOver: true, termStarted: false })
  },
  resetTerm: () => {
    set({
      termSecondsLeft: 150,
      termStarted: false,
      termOver: false,
      policyLog: [],
      worldEvents: [],
      stats: { approval: 50, power: 50, standing: 50 },
      isGameOver: false,
      gameResult: null,
      secretary: {
        ...get().secretary,
        queue: [],
      },
      statToasts: [],
      hoveredPolicy: null,
    })
    get().initEconomy()
    get().initForeignOpinions()
  },
  addPolicyLog: (entry) => {
    set((state) => ({
      policyLog: [...state.policyLog, entry],
    }))
  },
  addWorldEvent: (headline, detail, urgency = "low") => {
    const event: WorldEvent = {
      id: `event-${Date.now()}-${Math.random()}`,
      headline,
      detail,
      urgency,
      time: get().termSecondsTotal - get().termSecondsLeft,
    }
    set((state) => ({
      worldEvents: [...state.worldEvents, event],
    }))
  },
  removeWorldEvent: (id) => {
    set((state) => ({
      worldEvents: state.worldEvents.filter((e) => e.id !== id),
    }))
  },
  clearWorldEvents: () => {
    set({ worldEvents: [] })
  },
}))
