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
      statToasts: [...state.statToasts, toast].slice(-3), // Keep max 3
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
