"use client";

import { Company } from "@/lib/data";
import { companies } from "@/lib/companies-data";
import { useScout } from "@/lib/store";
import { useWatchlist } from "@/lib/watchlist-store";
import { CompanyLogo } from "./company-logo";
import { ArrowRight, Eye, EyeOff, ChevronDown, Sparkles, MapPin, ArrowDown } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { COUNTRY_FLAGS, getFlag, renderWithFlags } from "@/lib/flags";

// ─────────────────────────────────────────────────────────────────────────────
// Editorial content is now auto-generated in the Python converter and stored
// in company.editorial. The hardcoded EDITORIAL dict has been removed.
// ─────────────────────────────────────────────────────────────────────────────

const TIER_SPECTRUM = [
  { label: "Low", range: [0, 24], color: "var(--muted-foreground)" },
  { label: "Moderate", range: [25, 49], color: "var(--muted-foreground)" },
  { label: "Elevated", range: [50, 69], color: "var(--terra)" },
  { label: "High", range: [70, 84], color: "var(--terra)" },
  { label: "Critical", range: [85, 100], color: "var(--ink)" },
];

export function CompanyScreenV2({ company }: { company: Company }) {
  const { go } = useScout();
  const { watched, toggleWatch } = useWatchlist();
  const isWatched = watched.includes(company.id);
  const editorial = company.editorial || {
    governingQuestion: `What makes ${company.name} geopolitically significant?`,
    governingAnswer: `${company.name} operates at the intersection of commerce and geopolitics. The Scout Index decomposes why — across strategic significance, political embeddedness, and fragility.`,
    pillarNarratives: {
      strategic: "Strategically significant",
      political: "Politically connected",
      fragility: "Exposure to disruption",
    },
    supportingInsights: [],
  };

  // Find tier neighbours (same tier, closest scores)
  const tierNeighbours = companies
    .filter(
      (c) =>
        c.id !== company.id &&
        c.scoutIndexTier === company.scoutIndexTier
    )
    .sort((a, b) => Math.abs(a.scoutIndex - company.scoutIndex) - Math.abs(b.scoutIndex - company.scoutIndex))
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-32 pt-8 sm:px-6 sm:pt-12">
      {/* Breadcrumb + Watch toggle */}
      <div className="mb-8 flex items-center justify-between text-[12px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <button onClick={() => go({ kind: "search" })} className="hover:text-foreground">
            Search
          </button>
          <span className="text-border">/</span>
          <span className="text-foreground">{company.name}</span>
        </div>
        <button
          onClick={() => toggleWatch(company.id)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] transition-all",
            isWatched
              ? "border-terra/40 bg-terra-soft/30 text-foreground"
              : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground"
          )}
        >
          {isWatched ? <Eye className="h-3.5 w-3.5 text-terra" /> : <EyeOff className="h-3.5 w-3.5" />}
          {isWatched ? "Watching" : "Watch"}
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          ACT 1 — THE VERDICT STRIP
          Logo, name, sector — but Scout Index as a position on a spectrum
          with tier neighbours visible
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="animate-fade-up">
        {/* Identity row */}
        <div className="mb-6 flex items-center gap-4">
          <CompanyLogo
            name={company.name}
            src={company.logo}
            fallbackSrc={company.logoFallback}
            brandColor={company.brandColor}
            size="lg"
            rounded="lg"
          />
          <div>
            <h1 className="font-serif text-[36px] font-medium leading-none tracking-tight sm:text-[48px]">
              {company.name}
            </h1>
            <div className="mt-2 flex items-center gap-2 text-[13px] text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {company.country} <span className="text-[0.9em]">{COUNTRY_FLAGS[company.country] || COUNTRY_FLAGS[company.countryCode] || ""}</span>
              <span className="text-border">·</span>
              {company.sector}
            </div>
          </div>
        </div>

        {/* Spectrum bar */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="editorial-eyebrow text-muted-foreground">Scout Index</span>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-[32px] font-medium tabular-nums leading-none">
                {company.scoutIndex}
              </span>
              <span className="text-[13px] text-muted-foreground">/ 100</span>
              <span
                className="ml-1 rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider"
                style={{
                  backgroundColor: `color-mix(in oklch, ${company.scoutIndexTier === "Critical" ? "var(--ink)" : "var(--terra)"} 15%, transparent)`,
                  color: company.scoutIndexTier === "Critical" ? "var(--ink)" : "var(--terra)",
                }}
              >
                {company.scoutIndexTier}
              </span>
            </div>
          </div>

          {/* Spectrum visualization */}
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
            {TIER_SPECTRUM.map((tier, i) => (
              <div
                key={tier.label}
                className="absolute h-full"
                style={{
                  left: `${tier.range[0]}%`,
                  width: `${tier.range[1] - tier.range[0]}%`,
                  backgroundColor: `color-mix(in oklch, ${tier.color} 12%, transparent)`,
                }}
              />
            ))}
            {/* Marker */}
            <div
              className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background"
              style={{
                left: `${company.scoutIndex}%`,
                backgroundColor: company.scoutIndexTier === "Critical" ? "var(--ink)" : "var(--terra)",
              }}
            />
          </div>

          {/* Tier labels */}
          <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground/60">
            {TIER_SPECTRUM.map((tier) => (
              <span key={tier.label}>{tier.label}</span>
            ))}
          </div>

          {/* Tier neighbours */}
          {tierNeighbours.length > 0 && (
            <div className="mt-4 border-t border-border/60 pt-3">
              <span className="editorial-eyebrow text-[10px] text-muted-foreground">
                Similarly embedded
              </span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {tierNeighbours.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => go({ kind: "company-mock", id: n.id })}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/40 px-2.5 py-1 text-[11.5px] text-foreground/80 transition-colors hover:border-foreground/30 hover:text-foreground"
                  >
                    <CompanyLogo
                      name={n.name}
                      src={n.logo}
                      fallbackSrc={n.logoFallback}
                      brandColor={n.brandColor}
                      size="sm"
                      rounded="full"
                    />
                    {n.name.length > 20 ? n.name.slice(0, 18) + "…" : n.name}
                    <span className="text-[0.9em]">{COUNTRY_FLAGS[n.country] || COUNTRY_FLAGS[n.countryCode] || ""}</span>
                    <span className="tabular-nums text-muted-foreground">{n.scoutIndex}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Why this score — at the end of the Scout Index section, no separator */}
        <div className="mt-5">
          <WhyThisScore company={company} editorial={editorial} />
        </div>
      </section>

      <div className="my-10 h-px bg-border" />

      {/* ═══════════════════════════════════════════════════════════════════
          ACT 2 — THE GOVERNING QUESTION
          One dominant question, answered in 2-3 sentences,
          with supporting insights as expandable evidence
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
        <div className="editorial-eyebrow mb-3 text-terra">The governing question</div>
        <h2 className="editorial-title text-[26px] leading-tight text-foreground sm:text-[32px]">
          {editorial.governingQuestion}
        </h2>
        <p className="editorial-lead mt-4 text-[19px] leading-relaxed text-foreground/85 sm:text-[21px]">
          {renderWithFlags(editorial.governingAnswer)}
        </p>

        {/* Supporting insights — expandable */}
        {editorial.supportingInsights.length > 0 && (
          <div className="mt-6 space-y-2">
            {editorial.supportingInsights.map((insight, i) => (
              <SupportingInsight key={i} index={i} title={insight.title} detail={insight.detail} />
            ))}
          </div>
        )}
      </section>

      <div className="my-10 h-px bg-border" />

      {/* ═══════════════════════════════════════════════════════════════════
          ACT 4 — MODULES RE-SEQUENCED BY PROXIMITY TO USER'S MONEY
          Money Journey → Connections → Timeline
          Following the causal chain: where does my money go → who benefits → what changed
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
        <div className="editorial-eyebrow mb-3 text-muted-foreground">Follow your money</div>
        <p className="mb-6 text-[14px] leading-relaxed text-muted-foreground">
          The causal chain every consumer intuitively wants: where your money goes first, who
          ultimately benefits, and what has changed.
        </p>

        {/* Step 1: Money Journey */}
        <ModuleStep
          step={1}
          label="Where does my money go first?"
          onClick={() => go({ kind: "money-journey", id: company.id })}
        >
          <MoneyJourneyMini company={company} />
        </ModuleStep>

        {/* Step 2: Connections */}
        <ModuleStep
          step={2}
          label="Who ultimately benefits?"
          onClick={() => go({ kind: "connections", id: company.id })}
        >
          <ConnectionsMini company={company} />
        </ModuleStep>

        {/* Step 3: Timeline */}
        <ModuleStep
          step={3}
          label="Has this changed recently?"
          onClick={() => go({ kind: "timeline", id: company.id })}
        >
          <TimelineMini company={company} />
        </ModuleStep>

        {/* Professional depth — demoted */}
        <div className="mt-8 flex items-center gap-4 border-t border-border pt-5">
          <span className="editorial-eyebrow text-[10px] text-muted-foreground">
            Professional depth
          </span>
          <button
            onClick={() => go({ kind: "report", id: company.id })}
            className="text-[12.5px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Intelligence report
          </button>
          <button
            onClick={() => go({ kind: "sources", id: company.id })}
            className="text-[12.5px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Sources ({company.sources.length})
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          ACT 5 — ASK SCOUT AFFORDANCE
          Quiet, persistent, expands on demand
      ═══════════════════════════════════════════════════════════════════ */}
      <AskScoutAffordance companyName={company.name} />

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function SupportingInsight({
  index,
  title,
  detail,
}: {
  index: number;
  title: string;
  detail: string;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className="block w-full rounded-lg border border-border bg-card p-3 text-left transition-all hover:border-foreground/20"
    >
      <div className="flex items-center gap-2">
        <span className="font-serif text-[12px] text-muted-foreground tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="flex-1 text-[13.5px] font-medium text-foreground">{title}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            expanded && "rotate-180"
          )}
        />
      </div>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          expanded ? "mt-2 max-h-40 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <p className="text-[13px] leading-relaxed text-muted-foreground">{detail}</p>
      </div>
    </button>
  );
}

