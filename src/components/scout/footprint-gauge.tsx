"use client";

import { useState } from "react";
import { Company } from "@/lib/data";
import { cn } from "@/lib/utils";

const TIER_COLORS: Record<string, string> = {
  Low: "var(--muted-foreground)",
  Moderate: "var(--muted-foreground)",
  Elevated: "var(--terra)",
  High: "var(--terra)",
  Critical: "var(--ink)",
};

export function ScoutIndexGauge({
  score,
  tier,
  confidence,
}: {
  score: number;
  tier: string;
  confidence?: number;
}) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const accent = TIER_COLORS[tier] || "var(--terra)";

  return (
    <div className="relative flex h-[112px] w-[112px] items-center justify-center">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="5" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={accent}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-serif text-[28px] font-medium leading-none tabular-nums">
          {Math.round(score)}
        </span>
        <span className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
          / 100
        </span>
      </div>
    </div>
  );
}

export function ScoutIndexHeader({
  score,
  tier,
  confidence,
}: {
  score: number;
  tier: string;
  confidence: number;
}) {
  const accent = TIER_COLORS[tier] || "var(--terra)";
  return (
    <div className="flex items-baseline gap-3">
      <span className="font-serif text-[36px] font-medium leading-none tabular-nums">
        {score.toFixed(1)}
      </span>
      <span className="text-[14px] text-muted-foreground">/ 100</span>
      <span
        className="rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider"
        style={{ backgroundColor: `color-mix(in oklch, ${accent} 18%, transparent)`, color: accent }}
      >
        {tier}
      </span>
      <span className="text-[11px] text-muted-foreground">±{confidence}</span>
    </div>
  );
}

export function ScoutIndexPillarDecomposition({ company }: { company: Company }) {
  const [activePillar, setActivePillar] = useState<number | null>(null);
  const [activeDim, setActiveDim] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      {/* Pillars */}
      <div className="space-y-3">
        {company.scoutIndexPillars.map((pillar, i) => (
          <button
            key={pillar.id}
            onMouseEnter={() => setActivePillar(i)}
            onMouseLeave={() => {
              setActivePillar(null);
              setActiveDim(null);
            }}
            className="block w-full text-left"
          >
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="text-[14px] font-medium text-foreground">{pillar.label}</span>
              <div className="flex items-baseline gap-2">
                <span className="text-[11px] text-muted-foreground">w={pillar.weight}</span>
                <span className="text-[15px] font-medium tabular-nums text-foreground">
                  {pillar.score}
                </span>
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700",
                  activePillar === i ? "bg-ink" : "bg-terra"
                )}
                style={{ width: `${pillar.score}%` }}
              />
            </div>
            <p
              className={cn(
                "mt-1 text-[11.5px] italic leading-relaxed text-muted-foreground transition-all",
                activePillar === i ? "max-h-12 opacity-100" : "max-h-0 overflow-hidden opacity-0"
              )}
            >
              {pillar.question}
            </p>

            {/* Dimensions within pillar */}
            <div
              className={cn(
                "mt-2 space-y-1.5 transition-all",
                activePillar === i ? "max-h-48 opacity-100" : "max-h-0 overflow-hidden opacity-0"
              )}
            >
              {pillar.dimensions.map((dim) => (
                <div
                  key={dim.label}
                  onMouseEnter={() => setActiveDim(dim.label)}
                  onMouseLeave={() => setActiveDim(null)}
                  className="flex items-center gap-2 pl-3"
                >
                  <span className="flex-1 truncate text-[12px] text-muted-foreground">
                    {dim.label}
                  </span>
                  <span className="text-[10px] tabular-nums text-muted-foreground/70">
                    w={dim.weight}
                  </span>
                  <div className="h-1 w-12 overflow-hidden rounded-full bg-muted">
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
          </button>
        ))}
      </div>

      {/* Methodology disclosure */}
      <div className="rounded-md border border-dashed border-border bg-card/40 px-3 py-2">
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Methodology:</span> Scout Index is a weighted
          power mean (p=½) of three pillars, each a weighted power mean of its dimensions. A single
          dimension above 85 triggers a Critical Exposure Spike (up to +20%).
          {company.scoutIndexPillars.some((p) =>
            p.dimensions.some((d) => d.score >= 85)
          ) && (
            <span className="text-terra"> · Critical Exposure Spike applied.</span>
          )}
        </p>
      </div>
    </div>
  );
}

// Backward-compat exports — keep old names working
export const FootprintGauge = ScoutIndexGauge;

export function FootprintBreakdown({ company }: { company: Company }) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {company.footprintDimensions.map((dim, i) => (
        <button
          key={dim.label}
          onMouseEnter={() => setActive(i)}
          onMouseLeave={() => setActive(null)}
          className="block w-full text-left"
        >
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <span className="text-[13.5px] font-medium text-foreground">{dim.label}</span>
            <span className="text-[13px] tabular-nums text-muted-foreground">{dim.score}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-terra transition-all duration-700"
              style={{ width: `${dim.score}%`, opacity: active === i ? 1 : 0.75 }}
            />
          </div>
          <p
            className={cn(
              "mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground transition-all",
              active === i ? "max-h-24 opacity-100" : "max-h-0 overflow-hidden opacity-0"
            )}
          >
            {dim.description}
          </p>
        </button>
      ))}
    </div>
  );
}
