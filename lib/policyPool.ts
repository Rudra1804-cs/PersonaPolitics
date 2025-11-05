import type { Difficulty } from "./games/types"

export interface PolicyCard {
  id: string
  title: string
  description: string
  difficulty: Difficulty
  type: "economic" | "defense" | "social" | "diplomatic" | "education" | "security" | "environment" | "technology"
  nextOnApprove?: string[]
  nextOnReject?: string[]
  used: boolean
}

export const POLICY_POOL: PolicyCard[] = [
  // Initial cards
  {
    id: "infrastructure",
    title: "Infrastructure Deal",
    description: "A massive $2 trillion investment in roads, bridges, and public transit.",
    difficulty: "hard",
    type: "economic",
    nextOnApprove: ["fuel_tax", "green_energy"],
    nextOnReject: ["investor_withdrawal", "private_partnership"],
    used: false,
  },
  {
    id: "military",
    title: "Military Spending",
    description: "Increase defense budget by 15% to modernize armed forces.",
    difficulty: "hard",
    type: "defense",
    nextOnApprove: ["defense_contracts", "military_expansion"],
    nextOnReject: ["peace_dividend", "nato_concerns"],
    used: false,
  },
  {
    id: "justice",
    title: "Criminal Justice Reform",
    description: "Comprehensive reform including sentencing guidelines and police accountability.",
    difficulty: "hard",
    type: "social",
    nextOnApprove: ["police_training", "prison_reform"],
    nextOnReject: ["law_order", "police_union"],
    used: false,
  },

  // Economy Category
  {
    id: "fuel_tax",
    title: "Raise Fuel Tax",
    description: "Increase fuel tax by 10 cents to fund infrastructure maintenance.",
    difficulty: "medium",
    type: "economic",
    used: false,
  },
  {
    id: "green_energy",
    title: "Green Energy Initiative",
    description: "Massive investment in renewable energy infrastructure.",
    difficulty: "hard",
    type: "economic",
    used: false,
  },
  {
    id: "tax_reform",
    title: "Progressive Tax Reform",
    description: "Raise taxes on top earners to fund social programs.",
    difficulty: "hard",
    type: "economic",
    used: false,
  },
  {
    id: "stimulus",
    title: "Economic Stimulus Package",
    description: "Direct payments to citizens to boost domestic spending.",
    difficulty: "medium",
    type: "economic",
    used: false,
  },
  {
    id: "trade_deal",
    title: "Regional Trade Pact",
    description: "Sign comprehensive trade agreement with neighboring countries.",
    difficulty: "medium",
    type: "economic",
    used: false,
  },
  {
    id: "inflation_control",
    title: "Inflation Control Measures",
    description: "Implement price controls on essential goods to combat rising costs.",
    difficulty: "hard",
    type: "economic",
    used: false,
  },
  {
    id: "minimum_wage",
    title: "Raise Minimum Wage",
    description: "Increase minimum wage by 10% to boost worker income.",
    difficulty: "medium",
    type: "economic",
    used: false,
  },

  // Defense Category
  {
    id: "defense_contracts",
    title: "Defense Contractor Deal",
    description: "Award major contracts to domestic defense manufacturers.",
    difficulty: "medium",
    type: "defense",
    used: false,
  },
  {
    id: "military_expansion",
    title: "Overseas Base Expansion",
    description: "Establish new military bases in strategic locations.",
    difficulty: "hard",
    type: "defense",
    used: false,
  },
  {
    id: "conscription",
    title: "Mandatory Military Service",
    description: "Introduce 2-year conscription for all citizens aged 18-25.",
    difficulty: "hard",
    type: "defense",
    used: false,
  },
  {
    id: "arms_deal",
    title: "International Arms Sale",
    description: "Approve sale of advanced weapons to allied nations.",
    difficulty: "medium",
    type: "defense",
    used: false,
  },
  {
    id: "border_security",
    title: "Secure Borders Initiative",
    description: "Increase military funding to secure national borders.",
    difficulty: "medium",
    type: "defense",
    used: false,
  },

  // Education Category
  {
    id: "free_college",
    title: "Free College Tuition",
    description: "Make public universities tuition-free for all citizens.",
    difficulty: "hard",
    type: "education",
    used: false,
  },
  {
    id: "student_debt",
    title: "Student Debt Relief",
    description: "Cancel up to $50,000 in student loan debt per borrower.",
    difficulty: "hard",
    type: "education",
    used: false,
  },
  {
    id: "teacher_pay",
    title: "Increase Teacher Salaries",
    description: "Raise teacher pay by 20% to attract quality educators.",
    difficulty: "medium",
    type: "education",
    used: false,
  },
  {
    id: "curriculum_reform",
    title: "National Curriculum Standards",
    description: "Implement standardized curriculum across all public schools.",
    difficulty: "medium",
    type: "education",
    used: false,
  },
  {
    id: "research_grants",
    title: "University Research Funding",
    description: "Increase grants for scientific research at universities.",
    difficulty: "medium",
    type: "education",
    used: false,
  },

  // Social Category
  {
    id: "healthcare_reform",
    title: "Universal Healthcare",
    description: "Launch free healthcare for all citizens.",
    difficulty: "hard",
    type: "social",
    used: false,
  },
  {
    id: "police_training",
    title: "Police Training Reform",
    description: "Mandate de-escalation training and body cameras nationwide.",
    difficulty: "medium",
    type: "social",
    used: false,
  },
  {
    id: "prison_reform",
    title: "Prison System Overhaul",
    description: "Reduce sentences and improve rehabilitation programs.",
    difficulty: "hard",
    type: "social",
    used: false,
  },
  {
    id: "housing_subsidies",
    title: "Affordable Housing Program",
    description: "Subsidize housing for low-income families.",
    difficulty: "medium",
    type: "social",
    used: false,
  },
  {
    id: "gender_equality",
    title: "Gender Pay Equity Act",
    description: "Mandate equal pay for equal work across all industries.",
    difficulty: "medium",
    type: "social",
    used: false,
  },
  {
    id: "immigration_reform",
    title: "Immigration Policy Reform",
    description: "Create pathway to citizenship for undocumented immigrants.",
    difficulty: "hard",
    type: "social",
    used: false,
  },

  // Security Category
  {
    id: "surveillance",
    title: "Expand Surveillance Programs",
    description: "Increase government surveillance to combat terrorism.",
    difficulty: "hard",
    type: "security",
    used: false,
  },
  {
    id: "cyber_defense",
    title: "National Cyber Defense",
    description: "Invest in cybersecurity infrastructure to protect against attacks.",
    difficulty: "medium",
    type: "security",
    used: false,
  },
  {
    id: "counterterrorism",
    title: "Counterterrorism Funding",
    description: "Increase funding for intelligence and counterterrorism operations.",
    difficulty: "medium",
    type: "security",
    used: false,
  },
  {
    id: "privacy_protection",
    title: "Digital Privacy Act",
    description: "Strengthen privacy protections and limit data collection.",
    difficulty: "medium",
    type: "security",
    used: false,
  },
  {
    id: "policing_reform",
    title: "Community Policing Initiative",
    description: "Shift focus from enforcement to community engagement.",
    difficulty: "medium",
    type: "security",
    used: false,
  },

  // International Relations Category
  {
    id: "nato_concerns",
    title: "NATO Commitment Review",
    description: "Allies express concern over reduced defense spending.",
    difficulty: "hard",
    type: "diplomatic",
    used: false,
  },
  {
    id: "sanctions",
    title: "Economic Sanctions",
    description: "Impose sanctions on nations violating human rights.",
    difficulty: "medium",
    type: "diplomatic",
    used: false,
  },
  {
    id: "alliance",
    title: "New Strategic Alliance",
    description: "Form military and economic alliance with regional powers.",
    difficulty: "hard",
    type: "diplomatic",
    used: false,
  },
  {
    id: "humanitarian_aid",
    title: "International Aid Package",
    description: "Provide humanitarian assistance to crisis-affected regions.",
    difficulty: "medium",
    type: "diplomatic",
    used: false,
  },
  {
    id: "treaty",
    title: "Climate Treaty Ratification",
    description: "Ratify international climate agreement with binding targets.",
    difficulty: "hard",
    type: "diplomatic",
    used: false,
  },
  {
    id: "peace_dividend",
    title: "Peace Dividend Program",
    description: "Redirect military spending to social programs.",
    difficulty: "medium",
    type: "diplomatic",
    used: false,
  },

  // Environment Category
  {
    id: "carbon_tax",
    title: "Carbon Tax on Industries",
    description: "Introduce carbon tax on heavy industries to reduce emissions.",
    difficulty: "hard",
    type: "environment",
    used: false,
  },
  {
    id: "renewable_power",
    title: "Renewable Energy Expansion",
    description: "Expand renewable power plants by 20% nationwide.",
    difficulty: "medium",
    type: "environment",
    used: false,
  },
  {
    id: "emission_limits",
    title: "Strict Emission Standards",
    description: "Implement aggressive emission limits for vehicles and factories.",
    difficulty: "hard",
    type: "environment",
    used: false,
  },
  {
    id: "green_tech",
    title: "Green Technology Incentives",
    description: "Provide tax breaks for companies developing clean technology.",
    difficulty: "medium",
    type: "environment",
    used: false,
  },
  {
    id: "conservation",
    title: "National Park Expansion",
    description: "Protect additional wilderness areas as national parks.",
    difficulty: "medium",
    type: "environment",
    used: false,
  },

  // Technology Category
  {
    id: "ai_regulation",
    title: "AI Weapons Ban",
    description: "Ban development of autonomous AI weapons systems.",
    difficulty: "hard",
    type: "technology",
    used: false,
  },
  {
    id: "startup_funding",
    title: "Tech Startup Grants",
    description: "Provide government funding for technology startups.",
    difficulty: "medium",
    type: "technology",
    used: false,
  },
  {
    id: "internet_censorship",
    title: "Internet Regulation Act",
    description: "Implement content moderation and censorship online.",
    difficulty: "hard",
    type: "technology",
    used: false,
  },
  {
    id: "innovation_hubs",
    title: "National Innovation Centers",
    description: "Build technology innovation hubs in major cities.",
    difficulty: "medium",
    type: "technology",
    used: false,
  },
  {
    id: "space_research",
    title: "Space Exploration Program",
    description: "Fund space research collaboration with international allies.",
    difficulty: "hard",
    type: "technology",
    used: false,
  },
  {
    id: "broadband",
    title: "Rural Broadband Expansion",
    description: "Bring high-speed internet to underserved rural areas.",
    difficulty: "medium",
    type: "technology",
    used: false,
  },

  // Additional variety cards
  {
    id: "investor_withdrawal",
    title: "Foreign Investor Bailout",
    description: "Investors pull out, offering new bailout terms with strings attached.",
    difficulty: "hard",
    type: "diplomatic",
    used: false,
  },
  {
    id: "private_partnership",
    title: "Private-Public Partnership",
    description: "Allow private companies to build and operate infrastructure.",
    difficulty: "medium",
    type: "economic",
    used: false,
  },
  {
    id: "law_order",
    title: "Law and Order Campaign",
    description: "Increase police funding and toughen sentencing laws.",
    difficulty: "medium",
    type: "security",
    used: false,
  },
  {
    id: "police_union",
    title: "Police Union Negotiations",
    description: "Unions demand concessions after reform rejection.",
    difficulty: "hard",
    type: "social",
    used: false,
  },
]

