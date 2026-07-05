"use client";

import { Company } from "@/lib/data";
import { useScout } from "@/lib/store";
import { ArrowRight } from "lucide-react";

export function ConnectionsPreview({ company }: { company: Company }) {
  const { go } = useScout();

  // Group connections by type
  const grouped = {
    Investors: company.connections.filter((c) => c.type === "owns" || c.type === "funds"),
    Governments: company.connections.filter(
      (c) => c.type === "regulates" || c.type === "receives_grant_from" || c.type === "procures_from"
    ),
    Suppliers: company.connections.filter((c) => c.type === "supplies"),
    Countries: company.connections.filter(
      (c) => c.type === "manufactures_in" || c.type === "located_in"
    ),
  };

  return (
    <button
      onClick={() => go({ kind: "connections", id: company.id })}
      className="group block w-full rounded-2xl border border-border bg-card p-6 text-left transition-all hover:border-foreground/20 hover:shadow-md"
    >
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-foreground">
            <circle cx="6" cy="6" r="2.5" fill="currentColor" />
            <circle cx="18" cy="6" r="2.5" fill="currentColor" opacity="0.5" />
            <circle cx="12" cy="18" r="2.5" fill="currentColor" opacity="0.7" />
            <path d="M6 6 L12 18 L18 6" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          </svg>
          <span className="editorial-eyebrow text-muted-foreground">Module</span>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
      <h3 className="editorial-title text-[22px]">Connections</h3>
      <p className="mt-1 text-[14px] text-muted-foreground">
        Explore how {company.name} connects to governments, investors, suppliers and global power structures.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Object.entries(grouped).map(([label, items]) => (
          <div
            key={label}
            className="rounded-lg border border-border/60 bg-secondary/40 px-3 py-2.5 text-center"
          >
            <div className="text-[18px] font-medium tabular-nums text-foreground">
              {items.length}
            </div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {label}
            </div>
          </div>
        ))}
      </div>
    </button>
  );
}
