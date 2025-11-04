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

export interface UsedHeadlines {
  headlines: string[]
  maxHistory: number
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

export type AgeKey = "18_30" | "31_60" | "60_80" | "80_plus"
export type GenderKey = "male" | "female" | "other"
export type SegTrend = { t: number; value: number }

export interface ExitPoll {
  sample: number
  moe: number
  lastUpdated: number
  age: Record<AgeKey, number>
  gender: Record<GenderKey, number>
  ownParty: number
  urban: number
  rural: number
  undecided: number
  trends: {
    overall: SegTrend[]
    age: Record<AgeKey, SegTrend[]>
    gender: Record<GenderKey, SegTrend[]>
    ownParty: SegTrend[]
  }
}

export type MinisterKey = "defense" | "finance" | "justice" | "foreign"

export interface Minister {
  name: string
  loyalty: number
  trend: number[]
  status: "active" | "resigned"
  lastReason?: string
}

export interface Legacy {
  bestIndex: number
  bestTitle: "Visionary Leader" | "Respected Statesman" | "Pragmatic Politician" | "Disgraced Official" | null
  history: Array<{ t: number; index: number }>
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
  usedHeadlines: UsedHeadlines
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
  exitPoll: ExitPoll
  initExitPoll: () => void
  applyExitPollDelta: (
    d: Partial<{
      age: Partial<Record<AgeKey, number>>
      gender: Partial<Record<GenderKey, number>>
      ownParty: number
      urban: number
      rural: number
      undecided: number
      overall: number
    }>,
  ) => void
  cabinet: Record<MinisterKey, Minister>
  initCabinet: () => void
  bumpLoyalty: (k: MinisterKey, delta: number, reason?: string) => void
  maybeResign: (k: MinisterKey) => void
  shuffleCabinet: () => void
  cabinetShuffleModal: { open: boolean; ministerName: string; ministerKey: MinisterKey } | null
  openCabinetShuffleModal: (ministerName: string, ministerKey: MinisterKey) => void
  closeCabinetShuffleModal: () => void
  legacy: Legacy
  computeLegacyIndex: (ctx: {
    approval: number
    power: number
    standing: number
    economy: { gdp: number; unemp: number }
  }) => number
  saveLegacyIfBest: (index: number, title: Legacy["bestTitle"]) => void
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
  markHeadlineUsed: (headline: string) => void
  isHeadlineUsed: (headline: string) => boolean
}

function clampEcon(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

function loadLegacyFromStorage(): { bestIndex: number; bestTitle: Legacy["bestTitle"] } {
  if (typeof window === "undefined") return { bestIndex: 0, bestTitle: null }
  try {
    const stored = localStorage.getItem("pp_legacy_best")
    if (stored) {
      const parsed = JSON.parse(stored)
      return { bestIndex: parsed.bestIndex || 0, bestTitle: parsed.bestTitle || null }
    }
  } catch (e) {
    console.error("[v0] Failed to load legacy from localStorage:", e)
  }
  return { bestIndex: 0, bestTitle: null }
}

export const useGameStore = create<GameState>((set, get) => ({
  stats: {
    approval: 50,
    power: 50,
    standing: 50,
  },
  isGameOver: false,
  gameResult: null,
  termSecondsTotal: 120,
  termSecondsLeft: 120,
  termStarted: false,
  termOver: false,
  policyLog: [],
  worldEvents: [],
  usedHeadlines: {
    headlines: [],
    maxHistory: 15, // Track last 15 headlines to prevent repetition
  },
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
  exitPoll: {
    sample: 5000,
    moe: 2.3,
    lastUpdated: Date.now(),
    age: {
      "18_30": 48,
      "31_60": 52,
      "60_80": 54,
      "80_plus": 51,
    },
    gender: {
      male: 50,
      female: 51,
      other: 49,
    },
    ownParty: 55,
    urban: 49,
    rural: 53,
    undecided: 18,
    trends: {
      overall: [{ t: 0, value: 50 }],
      age: {
        "18_30": [{ t: 0, value: 48 }],
        "31_60": [{ t: 0, value: 52 }],
        "60_80": [{ t: 0, value: 54 }],
        "80_plus": [{ t: 0, value: 51 }],
      },
      gender: {
        male: [{ t: 0, value: 50 }],
        female: [{ t: 0, value: 51 }],
        other: [{ t: 0, value: 49 }],
      },
      ownParty: [{ t: 0, value: 55 }],
    },
  },
  initExitPoll: () => {
    set({
      exitPoll: {
        sample: 5000,
        moe: 2.3,
        lastUpdated: Date.now(),
        age: {
          "18_30": 48,
          "31_60": 52,
          "60_80": 54,
          "80_plus": 51,
        },
        gender: {
          male: 50,
          female: 51,
          other: 49,
        },
        ownParty: 55,
        urban: 49,
        rural: 53,
        undecided: 18,
        trends: {
          overall: [{ t: 0, value: 50 }],
          age: {
            "18_30": [{ t: 0, value: 48 }],
            "31_60": [{ t: 0, value: 52 }],
            "60_80": [{ t: 0, value: 54 }],
            "80_plus": [{ t: 0, value: 51 }],
          },
          gender: {
            male: [{ t: 0, value: 50 }],
            female: [{ t: 0, value: 51 }],
            other: [{ t: 0, value: 49 }],
          },
          ownParty: [{ t: 0, value: 55 }],
        },
      },
    })
  },
  applyExitPollDelta: (d) => {
    set((state) => {
      const currentTime = state.termSecondsTotal - state.termSecondsLeft
      const newPoll = { ...state.exitPoll }

      // Update age groups
      if (d.age) {
        for (const key of Object.keys(d.age) as AgeKey[]) {
          const delta = d.age[key]
          if (delta !== undefined) {
            newPoll.age[key] = Math.max(0, Math.min(100, newPoll.age[key] + delta))
            newPoll.trends.age[key] = [...newPoll.trends.age[key], { t: currentTime, value: newPoll.age[key] }].slice(
              -40,
            )
          }
        }
      }

      // Update gender
      if (d.gender) {
        for (const key of Object.keys(d.gender) as GenderKey[]) {
          const delta = d.gender[key]
          if (delta !== undefined) {
            newPoll.gender[key] = Math.max(0, Math.min(100, newPoll.gender[key] + delta))
            newPoll.trends.gender[key] = [
              ...newPoll.trends.gender[key],
              { t: currentTime, value: newPoll.gender[key] },
            ].slice(-40)
          }
        }
      }

      // Update own party
      if (d.ownParty !== undefined) {
        newPoll.ownParty = Math.max(0, Math.min(100, newPoll.ownParty + d.ownParty))
        newPoll.trends.ownParty = [...newPoll.trends.ownParty, { t: currentTime, value: newPoll.ownParty }].slice(-40)
      }

      // Update urban/rural/undecided
      if (d.urban !== undefined) {
        newPoll.urban = Math.max(0, Math.min(100, newPoll.urban + d.urban))
      }
      if (d.rural !== undefined) {
        newPoll.rural = Math.max(0, Math.min(100, newPoll.rural + d.rural))
      }
      if (d.undecided !== undefined) {
        newPoll.undecided = Math.max(0, Math.min(100, newPoll.undecided + d.undecided))
      }

      // Update overall trend
      if (d.overall !== undefined) {
        const avgAge = (newPoll.age["18_30"] + newPoll.age["31_60"] + newPoll.age["60_80"] + newPoll.age["80_plus"]) / 4
        const overall = Math.max(0, Math.min(100, avgAge + d.overall))
        newPoll.trends.overall = [...newPoll.trends.overall, { t: currentTime, value: overall }].slice(-40)
      }

      // Update MOE with jitter
      newPoll.moe = 2.3 + (Math.random() * 0.8 - 0.4)
      newPoll.lastUpdated = Date.now()

      return { exitPoll: newPoll }
    })
  },
  cabinet: {
    defense: { name: "Sec. R. Hayes", loyalty: 60, trend: [60], status: "active" },
    finance: { name: "Min. V. Patel", loyalty: 60, trend: [60], status: "active" },
    justice: { name: "AG L. Romero", loyalty: 60, trend: [60], status: "active" },
    foreign: { name: "FM A. Chen", loyalty: 60, trend: [60], status: "active" },
  },
  initCabinet: () => {
    set({
      cabinet: {
        defense: { name: "Sec. R. Hayes", loyalty: 60, trend: [60], status: "active" },
        finance: { name: "Min. V. Patel", loyalty: 60, trend: [60], status: "active" },
        justice: { name: "AG L. Romero", loyalty: 60, trend: [60], status: "active" },
        foreign: { name: "FM A. Chen", loyalty: 60, trend: [60], status: "active" },
      },
    })
  },
  bumpLoyalty: (k, delta, reason) => {
    set((state) => {
      const minister = state.cabinet[k]
      const newLoyalty = Math.max(0, Math.min(100, minister.loyalty + delta))
      const newTrend = [...minister.trend, newLoyalty].slice(-40)

      return {
        cabinet: {
          ...state.cabinet,
          [k]: {
            ...minister,
            loyalty: newLoyalty,
            trend: newTrend,
            lastReason: reason || minister.lastReason,
          },
        },
      }
    })
  },
  maybeResign: (k) => {
    const minister = get().cabinet[k]
    if (minister.loyalty < 40 && minister.status === "active") {
      set((state) => ({
        cabinet: {
          ...state.cabinet,
          [k]: {
            ...minister,
            status: "resigned",
          },
        },
      }))
      get().openCabinetShuffleModal(minister.name, k)
    }
  },
  shuffleCabinet: () => {
    const modalState = get().cabinetShuffleModal
    if (!modalState) return

    const k = modalState.ministerKey
    const newLoyalty = 58 + Math.floor(Math.random() * 8)

    set((state) => ({
      cabinet: {
        ...state.cabinet,
        [k]: {
          ...state.cabinet[k],
          loyalty: newLoyalty,
          trend: [...state.cabinet[k].trend, newLoyalty].slice(-40),
          status: "active",
          lastReason: "New appointee",
        },
      },
    }))

    get().closeCabinetShuffleModal()
  },
  cabinetShuffleModal: null,
  openCabinetShuffleModal: (ministerName, ministerKey) => {
    set({ cabinetShuffleModal: { open: true, ministerName, ministerKey } })
  },
  closeCabinetShuffleModal: () => {
    set({ cabinetShuffleModal: null })
  },
  legacy: {
    ...loadLegacyFromStorage(),
    history: [],
  },
  computeLegacyIndex: (ctx) => {
    const avgStats = (ctx.approval + ctx.power + ctx.standing) / 3
    const gdpBonus = ((ctx.economy.gdp - 70) / (140 - 70)) * 40
    const unempPenalty = ((ctx.economy.unemp - 2) / (20 - 2)) * 20
    const index = avgStats * 0.6 + gdpBonus - unempPenalty
    return Math.max(0, Math.min(100, index))
  },
  saveLegacyIfBest: (index, title) => {
    const state = get()
    const currentTime = state.termSecondsTotal - state.termSecondsLeft

    const newHistory = [...state.legacy.history, { t: currentTime, index }].slice(-40)

    if (index > state.legacy.bestIndex) {
      set({
        legacy: {
          bestIndex: index,
          bestTitle: title,
          history: newHistory,
        },
      })

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("pp_legacy_best", JSON.stringify({ bestIndex: index, bestTitle: title }))
        } catch (e) {
          console.error("[v0] Failed to save legacy to localStorage:", e)
        }
      }
    } else {
      set({
        legacy: {
          ...state.legacy,
          history: newHistory,
        },
      })
    }
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
    get().initExitPoll()
    get().initCabinet()
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
      termSecondsLeft: 120,
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
      exitPoll: {
        sample: 5000,
        moe: 2.3,
        lastUpdated: Date.now(),
        age: {
          "18_30": 48,
          "31_60": 52,
          "60_80": 54,
          "80_plus": 51,
        },
        gender: {
          male: 50,
          female: 51,
          other: 49,
        },
        ownParty: 55,
        urban: 49,
        rural: 53,
        undecided: 18,
        trends: {
          overall: [{ t: 0, value: 50 }],
          age: {
            "18_30": [{ t: 0, value: 48 }],
            "31_60": [{ t: 0, value: 52 }],
            "60_80": [{ t: 0, value: 54 }],
            "80_plus": [{ t: 0, value: 51 }],
          },
          gender: {
            male: [{ t: 0, value: 50 }],
            female: [{ t: 0, value: 51 }],
            other: [{ t: 0, value: 49 }],
          },
          ownParty: [{ t: 0, value: 55 }],
        },
      },
    })
    get().initEconomy()
    get().initForeignOpinions()
    get().initExitPoll()
    get().initCabinet()
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
    get().markHeadlineUsed(headline)
  },
  removeWorldEvent: (id) => {
    set((state) => ({
      worldEvents: state.worldEvents.filter((e) => e.id !== id),
    }))
  },
  clearWorldEvents: () => {
    set({ worldEvents: [] })
  },
  markHeadlineUsed: (headline) => {
    set((state) => {
      const newHeadlines = [...state.usedHeadlines.headlines, headline].slice(-state.usedHeadlines.maxHistory)
      return {
        usedHeadlines: {
          ...state.usedHeadlines,
          headlines: newHeadlines,
        },
      }
    })
  },
  isHeadlineUsed: (headline) => {
    return get().usedHeadlines.headlines.includes(headline)
  },
}))
