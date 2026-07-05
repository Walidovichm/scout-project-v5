"use client";

import { useState, useMemo, KeyboardEvent } from "react";
import { useScout } from "@/lib/store";
import { companies, trendingCompanies } from "@/lib/data";
import { Search as SearchIcon, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { CompanyLogo } from "./company-logo";

export function SearchScreen() {
  const { search, setSearch } = useScout();
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-2xl">
        {/* Logo & tagline */}
        <div className="mb-10 text-center animate-fade-up">
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="relative flex h-11 w-11 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-foreground" />
              <span className="absolute inset-1.5 rounded-full bg-background" />
              <span className="absolute inset-[14px] rounded-full bg-terra pulse-dot" />
            </span>
            <h1 className="font-serif text-[44px] font-medium tracking-tight sm:text-[56px]">
              Scout
            </h1>
          </div>
          <p className="editorial-title text-balance text-[26px] leading-tight text-foreground sm:text-[32px]">
            Understand where your money goes.
          </p>
          <p className="mt-3 text-[13px] uppercase tracking-[0.18em] text-muted-foreground">
            Everything is political.
          </p>
        </div>

        {/* Search input + suggestions — keyed by search so activeIndex resets naturally */}
        <SearchBox
          search={search}
          setSearch={setSearch}
          focused={focused}
          setFocused={setFocused}
        />

        {/* Trending — shown when search empty */}
        {!search && <TrendingSection />}
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 border-t border-border/40 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-[12px] text-muted-foreground">
          <span>Consumer Geopolitical Intelligence</span>
          <span className="hidden sm:inline">Editorial demonstration · Not investment advice</span>
        </div>
      </footer>
    </div>
  );
}

function SearchBox({
  search,
  setSearch,
  focused,
  setFocused,
}: {
  search: string;
  setSearch: (s: string) => void;
  focused: boolean;
  setFocused: (b: boolean) => void;
}) {
  const { go } = useScout();
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q.length < 2) return [];
    return companies
      .filter((c) => {
        const name = c.name.toLowerCase();
        const words = name.split(/\s+/);
        return (
          name.startsWith(q) ||
          name.includes(q) ||
          words.some((w) => w.startsWith(q)) ||
          (q.length >= 3 && name.includes(q.slice(0, Math.max(3, q.length - 1))))
        );
      })
      .slice(0, 6);
  }, [search]);

  const openCompany = (id: string) => go({ kind: "company", id });

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      openCompany(results[activeIndex].id);
    }
  };

  return (
    <div
      className={cn(
        "group relative rounded-2xl border bg-card transition-all duration-300",
        focused
          ? "border-foreground/30 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.18)] ring-1 ring-foreground/5"
          : "border-border shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-foreground/20"
      )}
    >
      <div className="flex items-center gap-3 px-5 py-4">
        <SearchIcon
          className={cn(
            "h-5 w-5 shrink-0 transition-colors",
            focused ? "text-foreground" : "text-muted-foreground"
          )}
        />
        <input
          autoFocus
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setActiveIndex(0);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 100)}
          onKeyDown={handleKeyDown}
          placeholder="Search any company..."
          className="flex-1 bg-transparent text-[17px] text-foreground outline-none placeholder:text-muted-foreground/70"
          aria-label="Search companies"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="text-[13px] text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>

      {/* Suggestions */}
      {focused && results.length > 0 && (
        <div className="border-t border-border/60 py-2">
          {results.map((c, i) => (
            <button
              key={c.id}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => openCompany(c.id)}
              className={cn(
                "flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors",
                i === activeIndex ? "bg-muted/60" : "hover:bg-muted/40"
              )}
            >
              <CompanyLogo name={c.name} src={c.logo} fallbackSrc={c.logoFallback} brandColor={c.brandColor} size="md" rounded="md" />
              <div className="flex-1 min-w-0">
                <div className="truncate text-[15px] font-medium text-foreground">
                  {c.name}
                </div>
                <div className="truncate text-[12px] text-muted-foreground">
                  {c.tagline} · {c.country}
                </div>
              </div>
              <span className="text-[12px] tabular-nums text-muted-foreground">
                {c.politicalFootprint}/100
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TrendingSection() {
  const { go } = useScout();

  return (
    <div className="mt-10 animate-fade-up" style={{ animationDelay: "0.1s" }}>
      <div className="mb-3 flex items-center gap-2 px-1">
        <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="editorial-eyebrow text-muted-foreground">Trending</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {trendingCompanies.map((name) => {
          // Match by checking if any company name starts with the trending name (case-insensitive)
          const matched = companies.find(
            (c) =>
              c.name.toLowerCase().startsWith(name.toLowerCase()) ||
              c.name.toLowerCase().includes(name.toLowerCase())
          );
          return (
            <button
              key={name}
              onClick={() =>
                matched ? go({ kind: "company", id: matched.id }) : null
              }
              className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-[13px] text-foreground/80 transition-all hover:border-foreground/30 hover:bg-secondary hover:text-foreground"
            >
              {name}
              <ArrowRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-60" />
            </button>
          );
        })}
      </div>

      {/* Subtle example */}
      <div className="mt-12 rounded-xl border border-dashed border-border/80 bg-card/40 p-5">
        <p className="text-[13px] text-muted-foreground">
          <span className="font-medium text-foreground">Try:</span>{" "}
          <button
            onClick={() => {
              const starbucks = companies.find((c) => c.id === "starbucks-corporation");
              if (starbucks) go({ kind: "company", id: starbucks.id });
            }}
            className="font-serif text-[15px] italic text-foreground underline-offset-4 hover:underline"
          >
            Where does my money go when I buy a coffee at Starbucks?
          </button>
        </p>
      </div>
    </div>
  );
}

