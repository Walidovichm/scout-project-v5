// Scout — Mock intelligence database
// Implements the Knowledge Graph entity model from Part VI of the PRD.
// All data is illustrative for product demonstration.

export type ConfidenceLevel = "Confirmed" | "High" | "Moderate" | "Low";
export type ConnectionStrength = "Low" | "Moderate" | "High" | "Critical";
export type EntityType =
  | "company"
  | "government"
  | "investor"
  | "country"
  | "supplier"
  | "regulator"
  | "fund";

export interface EntityNode {
  id: string;
  name: string;
  type: EntityType;
  country?: string;
  descriptor?: string;
}

export interface ConnectionEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type:
    | "owns"
    | "funds"
    | "regulates"
    | "supplies"
    | "located_in"
    | "receives_grant_from"
    | "procures_from"
    | "manufactures_in"
    | "competes_with"
    | "partners_with";
  strength: ConnectionStrength;
  confidence: ConfidenceLevel;
  description: string;
  evidence?: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  year: number;
  title: string;
  category:
    | "Funding"
    | "Government"
    | "Regulation"
    | "Acquisition"
    | "Supply Chain"
    | "Leadership"
    | "Strategy"
    | "Sanctions";
  description: string;
  source: { name: string; type: string; date: string };
}

export interface Company {
  id: string;
  name: string;
  logo: string; // primary logo URL (SimpleIcons SVG or Clearbit PNG)
  logoFallback?: string; // secondary logo URL (Clearbit) if primary fails
  brandColor?: string; // hex color (without #) for monochrome SVG tinting via CSS mask
  country: string;
  countryCode: string;
  sector: string;
  tagline: string;
  heroQuote: string;
  founded: number;
  employees: string;
  headquarters: string;
  ceo: string;
  marketCap?: string;
  ownershipType: string;
  politicalFootprint: number; // alias for scoutIndex (backward compat)
  scoutIndex: number; // 0–100, computed via power-mean formula
  scoutIndexTier: "Low" | "Moderate" | "Elevated" | "High" | "Critical";
  scoutIndexConfidence: number; // ±band
  scoutIndexPillars: {
    id: "strategic" | "political" | "fragility";
    label: string;
    question: string;
    score: number;
    weight: number;
    dimensions: { label: string; score: number; weight: number }[];
  }[];
  footprintDimensions: {
    label: string;
    score: number;
    description: string;
  }[];
  keyInsights: { title: string; description: string }[];
  quickFacts: { label: string; value: string }[];
  connections: ConnectionEdge[];
  entities: Record<string, EntityNode>;
  moneyJourney: {
    step: string;
    detail: string;
    confidence: ConfidenceLevel;
    percentage?: number;
  }[];
  timeline: TimelineEvent[];
  intelligenceReport: {
    executiveSummary: string;
    politicalContext: string;
    financialRelationships: string;
    governmentRelations: string;
    globalDependencies: string;
    strategicRisks: string;
    futureWatchpoints: string;
  };
  sources: { name: string; type: string; date: string; tier: 1 | 2 | 3 | 4 }[];
  editorial?: {
    governingQuestion: string;
    governingAnswer: string;
    pillarNarratives: { strategic: string; political: string; fragility: string };
    supportingInsights: { title: string; detail: string }[];
  };
}


// Scout — Real company dataset (50 companies)
// Re-exported from the auto-generated file.
import { companies as ALL_COMPANIES, companiesByCategory } from "./companies-data";

export const companies: Company[] = ALL_COMPANIES;

export function getCompany(id: string): Company | undefined {
  return companies.find((c) => c.id === id);
}

export { companiesByCategory };

// Trending — mix of well-known + strategically significant companies
export const trendingCompanies = [
  "Apple",
  "NVIDIA",
  "TikTok",
  "Tesla",
  "Saudi Aramco",
  "TSMC",
  "BlackRock",
  "ByteDance",
  "Huawei",
  "Starbucks",
  "LVMH",
  "Boeing",
];

export const discoverThemes = [
  {
    id: "ai-infrastructure",
    title: "AI Infrastructure",
    description:
      "Companies providing compute, semiconductors, memory and data centre infrastructure for the AI race — the most strategically significant supply chain of the decade.",
    companies: ["nvidia-corporation", "tsmc-taiwan-semiconductor", "asml-holding-n-v", "microsoft-corporation", "alphabet-inc-google", "amazon-com-inc", "meta-platforms-inc"],
    accent: "terra",
  },
  {
    id: "us-china-decoupling",
    title: "U.S.–China Technology Decoupling",
    description:
      "Companies at the frontline of U.S.–China strategic competition — subject to export controls, sanctions, forced divestitures or retaliatory regulation.",
    companies: ["apple-inc", "nvidia-corporation", "huawei-technologies-co-ltd", "bytedance-ltd-tiktok", "tsmc-taiwan-semiconductor", "asml-holding-n-v", "tencent-holdings-ltd", "alibaba-group-holding-ltd"],
    accent: "terra",
  },
  {
    id: "critical-minerals",
    title: "Critical Minerals & Battery Supply Chains",
    description:
      "Companies exposed to lithium, cobalt, nickel, rare earths and battery cell manufacturing — the bottlenecks of the energy transition.",
    companies: ["tesla-inc", "byd-company-ltd", "glencore-plc", "bhp-group-ltd", "catl-contemporary-amperex"],
    accent: "terra",
  },
  {
    id: "sovereign-backed",
    title: "Sovereign-Backed Strategic Assets",
    description:
      "Companies where governments hold direct ownership stakes — blending corporate strategy with state priorities.",
    companies: ["saudi-aramco", "petrochina-company-ltd", "airbus-se", "volkswagen-group", "tsmc-taiwan-semiconductor", "huawei-technologies-co-ltd"],
    accent: "terra",
  },
  {
    id: "defence",
    title: "Defence & Aerospace",
    description:
      "Companies powering the rearmament of Europe, the U.S. and Asian allies — major beneficiaries of post-2022 defence spending surges.",
    companies: ["lockheed-martin-corporation", "rtx-corporation-raytheon", "airbus-se", "the-boeing-company"],
    accent: "terra",
  },
  {
    id: "consumer-transparency",
    title: "What Your Purchase Funds",
    description:
      "Everyday consumer brands whose purchases link you to global asset managers, sovereign wealth funds and complex supply chains.",
    companies: ["starbucks-corporation", "mcdonalds-corporation", "nike-inc", "the-coca-cola-company", "pepsico-inc", "nestle-s-a", "inter-ikea-group", "lvmh-moet-hennessy-louis"],
    accent: "terra",
  },
  {
    id: "pharma-strategic",
    title: "Strategic Pharmaceuticals",
    description:
      "Companies producing medicines, vaccines and diagnostics deemed critical to national health security — subject to price negotiation and stockpiling.",
    companies: ["pfizer-inc", "johnson-johnson", "novo-nordisk-a-s", "roche-holding-ag", "astrazeneca-plc", "bayer-ag"],
    accent: "terra",
  },
  {
    id: "energy-transition",
    title: "Energy & Transition",
    description:
      "Oil majors, LNG traders and energy companies navigating the political economy of climate transition, sanctions and OPEC+ dynamics.",
    companies: ["saudi-aramco", "exxonmobil-corporation", "shell-plc", "totalenergies-se", "petrochina-company-ltd"],
    accent: "terra",
  },
];
