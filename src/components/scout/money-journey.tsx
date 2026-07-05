"use client";

import { Company } from "@/lib/data";
import { useScout } from "@/lib/store";
import { ArrowRight } from "lucide-react";

export function MoneyJourneyPreview({ company }: { company: Company }) {
  const { go } = useScout();

  // Build a clean horizontal flow: You → Company → 4 destinations → Beneficiaries
  // Pick the key steps that tell the story.
  const allSteps = company.moneyJourney;

  const youStep = allSteps[0]; // "You buy..."
  const revenueStep = allSteps[1]; // "Company revenue"
  const lastStep = allSteps[allSteps.length - 1]; // "Underlying beneficiaries"

  // Pick 3 "destination" steps for the middle row — those that represent where revenue splits
  // Heuristic: steps with percentage < 100, after revenue, before shareholders
  const destinations = allSteps
    .slice(2)
    .filter((s) => s.percentage !== null && s.percentage !== undefined && s.percentage < 100)
    .slice(0, 3);

  return (
    <button
      onClick={() => go({ kind: "money-journey", id: company.id })}
      className="group block w-full rounded-2xl border border-border bg-card p-6 text-left transition-all hover:border-foreground/20 hover:shadow-md"
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="editorial-eyebrow text-muted-foreground">Module</span>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
      <h3 className="editorial-title text-[22px]">Money Journey</h3>
      <p className="mt-1 text-[14px] text-muted-foreground">
        Follow the journey of your money through {company.name}'s global ecosystem.
      </p>

      {/* Clean horizontal flow */}
      <div className="mt-6">
        {/* Top row: You → Company → Beneficiaries (the headline story) */}
        <div className="flex items-center gap-2">
          <FlowNode label="You" sublabel={youStep?.step.replace(/^You (buy|pay|use|book) /i, "") || "purchase"} tone="ink" />
          <FlowConnector />
          <FlowNode label={company.name.split(" ")[0]} sublabel="revenue" tone="default" />
          <FlowConnector />
          <FlowNode label="Beneficiaries" sublabel="final" tone="terra" />
        </div>

        {/* Bottom row: where revenue splits */}
        {destinations.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-3">
            <span className="editorial-eyebrow text-[10px] text-muted-foreground">Revenue splits into</span>
            {destinations.map((s, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-secondary/40 px-2 py-0.5 text-[11px] text-foreground"
              >
                {s.step.split("(")[0].trim().slice(0, 22)}
                {s.percentage !== null && s.percentage !== undefined && (
                  <span className="tabular-nums text-terra">~{s.percentage}%</span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

function FlowNode({
  label,
  sublabel,
  tone = "default",
}: {
  label: string;
  sublabel?: string;
  tone?: "default" | "ink" | "terra";
}) {
  const toneClasses = {
    default: "border-border bg-secondary/40 text-foreground",
    ink: "border-foreground bg-foreground text-background",
    terra: "border-terra/40 bg-terra-soft/30 text-foreground",
  };
  return (
    <div
      className={`flex min-w-0 flex-1 flex-col items-center rounded-lg border px-2 py-2 text-center ${toneClasses[tone]}`}
    >
      <span className="truncate text-[12px] font-medium leading-tight">{label}</span>
      {sublabel && (
        <span className={`mt-0.5 truncate text-[10px] leading-tight ${tone === "ink" ? "text-background/70" : "text-muted-foreground"}`}>
          {sublabel}
        </span>
      )}
    </div>
  );
}

function FlowConnector() {
  return (
    <svg width="16" height="14" viewBox="0 0 16 14" fill="none" className="shrink-0 text-muted-foreground">
      <path d="M0 7 L13 7 M9 3 L13 7 L9 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// =============================================================================
// FULL SCREEN — Money Journey with logical flow + phase headers
// =============================================================================

type Phase = {
  id: string;
  label: string;
  description: string;
  steps: { step: string; detail: string; confidence: string; percentage: number | null }[];
};

function buildPhases(company: Company): Phase[] {
  const all = company.moneyJourney;
  if (all.length === 0) return [];

  // Phase 1: The Purchase — first 2 steps (You + Revenue)
  // Phase 2: Where Revenue Goes — steps with percentage that sum to the revenue split (COGS, OpEx, Taxes, Net profit)
  // Phase 3: Inside Cost of Goods — sub-categories of COGS (smaller percentages that are subsets)
  // Phase 4: Where Profit Goes — Shareholders → Investors → Beneficiaries (the tail, no percentages or final)

  const phase1Steps = all.slice(0, 2);

  // Identify "split" steps: those that come after revenue and have a percentage that's a top-level split
  // Heuristic: steps 2+ that have percentage >= 8% and aren't obviously sub-categories
  // We'll treat steps with percentage >= 15 as "split" steps (COGS, OpEx, Taxes, Net profit)
  // and steps with percentage < 15 as "sub" steps (inside COGS breakdown)
  const remaining = all.slice(2);
  const splitSteps = remaining.filter((s) => s.percentage !== null && s.percentage >= 15);
  const subSteps = remaining.filter((s) => s.percentage !== null && s.percentage < 15 && s.percentage > 0);
  const tailSteps = remaining.filter((s) => s.percentage === null || s.percentage === undefined);

  // Decide which split step the sub-steps belong to. Heuristic: sub-steps are inside "Cost of goods"
  // So Phase 3 = sub-steps, attached to Phase 2's "Cost of goods" step.

  const phases: Phase[] = [
    {
      id: "purchase",
      label: "The Purchase",
      description: "Money enters the company's ecosystem when you transact.",
      steps: phase1Steps,
    },
  ];

  if (splitSteps.length > 0) {
    phases.push({
      id: "revenue-split",
      label: "Where Revenue Goes",
      description: "After the transaction, the company's revenue splits across major categories.",
      steps: splitSteps,
    });
  }

  if (subSteps.length > 0) {
    phases.push({
      id: "cogs-breakdown",
      label: "Inside Cost of Goods",
      description: "The largest chunk — cost of goods — breaks down further into specific suppliers and inputs.",
      steps: subSteps,
    });
  }

  if (tailSteps.length > 0) {
    phases.push({
      id: "profit-flow",
      label: "Where Profit Goes",
      description: "Net profit flows to shareholders, then institutional investors, then underlying beneficiaries.",
      steps: tailSteps,
    });
  }

  return phases;
}

export function MoneyJourneyScreen({ company }: { company: Company }) {
  const { go } = useScout();
  const phases = buildPhases(company);

  // Find the max percentage across all steps for bar scaling
  const maxPct = Math.max(
    ...company.moneyJourney.map((s) => s.percentage ?? 0).filter((p) => p > 0 && p < 100),
    50
  );

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
      <div className="mb-2 flex items-center gap-2 text-[12px] text-muted-foreground">
        <button onClick={() => go({ kind: "company", id: company.id })} className="hover:text-foreground">
          {company.name}
        </button>
        <span className="text-border">/</span>
        <span className="text-foreground">Money Journey</span>
      </div>
      <h1 className="editorial-title text-[40px] sm:text-[48px]">Where your money goes</h1>
      <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-muted-foreground">
        An educational visualisation of the principal pathways through which value circulates after a
        purchase from {company.name}. This is not an exact accounting flow — it illustrates the ecosystem
        surrounding the company's cash flows.
      </p>

      <div className="my-6 rounded-xl border border-terra-soft bg-terra-soft/20 px-4 py-3 text-[12.5px] italic leading-relaxed text-muted-foreground">
        Illustrative purposes only. Confidence levels are shown for each step. Percentages are of total
        revenue, not of parent categories — so the bars are directly comparable.
      </div>

      {/* Phase-by-phase flow */}
      <div className="space-y-10">
        {phases.map((phase, phaseIdx) => (
          <section key={phase.id} className="animate-fade-up" style={{ animationDelay: `${phaseIdx * 0.05}s` }}>
            {/* Phase header */}
            <div className="mb-4 flex items-baseline justify-between border-b border-border pb-2">
              <div>
                <span className="editorial-eyebrow text-terra">Phase {phaseIdx + 1}</span>
                <h2 className="editorial-title mt-0.5 text-[22px]">{phase.label}</h2>
              </div>
              <span className="text-[11.5px] text-muted-foreground">{phase.steps.length} steps</span>
            </div>
            <p className="mb-5 text-[13.5px] leading-relaxed text-muted-foreground">{phase.description}</p>

            {/* Steps within phase */}
            <ol className="relative space-y-3">
              {/* Vertical connector line */}
              <div className="absolute left-[7px] top-3 bottom-3 w-px bg-border" />

              {phase.steps.map((step, i) => {
                const globalIdx = company.moneyJourney.indexOf(step);
                const isStart = phaseIdx === 0 && i === 0;
                const isEnd = phaseIdx === phases.length - 1 && i === phase.steps.length - 1;
                return (
                  <li
                    key={`${phase.id}-${i}`}
                    className="relative pl-8"
                    style={{ animation: `fade-up 0.4s ${(phaseIdx * 0.05) + (i * 0.04)}s both` }}
                  >
                    {/* Node */}
                    <span
                      className={`absolute left-0 top-2.5 flex h-3.5 w-3.5 items-center justify-center rounded-full ring-4 ring-background ${
                        isStart
                          ? "bg-ink"
                          : isEnd
                          ? "bg-terra"
                          : "bg-secondary border border-border"
                      }`}
                    >
                      {step.percentage !== null && step.percentage !== undefined && step.percentage > 0 && (
                        <span className="text-[8px] font-medium text-background tabular-nums">
                          {step.percentage > 30 ? "" : ""}
                        </span>
                      )}
                    </span>

                    {/* Step content */}
                    <div className="rounded-lg border border-border bg-card p-4">
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="text-[15.5px] font-medium leading-tight text-foreground">{step.step}</h3>
                        {step.percentage !== null && step.percentage !== undefined && step.percentage > 0 && (
                          <span className="shrink-0 font-serif text-[18px] font-medium tabular-nums text-terra">
                            {step.percentage}%
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{step.detail}</p>

                      {/* Percentage bar (only for steps with a percentage < 100) */}
                      {step.percentage !== null &&
                        step.percentage !== undefined &&
                        step.percentage > 0 &&
                        step.percentage < 100 && (
                          <div className="mt-3 flex items-center gap-2">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-terra transition-all duration-700"
                                style={{ width: `${(step.percentage / maxPct) * 100}%` }}
                              />
                            </div>
                            <span className="text-[11px] tabular-nums text-muted-foreground">
                              of revenue
                            </span>
                          </div>
                        )}

                      {/* Confidence */}
                      <div className="mt-2.5 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-[10.5px] text-muted-foreground">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              step.confidence === "Confirmed"
                                ? "bg-foreground"
                                : step.confidence === "High"
                                ? "bg-terra"
                                : step.confidence === "Moderate"
                                ? "bg-muted-foreground"
                                : "bg-muted-foreground/50"
                            }`}
                          />
                          {step.confidence} confidence
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>

            {/* Phase transition arrow */}
            {phaseIdx < phases.length - 1 && (
              <div className="mt-5 flex justify-center">
                <svg width="20" height="24" viewBox="0 0 20 24" fill="none" className="text-muted-foreground/60">
                  <path d="M10 0 L10 18 M4 14 L10 20 L16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Conclusion */}
      <div className="mt-14 rounded-2xl border border-border bg-card p-6">
        <div className="editorial-eyebrow mb-2 text-terra">The takeaway</div>
        <p className="editorial-lead text-[19px] leading-snug text-foreground sm:text-[21px]">
          A single purchase at {company.name} flows through employees, suppliers, governments and
          shareholders — eventually reaching pension funds, sovereign wealth funds and individual investors
          worldwide.
        </p>
        <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">
          That is why Scout shows you connections, not just companies. Money is never still — it is always
          becoming something else.
        </p>
      </div>
    </div>
  );
}
