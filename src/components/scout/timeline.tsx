"use client";

import { Company } from "@/lib/data";
import { useScout } from "@/lib/store";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const categoryColor: Record<string, string> = {
  Funding: "bg-emerald-600",
  Government: "bg-terra",
  Regulation: "bg-amber-600",
  Acquisition: "bg-purple-600",
  "Supply Chain": "bg-blue-600",
  Leadership: "bg-stone-600",
  Strategy: "bg-rose-600",
  Sanctions: "bg-red-700",
};

export function TimelinePreview({ company }: { company: Company }) {
  const { go } = useScout();
  return (
    <button
      onClick={() => go({ kind: "timeline", id: company.id })}
      className="group block w-full rounded-2xl border border-border bg-card p-6 text-left transition-all hover:border-foreground/20 hover:shadow-md"
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="editorial-eyebrow text-muted-foreground">Module</span>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
      <h3 className="editorial-title text-[22px]">Timeline</h3>
      <p className="mt-1 text-[14px] text-muted-foreground">
        The geopolitical history of {company.name} — funding, government decisions, sanctions and supply chain events.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {company.timeline.slice(0, 3).map((e) => (
          <div
            key={e.id}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1 text-[12px]"
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", categoryColor[e.category])} />
            <span className="text-foreground">{e.year}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{e.category}</span>
          </div>
        ))}
      </div>
    </button>
  );
}

export function TimelineScreen({ company }: { company: Company }) {
  const { go } = useScout();
  const sorted = [...company.timeline].sort((a, b) => b.year - a.year);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
      <div className="mb-2 flex items-center gap-2 text-[12px] text-muted-foreground">
        <button onClick={() => go({ kind: "company", id: company.id })} className="hover:text-foreground">
          {company.name}
        </button>
        <span className="text-border">/</span>
        <span className="text-foreground">Timeline</span>
      </div>
      <h1 className="editorial-title text-[40px] sm:text-[48px]">
        {company.name}'s timeline
      </h1>
      <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-muted-foreground">
        A continuously updated geopolitical history. Each event is categorised and
        linked to supporting sources — distinguishing between factual events and
        editorial interpretation.
      </p>

      <div className="my-8 h-px bg-border" />

      <ol className="relative space-y-8">
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
        {sorted.map((event, i) => (
          <li
            key={event.id}
            className="relative pl-8"
            style={{ animation: `fade-up 0.5s ${i * 0.05}s both` }}
          >
            <span
              className={cn(
                "absolute left-0 top-2 h-3.5 w-3.5 rounded-full ring-4 ring-background",
                categoryColor[event.category]
              )}
            />
            <div className="flex items-baseline gap-3">
              <time className="text-[13px] tabular-nums text-muted-foreground">
                {event.date}
              </time>
              <span className="rounded-full border border-border px-2 py-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                {event.category}
              </span>
            </div>
            <h3 className="mt-2 text-[18px] font-medium leading-tight text-foreground">
              {event.title}
            </h3>
            <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">
              {event.description}
            </p>
            <p className="mt-2 text-[12px] italic text-muted-foreground/80">
              Source: {event.source.name} · {event.source.type} · {event.source.date}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
