"use client";

import { useScout } from "@/lib/store";
import { useWatchlist } from "@/lib/watchlist-store";
import { companies } from "@/lib/data";
import { CompanyLogo } from "./company-logo";
import { Eye, EyeOff, X, AlertCircle, TrendingUp, ShieldAlert, FileText, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const categoryIcon: Record<string, typeof AlertCircle> = {
  Sanctions: ShieldAlert,
  Regulation: FileText,
  Government: Users,
  "Supply Chain": AlertCircle,
  Strategy: TrendingUp,
  Funding: TrendingUp,
  Acquisition: TrendingUp,
  Leadership: Users,
};

const categoryColor: Record<string, string> = {
  Sanctions: "text-red-600",
  Regulation: "text-amber-600",
  Government: "text-blue-600",
  "Supply Chain": "text-orange-600",
  Strategy: "text-terra",
  Funding: "text-terra",
  Acquisition: "text-terra",
  Leadership: "text-muted-foreground",
};

export function WatchlistScreen() {
  const { go } = useScout();
  const { watched, lastSeenEvents, markEventsSeen, toggleWatch } = useWatchlist();

  const watchedCompanies = companies.filter((c) => watched.includes(c.id));

  // Collect all unwatched events across watched companies
  type Notification = {
    companyId: string;
    companyName: string;
    companyLogo?: string;
    companyLogoFallback?: string;
    companyBrandColor?: string;
    eventId: string;
    date: string;
    year: number;
    title: string;
    category: string;
    description: string;
    isNew: boolean;
  };

  const notifications: Notification[] = [];
  for (const company of watchedCompanies) {
    const lastSeenId = lastSeenEvents[company.id];
    if (lastSeenId === "init" || !lastSeenId) continue;

    // Find the year of the last seen event
    const lastSeenEvent = company.timeline.find((e) => e.id === lastSeenId);
    const lastSeenYear = lastSeenEvent ? lastSeenEvent.year : 0;

    for (const event of company.timeline) {
      // An event is "new" if its year is strictly greater than the last seen year
      if (event.year > lastSeenYear) {
        notifications.push({
          companyId: company.id,
          companyName: company.name,
          companyLogo: company.logo,
          companyLogoFallback: company.logoFallback,
          companyBrandColor: company.brandColor,
          eventId: event.id,
          date: event.date,
          year: event.year,
          title: event.title,
          category: event.category,
          description: event.description,
          isNew: true,
        });
      }
    }
  }

  // Sort notifications by year (most recent first)
  notifications.sort((a, b) => b.year - a.year);

  const newCount = notifications.length;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
      <div className="mb-2 flex items-center gap-2 text-[12px] text-muted-foreground">
        <span>Scout</span>
        <span className="text-border">/</span>
        <span className="text-foreground">Watchlist</span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="editorial-title text-[40px] sm:text-[48px]">Watchlist</h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            Companies you're tracking. Scout alerts you here when disruptive geopolitical events
            affect any of them.
          </p>
        </div>
        {watchedCompanies.length > 0 && (
          <div className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-[12px] text-muted-foreground">
            <span className="tabular-nums text-foreground">{watchedCompanies.length}</span> watched
            {newCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-terra">
                <span className="h-1.5 w-1.5 rounded-full bg-terra" />
                {newCount} new
              </span>
            )}
          </div>
        )}
      </div>

      <div className="my-8 h-px bg-border" />

      {watchedCompanies.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
          <EyeOff className="mx-auto mb-4 h-10 w-10 text-muted-foreground/40" />
          <h2 className="editorial-title text-[22px]">No companies watched yet</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
            Open any company and click the <strong>Watch</strong> button to add it to your watchlist.
            You'll receive notifications here when disruptive geopolitical events affect the company.
          </p>
          <button
            onClick={() => go({ kind: "discover" })}
            className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-[13px] text-background transition-opacity hover:opacity-90"
          >
            Browse companies
          </button>
        </div>
      ) : (
        <>
          {/* New notifications section */}
          {newCount > 0 && (
            <section className="mb-10">
              <div className="mb-4 flex items-center gap-2">
                <Eye className="h-4 w-4 text-terra" />
                <h2 className="editorial-title text-[20px]">New alerts</h2>
                <span className="rounded-full bg-terra px-2 py-0.5 text-[11px] font-medium text-background">
                  {newCount}
                </span>
                <button
                  onClick={() => {
                    // Mark all as seen — set lastSeenId to the most recent event by year
                    for (const company of watchedCompanies) {
                      const sorted = [...company.timeline].sort((a, b) => b.year - a.year);
                      const latestEvent = sorted[0];
                      if (latestEvent) {
                        markEventsSeen(company.id, latestEvent.id);
                      }
                    }
                  }}
                  className="ml-auto text-[12px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Mark all as read
                </button>
              </div>
              <div className="space-y-2">
                {notifications.map((n, i) => {
              const Icon = categoryIcon[n.category] || AlertCircle;
              const colorClass = categoryColor[n.category] || "text-muted-foreground";
              return (
                <button
                  key={`${n.companyId}-${n.eventId}`}
                  onClick={() => {
                    // Mark this event and all earlier ones as seen
                    // by setting lastSeenId to this event (year-based)
                    markEventsSeen(n.companyId, n.eventId);
                    go({ kind: "timeline", id: n.companyId });
                  }}
                  className="group flex w-full items-start gap-3 rounded-xl border border-terra/30 bg-terra-soft/10 p-4 text-left transition-all hover:border-terra/50 hover:bg-terra-soft/20"
                >
                  <div className="mt-0.5 shrink-0">
                    <CompanyLogo
                      name={n.companyName}
                      src={n.companyLogo}
                      fallbackSrc={n.companyLogoFallback}
                      brandColor={n.companyBrandColor}
                      size="sm"
                      rounded="md"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[13px] font-medium text-foreground">
                        {n.companyName}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{n.date}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <Icon className={cn("h-3 w-3", colorClass)} />
                      <span className="text-[13.5px] font-medium text-foreground">
                        {n.title}
                      </span>
                      <span className="text-[11px] text-muted-foreground">· {n.category}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">
                      {n.description}
                    </p>
                  </div>
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-terra" />
                </button>
              );
            })}
              </div>
            </section>
          )}

          {/* Watched companies */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <h2 className="editorial-title text-[20px]">Watched companies</h2>
              <span className="text-[12px] text-muted-foreground">
                {watchedCompanies.length} total
              </span>
            </div>
            <div className="space-y-2">
              {watchedCompanies.map((company) => {
                const sortedTimeline = [...company.timeline].sort((a, b) => b.year - a.year);
                const latestEvent = sortedTimeline[0];
                const lastSeenId = lastSeenEvents[company.id];
                const hasNew = lastSeenId !== "init" && latestEvent && lastSeenId !== latestEvent.id;

                return (
                  <div
                    key={company.id}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl border bg-card p-4 transition-all",
                      hasNew ? "border-terra/30" : "border-border hover:border-foreground/20"
                    )}
                  >
                    <button
                      onClick={() => go({ kind: "company", id: company.id })}
                      className="flex flex-1 items-center gap-3 text-left"
                    >
                      <CompanyLogo
                        name={company.name}
                        src={company.logo}
                        fallbackSrc={company.logoFallback}
                        brandColor={company.brandColor}
                        size="md"
                        rounded="md"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="truncate text-[14.5px] font-medium text-foreground">
                            {company.name}
                          </span>
                          <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                            {company.scoutIndex}/100
                          </span>
                        </div>
                        <div className="truncate text-[12px] text-muted-foreground">
                          {company.country} · {company.sector}
                        </div>
                        {latestEvent && (
                          <div className="mt-1 truncate text-[11.5px] text-muted-foreground/80">
                            <span className="text-muted-foreground/60">Latest:</span>{" "}
                            {latestEvent.date} — {latestEvent.title}
                          </div>
                        )}
                      </div>
                    </button>
                    <button
                      onClick={() => toggleWatch(company.id)}
                      className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      aria-label="Remove from watchlist"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