function WhyThisScore({
  company,
  editorial,
}: {
  company: Company;
  editorial: NonNullable<Company["editorial"]>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="animate-fade-up" style={{ animationDelay: "0.15s" }}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 text-left"
      >
        <span className="editorial-eyebrow text-muted-foreground">Why this score</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
        <span className="ml-auto text-[12px] text-muted-foreground">
          {open ? "Hide" : "Show"} breakdown
        </span>
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-400",
          open ? "mt-4 max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="space-y-3">
          {company.scoutIndexPillars.map((pillar) => {
            const narrativeKey = pillar.id as "strategic" | "political" | "fragility";
            const narrative = editorial.pillarNarratives[narrativeKey];
            return (
              <PillarNarrative
                key={pillar.id}
                label={pillar.label}
                score={pillar.score}
                question={pillar.question}
                narrative={narrative}
                dimensions={pillar.dimensions}
              />
            );
          })}
        </div>

        {/* Methodology note */}
        <div className="mt-4 rounded-md border border-dashed border-border bg-card/40 px-3 py-2">
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Methodology:</span> Weighted power mean
            (p=½) of three pillars. Critical Exposure Spike applied when any dimension exceeds 85.{" "}
            {company.scoutIndexPillars.some((p) =>
              p.dimensions.some((d) => d.score >= 85)
            ) && <span className="text-terra">Spike active for this company.</span>}
          </p>
        </div>
      </div>
    </div>
  );
}

