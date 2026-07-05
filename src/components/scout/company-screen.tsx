"use client";

import { Company } from "@/lib/data";
import { useScout } from "@/lib/store";
import { useWatchlist } from "@/lib/watchlist-store";
import { ScoutIndexGauge, ScoutIndexHeader, ScoutIndexPillarDecomposition } from "./footprint-gauge";
import { ConnectionsPreview } from "./connections-preview";
import { MoneyJourneyPreview } from "./money-journey";
import { TimelinePreview } from "./timeline";
import { CompanyLogo } from "./company-logo";
import { ArrowRight, MapPin, Eye, EyeOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CompanyScreen({ company }: { company: Company }) {
  const { go } = useScout();

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
      {/* Breadcrumb */}
      <div className="mb-8 flex items-center justify-between gap-2 text-[12px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Search</span>
          <span className="text-border">/</span>
          <span className="text-foreground">{company.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => go({ kind: "company", id: company.id })}
            className="inline-flex items-center gap-1 rounded-full border border-terra/40 bg-terra-soft/10 px-2.5 py-1 text-[11px] text-terra transition-colors hover:bg-terra-soft/20"
          >
            <Sparkles className="h-3 w-3" />
            Reimagined view
          </button>
          <WatchButton companyId={company.id} />
        </div>
      </div>

      {/* HERO */}
      <section className="animate-fade-up">
        <div className="mb-4 flex items-center gap-3">
          <CompanyLogo name={company.name} src={company.logo} fallbackSrc={company.logoFallback} brandColor={company.brandColor} size="lg" rounded="lg" />
          <div>
            <h1 className="font-serif text-[40px] font-medium leading-none tracking-tight sm:text-[56px]">
              {company.name}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {company.country}
              </span>
              <span className="text-border">·</span>
              <span>{company.sector}</span>
            </div>
          </div>
        </div>

        {/* Hero quote */}
        <p className="editorial-lead text-pretty text-[22px] leading-snug text-foreground sm:text-[26px]">
          {company.heroQuote}
        </p>

        {/* Scout Index */}
        <div className="mt-10 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-start">
          <ScoutIndexGauge
            score={company.scoutIndex}
            tier={company.scoutIndexTier}
            confidence={company.scoutIndexConfidence}
          />
          <div>
            <div className="editorial-eyebrow text-muted-foreground">Scout Index</div>
            <ScoutIndexHeader
              score={company.scoutIndex}
              tier={company.scoutIndexTier}
              confidence={company.scoutIndexConfidence}
            />
            <p className="mt-3 max-w-md text-[14px] leading-relaxed text-muted-foreground">
              A rigorous composite score measuring how deeply {company.name} is embedded in
              geopolitical systems — derived from three pillars (Strategic Significance, Political
              Embeddedness, Fragility) using a weighted power-mean formula. Not a recommendation.
            </p>
            <Button
              variant="link"
              size="sm"
              className="mt-2 h-auto p-0 text-[13px] text-foreground underline-offset-4"
              onClick={() => go({ kind: "report", id: company.id })}
            >
              Read the full intelligence report
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Pillar decomposition */}
        <div className="mt-6 rounded-xl border border-border bg-card/40 p-5">
          <div className="editorial-eyebrow mb-3 text-muted-foreground">
            Pillar decomposition
          </div>
          <ScoutIndexPillarDecomposition company={company} />
        </div>
      </section>

      <div className="my-12 h-px bg-border" />

      {/* THREE KEY INSIGHTS */}
      <section className="animate-fade-up" style={{ animationDelay: "0.05s" }}>
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="editorial-title text-[24px]">Three Key Insights</h2>
          <span className="editorial-eyebrow text-muted-foreground">
            30 seconds
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {company.keyInsights.map((insight, i) => (
            <article
              key={i}
              className="group relative rounded-xl border border-border bg-card p-5 transition-all hover:border-foreground/20 hover:shadow-sm"
            >
              <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-full border border-border text-[12px] tabular-nums text-muted-foreground">
                {i + 1}
              </div>
              <h3 className="mb-2 text-[15px] font-medium leading-tight text-foreground">
                {insight.title}
              </h3>
              <p className="text-[13.5px] leading-relaxed text-muted-foreground">
                {insight.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <div className="my-12 h-px bg-border" />

      {/* QUICK FACTS */}
      <section className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
        <h2 className="editorial-title mb-5 text-[24px]">Quick Facts</h2>
        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {company.quickFacts.map((fact) => (
            <div
              key={fact.label}
              className="flex items-baseline justify-between border-b border-border/60 pb-3"
            >
              <dt className="text-[13px] text-muted-foreground">{fact.label}</dt>
              <dd className="text-right text-[14px] font-medium text-foreground">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="my-12 h-px bg-border" />

      {/* INTERACTIVE MODULES */}
      <section className="animate-fade-up" style={{ animationDelay: "0.15s" }}>
        <h2 className="editorial-title mb-2 text-[24px]">Explore</h2>
        <p className="mb-6 text-[14px] text-muted-foreground">
          Dive deeper into how {company.name} connects to governments, investors,
          suppliers and your wallet.
        </p>

        <div className="grid gap-4">
          <ConnectionsPreview company={company} />
          <MoneyJourneyPreview company={company} />
          <TimelinePreview company={company} />
        </div>
      </section>

      <div className="my-12 h-px bg-border" />

      {/* SOURCES PREVIEW */}
      <section className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="editorial-title text-[24px]">Sources</h2>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-[13px]"
            onClick={() => go({ kind: "sources", id: company.id })}
          >
            View all
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
        <div className="space-y-2">
          {company.sources.slice(0, 3).map((src, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13.5px] font-medium text-foreground">
                  {src.name}
                </div>
                <div className="text-[12px] text-muted-foreground">
                  {src.type} · {src.date}
                </div>
              </div>
              <span className="ml-3 shrink-0 rounded-full border border-border px-2 py-0.5 text-[11px] tabular-nums text-muted-foreground">
                T{src.tier}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function WatchButton({ companyId }: { companyId: string }) {
  const { watched, toggleWatch } = useWatchlist();
  const isWatched = watched.includes(companyId);

  return (
    <button
      onClick={() => toggleWatch(companyId)}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] transition-all ${
        isWatched
          ? "border-terra/40 bg-terra-soft/30 text-foreground"
          : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground"
      }`}
      title={isWatched ? "Remove from watchlist" : "Add to watchlist"}
    >
      {isWatched ? (
        <>
          <Eye className="h-4 w-4 text-terra" />
          <span className="hidden sm:inline">Watching</span>
          <span className="sm:hidden">On</span>
        </>
      ) : (
        <>
          <EyeOff className="h-4 w-4" />
          <span className="hidden sm:inline">Watch</span>
          <span className="sm:hidden">Watch</span>
        </>
      )}
    </button>
  );
}
