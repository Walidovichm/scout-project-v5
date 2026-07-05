"use client";

import { Company } from "@/lib/data";
import { useScout } from "@/lib/store";
import { FootprintBreakdown, ScoutIndexPillarDecomposition, ScoutIndexHeader } from "./footprint-gauge";
import { ArrowLeft } from "lucide-react";

export function ReportScreen({ company }: { company: Company }) {
  const { go } = useScout();
  const r = company.intelligenceReport;

  const sections = [
    { title: "Executive Summary", body: r.executiveSummary },
    { title: "Political Context", body: r.politicalContext },
    { title: "Financial Relationships", body: r.financialRelationships },
    { title: "Government Relations", body: r.governmentRelations },
    { title: "Global Dependencies", body: r.globalDependencies },
    { title: "Strategic Risks", body: r.strategicRisks },
    { title: "Future Watchpoints", body: r.futureWatchpoints },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
      <div className="mb-2 flex items-center gap-2 text-[12px] text-muted-foreground">
        <button onClick={() => go({ kind: "company", id: company.id })} className="hover:text-foreground">
          {company.name}
        </button>
        <span className="text-border">/</span>
        <span className="text-foreground">Intelligence Report</span>
      </div>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="editorial-title text-[40px] sm:text-[48px]">
            Intelligence Report
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {company.name} · Last updated {company.sources[0]?.date}
          </p>
        </div>
      </div>

      {/* Reading time */}
      <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1 text-[12px] text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-terra pulse-dot" />
        Estimated reading time: 8 minutes
      </div>

      {/* Scout Index decomposition */}
      <section className="mb-12 rounded-2xl border border-border bg-card p-6">
        <h2 className="editorial-title mb-4 text-[22px]">Scout Index</h2>
        <div className="mb-5">
          <ScoutIndexHeader
            score={company.scoutIndex}
            tier={company.scoutIndexTier}
            confidence={company.scoutIndexConfidence}
          />
        </div>
        <p className="mb-5 text-[13.5px] leading-relaxed text-muted-foreground">
          How {company.name}'s Scout Index of {company.scoutIndex}/100 is calculated across three
          pillars and eight dimensions. The formula uses a weighted power mean (p=½) at both the
          pillar and composite level, with a Critical Exposure Spike for any single dimension above
          85.
        </p>
        <ScoutIndexPillarDecomposition company={company} />
      </section>

      {/* Dimension detail */}
      <section className="mb-12 rounded-2xl border border-border bg-card p-6">
        <h2 className="editorial-title mb-4 text-[22px]">Dimension detail</h2>
        <p className="mb-5 text-[13.5px] text-muted-foreground">
          The eight raw dimensions underlying the Scout Index. Each is scored 0–100 based on
          observable inputs documented in the methodology.
        </p>
        <FootprintBreakdown company={company} />
      </section>

      {/* Sections */}
      {sections.map((s, i) => (
        <section
          key={s.title}
          className="mb-10"
          style={{ animation: `fade-up 0.5s ${i * 0.04}s both` }}
        >
          <h2 className="editorial-title mb-3 text-[24px]">{s.title}</h2>
          <p className="text-[16px] leading-[1.7] text-foreground/90">{s.body}</p>
        </section>
      ))}

      {/* Methodology */}
      <section className="mt-12 rounded-2xl border border-dashed border-border bg-card/50 p-6">
        <div className="editorial-eyebrow mb-2 text-terra">Methodology</div>
        <p className="text-[14px] leading-relaxed text-muted-foreground">
          This report synthesises information from primary corporate filings,
          government databases, regulatory decisions and reputable media sources.
          Every factual statement is intended to be traceable to its origin.
          Where evidence is insufficient, confidence levels are explicitly
          disclosed. Scout does not predict markets or provide investment advice —
          it reveals structures.
        </p>
      </section>

      {/* Sources CTA */}
      <div className="mt-8 flex items-center justify-between rounded-2xl border border-border bg-card p-5">
        <div>
          <div className="text-[14px] font-medium text-foreground">
            View all {company.sources.length} sources
          </div>
          <div className="text-[12.5px] text-muted-foreground">
            Trace every statement back to its origin.
          </div>
        </div>
        <button
          onClick={() => go({ kind: "sources", id: company.id })}
          className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-[13px] text-background transition-opacity hover:opacity-90"
        >
          View sources
        </button>
      </div>
    </div>
  );
}

export function SourcesScreen({ company }: { company: Company }) {
  const { go } = useScout();

  const tierLabels: Record<number, string> = {
    1: "Primary source",
    2: "Institutional source",
    3: "Reputable media",
    4: "Secondary source",
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
      <div className="mb-2 flex items-center gap-2 text-[12px] text-muted-foreground">
        <button onClick={() => go({ kind: "company", id: company.id })} className="hover:text-foreground">
          {company.name}
        </button>
        <span className="text-border">/</span>
        <span className="text-foreground">Sources</span>
      </div>
      <h1 className="editorial-title text-[40px] sm:text-[48px]">Sources</h1>
      <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-muted-foreground">
        Trust depends on transparency. Every factual statement in Scout should,
        wherever possible, be traceable to its origin.
      </p>

      <div className="my-8 h-px bg-border" />

      {/* Tier legend */}
      <div className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[1, 2, 3, 4].map((t) => (
          <div key={t} className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-center">
            <div className="text-[15px] font-medium tabular-nums text-foreground">Tier {t}</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">{tierLabels[t]}</div>
          </div>
        ))}
      </div>

      <ol className="space-y-3">
        {company.sources.map((src, i) => (
          <li
            key={i}
            className="flex items-start gap-4 rounded-xl border border-border bg-card p-4"
            style={{ animation: `fade-up 0.4s ${i * 0.04}s both` }}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-[13px] font-medium tabular-nums text-foreground">
              T{src.tier}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-medium leading-tight text-foreground">
                {src.name}
              </div>
              <div className="mt-1 text-[12.5px] text-muted-foreground">
                {src.type} · {src.date}
              </div>
              <div className="mt-1 text-[12px] text-muted-foreground/80">
                {tierLabels[src.tier]}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