function PillarNarrative({
  label,
  score,
  question,
  narrative,
  dimensions,
}: {
  label: string;
  score: number;
  question: string;
  narrative: string;
  dimensions: { label: string; score: number; weight: number }[];
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className="block w-full rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-foreground/20"
    >
      <div className="flex items-baseline gap-3">
        <div className="flex-1">
          <p className="text-[14.5px] leading-relaxed text-foreground">
            <span className="font-medium">{narrative}</span>
          </p>
          <p className="mt-1 text-[11.5px] italic text-muted-foreground">{question}</p>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            expanded && "rotate-180"
          )}
        />
      </div>

      {/* Score bar — always visible */}
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700",
            score >= 85 ? "bg-ink" : score >= 70 ? "bg-terra" : "bg-terra/60"
          )}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Dimension detail — expandable */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          expanded ? "mt-4 max-h-64 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="space-y-2 border-t border-border/60 pt-3">
          {dimensions.map((dim) => (
            <div key={dim.label} className="flex items-center gap-2">
              <span className="flex-1 text-[12px] text-muted-foreground">{dim.label}</span>
              <span className="text-[10px] tabular-nums text-muted-foreground/60">
                w={dim.weight}
              </span>
              <div className="h-1 w-10 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-terra/70"
                  style={{ width: `${dim.score}%` }}
                />
              </div>
              <span
                className={cn(
                  "w-7 text-right text-[12px] tabular-nums",
                  dim.score >= 85 ? "font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {dim.score}
              </span>
            </div>
          ))}
        </div>
      </div>
    </button>
  );
}

