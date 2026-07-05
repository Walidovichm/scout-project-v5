"use client";

import { useScout } from "@/lib/store";
import { companies, companiesByCategory, discoverThemes } from "@/lib/data";
import { ArrowRight, Sparkles } from "lucide-react";
import { CompanyLogo } from "./company-logo";

const categoryOrder = [
  "Technology · Semiconductors",
  "Media · Streaming · Gaming",
  "Telecom",
  "Travel · Hospitality",
  "Automotive",
  "Energy",
  "Retail · Fashion · Consumer Goods",
  "Food & Beverage",
  "Pharmaceuticals",
  "Defence · Aerospace",
  "Finance · Insurance · Fintech",
  "Mining · Metals",
  "Conglomerate",
  "Other",
];

export function DiscoverScreen() {
  const { go } = useScout();

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
      <div className="mb-2 flex items-center gap-2 text-[12px] text-muted-foreground">
        <span>Scout</span>
        <span className="text-border">/</span>
        <span className="text-foreground">Discover</span>
      </div>
      <h1 className="editorial-title text-[40px] sm:text-[56px]">Discover</h1>
      <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-muted-foreground">
        Search answers known questions. Discover creates new ones.
        Explore curated themes that reveal how corporate power is organised — or browse all{" "}
        {companies.length} companies by sector.
      </p>

      <div className="my-10 h-px bg-border" />

      {/* Curated themes */}
      <section className="mb-16">
        <div className="mb-5 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-terra" />
          <h2 className="editorial-title text-[24px]">Curated collections</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {discoverThemes.map((theme) => {
            const themeCompanies = theme.companies
              .map((id) => companies.find((c) => c.id === id))
              .filter((c): c is NonNullable<typeof c> => Boolean(c));
            return (
              <article
                key={theme.id}
                className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-foreground/20 hover:shadow-md"
              >
                <div className="editorial-eyebrow mb-2 text-terra">Collection</div>
                <h3 className="editorial-title text-[22px] leading-tight">{theme.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                  {theme.description}
                </p>
                {themeCompanies.length > 0 ? (
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {themeCompanies.slice(0, 8).map((c) => (
                      <button
                        key={c.id}
                        onClick={() => go({ kind: "company", id: c.id })}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/40 py-1 pl-1 pr-3 text-[12.5px] text-foreground transition-colors hover:border-foreground/30 hover:bg-secondary"
                      >
                        <CompanyLogo name={c.name} src={c.logo} fallbackSrc={c.logoFallback} brandColor={c.brandColor} size="sm" rounded="full" />
                        {c.name.length > 20 ? c.name.slice(0, 18) + "…" : c.name}
                      </button>
                    ))}
                    {themeCompanies.length > 8 && (
                      <span className="inline-flex items-center rounded-full border border-dashed border-border px-3 py-1 text-[12.5px] text-muted-foreground">
                        +{themeCompanies.length - 8} more
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="mt-5 text-[12.5px] italic text-muted-foreground/70">
                    Collection in preparation.
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <div className="my-12 h-px bg-border" />

      {/* All companies by category */}
      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="editorial-title text-[24px]">All companies</h2>
          <span className="text-[12.5px] text-muted-foreground">
            {companies.length} companies · {categoryOrder.length} sectors
          </span>
        </div>
        <p className="mb-8 text-[14px] text-muted-foreground">
          Browse the full {companies.length}-company dataset by sector. Each entry contains a
          Scout Index, key insights, government relations, suppliers, money journey and
          timeline.
        </p>

        <div className="space-y-10">
          {categoryOrder.map((cat) => {
            const ids = companiesByCategory[cat] || [];
            const catCompanies = ids
              .map((id) => companies.find((c) => c.id === id))
              .filter((c): c is NonNullable<typeof c> => Boolean(c));
            if (catCompanies.length === 0) return null;

            return (
              <div key={cat}>
                <div className="mb-3 flex items-baseline justify-between border-b border-border pb-2">
                  <h3 className="editorial-title text-[18px]">{cat}</h3>
                  <span className="text-[11.5px] tabular-nums text-muted-foreground">
                    {catCompanies.length}
                  </span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {catCompanies.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => go({ kind: "company", id: c.id })}
                      className="group flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3 text-left transition-all hover:border-foreground/20 hover:shadow-sm"
                    >
                      <CompanyLogo name={c.name} src={c.logo} fallbackSrc={c.logoFallback} brandColor={c.brandColor} size="md" rounded="md" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-[14px] font-medium text-foreground">
                            {c.name}
                          </span>
                          <span className="shrink-0 text-[11.5px] tabular-nums text-muted-foreground">
                            {c.politicalFootprint}/100
                          </span>
                        </div>
                        <div className="truncate text-[11.5px] text-muted-foreground">
                          {c.country} · {c.tagline}
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-60" />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