export function getInitialCards(): PolicyCard[] {
  return POLICY_POOL.filter((p) => ["infrastructure", "military", "justice"].includes(p.id)).map((p) => ({
    ...p,
    used: false,
  }))
}

export function getNextCard(
  currentCardId: string,
  decision: "approve" | "reject",
  usedCardIds: string[],
): PolicyCard | null {
  const currentCard = POLICY_POOL.find((p) => p.id === currentCardId)
  if (!currentCard) return null

  const nextIds = decision === "approve" ? currentCard.nextOnApprove : currentCard.nextOnReject

  if (nextIds && nextIds.length > 0) {
    const availableNextCards = nextIds
      .map((id) => POLICY_POOL.find((p) => p.id === id))
      .filter((p): p is PolicyCard => p !== undefined && !usedCardIds.includes(p.id))

    if (availableNextCards.length > 0) {
      const randomCard = availableNextCards[Math.floor(Math.random() * availableNextCards.length)]
      return { ...randomCard, used: false }
    }
  }

  const sameTypeCards = POLICY_POOL.filter(
    (p) => p.type === currentCard.type && p.id !== currentCardId && !usedCardIds.includes(p.id),
  )

  if (sameTypeCards.length > 0) {
    const randomCard = sameTypeCards[Math.floor(Math.random() * sameTypeCards.length)]
    return { ...randomCard, used: false }
  }

  const anyUnusedCard = POLICY_POOL.filter((p) => p.id !== currentCardId && !usedCardIds.includes(p.id))

  if (anyUnusedCard.length > 0) {
    const randomCard = anyUnusedCard[Math.floor(Math.random() * anyUnusedCard.length)]
    return { ...randomCard, used: false }
  }

  return null
}