function ModuleStep({
  step,
  label,
  onClick,
  children,
}: {
  step: number;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-[11px] font-medium text-background tabular-nums">
          {step}
        </span>
        <span className="text-[13.5px] font-medium text-foreground">{label}</span>
        <ArrowDown className="ml-auto h-3 w-3 text-muted-foreground/40" />
      </div>
      <button
        onClick={onClick}
        className="group block w-full rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-foreground/20 hover:shadow-sm"
      >
        {children}
        <div className="mt-2 flex items-center gap-1 text-[12px] text-muted-foreground group-hover:text-foreground">
          Explore
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </div>
      </button>
    </div>
  );
}

function MoneyJourneyMini({ company }: { company: Company }) {
  const allSteps = company.moneyJourney;
  const firstStep = allSteps[0];

  // Extract actual investor company names from connections (owns edges)
  const investorEdges = company.connections.filter(
    (c) => c.type === "owns" || c.type === "funds"
  );
  const topInvestors = investorEdges
    .sort((a, b) => {
      // Sort by strength: Critical > High > Moderate > Low
      const order = { Critical: 0, High: 1, Moderate: 2, Low: 3 };
      return order[a.strength] - order[b.strength];
    })
    .slice(0, 3)
    .map((edge) => company.entities[edge.source]?.name)
    .filter(Boolean);

  // Build beneficiary label from actual investor names
  const beneficiaryLabel =
    topInvestors.length > 0
      ? topInvestors.join(", ")
      : "Shareholders";

  const splits = allSteps
    .slice(2)
    .filter((s) => s.percentage !== null && s.percentage !== undefined && s.percentage < 100 && s.percentage > 5)
    .slice(0, 3);

  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center justify-center rounded-md border border-border/60 bg-secondary/40 px-2 py-1.5 text-center text-[11px] text-foreground">
          {firstStep?.step.split("(")[0].trim().slice(0, 25)}
        </div>
        <span className="shrink-0 text-muted-foreground">→</span>
        <div className="flex min-w-0 flex-1 items-center justify-center rounded-md border border-border/60 bg-secondary/40 px-2 py-1.5 text-center text-[11px] text-foreground">
          {company.name.split(" ")[0]}
        </div>
        <span className="shrink-0 text-muted-foreground">→</span>
        <div className="flex min-w-0 flex-1 items-center justify-center rounded-md border border-terra/40 bg-terra-soft/30 px-2 py-1.5 text-center text-[11px] leading-tight text-foreground">
          {beneficiaryLabel.slice(0, 45)}
        </div>
      </div>
      {splits.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {splits.map((s, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-secondary/30 px-1.5 py-0.5 text-[10px]"
            >
              {s.step.split("(")[0].trim().slice(0, 18)}
              <span className="tabular-nums text-terra">~{s.percentage}%</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ConnectionsMini({ company }: { company: Company }) {
  const investors = company.connections.filter((c) => c.type === "owns" || c.type === "funds");
  const governments = company.connections.filter(
    (c) => c.type === "regulates" || c.type === "receives_grant_from"
  );
  const suppliers = company.connections.filter((c) => c.type === "supplies");
  const countries = company.connections.filter(
    (c) => c.type === "manufactures_in" || c.type === "located_in"
  );

  return (
    <div className="flex flex-wrap gap-2">
      {[
        { label: "Investors", count: investors.length },
        { label: "Governments", count: governments.length },
        { label: "Suppliers", count: suppliers.length },
        { label: "Countries", count: countries.length },
      ].map((cat) => (
        <div
          key={cat.label}
          className="rounded-md border border-border/60 bg-secondary/40 px-2.5 py-1 text-center"
        >
          <span className="text-[14px] font-medium tabular-nums text-foreground">{cat.count}</span>
          <span className="ml-1 text-[10px] uppercase tracking-wider text-muted-foreground">
            {cat.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function TimelineMini({ company }: { company: Company }) {
  const sorted = [...company.timeline].sort((a, b) => b.year - a.year);
  const recent = sorted.slice(0, 3);
  return (
    <div className="flex flex-wrap gap-1.5">
      {recent.map((e, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/40 px-2.5 py-1 text-[11px]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-terra" />
          <span className="text-foreground">{e.year}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{e.category}</span>
        </span>
      ))}
    </div>
  );
}

function AskScoutAffordance({ companyName }: { companyName: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="mt-10">
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="flex w-full items-center gap-2 rounded-xl border border-dashed border-terra/40 bg-terra-soft/10 px-4 py-3 text-left transition-all hover:border-terra/60 hover:bg-terra-soft/20"
        >
          <Sparkles className="h-4 w-4 shrink-0 text-terra" />
          <span className="text-[13.5px] text-foreground/80">
            Ask Scout why {companyName} matters
          </span>
          <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground" />
        </button>
      ) : (
        <div className="rounded-xl border border-terra/40 bg-terra-soft/10 p-4 animate-fade-up">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-terra" />
            <span className="editorial-eyebrow text-terra">Ask Scout</span>
            <button
              onClick={() => setExpanded(false)}
              className="ml-auto text-[11px] text-muted-foreground hover:text-foreground"
            >
              Close
            </button>
          </div>
          <p className="mb-3 text-[13px] leading-relaxed text-muted-foreground">
            Scout AI uses verified internal data, not general internet knowledge. Ask a question
            about {companyName}:
          </p>
          <div className="space-y-1.5">
            {[
              `Why is ${companyName} strategically important?`,
              `Compare ${companyName} with another company`,
              `What are the biggest risks for ${companyName}?`,
              `Summarize the last 3 years for ${companyName}`,
            ].map((prompt, i) => (
              <button
                key={i}
                className="block w-full rounded-lg border border-border bg-card px-3 py-2 text-left text-[12.5px] text-foreground/80 transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                {prompt}
              </button>
            ))}
          </div>
          <div className="mt-3 rounded-md border border-dashed border-border px-3 py-2">
            <p className="text-[11px] italic text-muted-foreground">
              Scout AI answers using the knowledge graph and editorial database — never from
              general internet knowledge. Every response includes citations and confidence levels.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
