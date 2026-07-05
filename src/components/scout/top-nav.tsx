"use client";

import { useScout } from "@/lib/store";
import { useWatchlist } from "@/lib/watchlist-store";
import { companies } from "@/lib/data";
import { ArrowLeft, Compass, Search, Eye, FlaskConical, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopNav() {
  const { view, go, back, home } = useScout();
  const { watched, lastSeenEvents } = useWatchlist();
  const onHome = view.kind === "search";

  // Count new notifications across watched companies
  let newNotificationCount = 0;
  for (const companyId of watched) {
    const company = companies.find((c) => c.id === companyId);
    if (!company) continue;
    const lastSeenId = lastSeenEvents[companyId];
    if (lastSeenId === "init" || !lastSeenId) continue;
    // Find the year of the last seen event
    const lastSeenEvent = company.timeline.find((e) => e.id === lastSeenId);
    const lastSeenYear = lastSeenEvent ? lastSeenEvent.year : 0;
    // Count events with year > lastSeenYear
    for (const event of company.timeline) {
      if (event.year > lastSeenYear) {
        newNotificationCount++;
      }
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-2 px-4 sm:px-6">
        <button
          onClick={home}
          className="group flex items-center gap-2 pr-3 transition-opacity"
          aria-label="Scout home"
        >
          <span className="relative flex h-7 w-7 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-foreground" />
            <span className="absolute inset-1 rounded-full bg-background" />
            <span className="absolute inset-[10px] rounded-full bg-terra pulse-dot" />
          </span>
          <span className="font-serif text-[19px] font-medium tracking-tight">
            Scout
          </span>
        </button>

        <div className="ml-1 hidden h-5 w-px bg-border sm:block" />

        <nav className="ml-1 hidden items-center gap-1 sm:flex">
          <Button
            variant={view.kind === "discover" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => go({ kind: "discover" })}
            className="h-8 gap-1.5 text-[13px]"
          >
            <Compass className="h-3.5 w-3.5" />
            Discover
          </Button>
          <Button
            variant={view.kind === "watchlist" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => go({ kind: "watchlist" })}
            className="relative h-8 gap-1.5 text-[13px]"
          >
            <Eye className="h-3.5 w-3.5" />
            Watchlist
            {newNotificationCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-terra px-1 text-[10px] font-medium text-background">
                {newNotificationCount > 9 ? "9+" : newNotificationCount}
              </span>
            )}
          </Button>
          <Button
            variant={view.kind === "method" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => go({ kind: "method" })}
            className="h-8 gap-1.5 text-[13px]"
          >
            <FlaskConical className="h-3.5 w-3.5" />
            Method
          </Button>
          <Button
            variant={view.kind === "about" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => go({ kind: "about" })}
            className="h-8 gap-1.5 text-[13px]"
          >
            <Info className="h-3.5 w-3.5" />
            About
          </Button>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Mobile watchlist eye */}
          <Button
            variant={view.kind === "watchlist" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => go({ kind: "watchlist" })}
            className="relative h-8 w-8 sm:hidden"
            aria-label="Watchlist"
          >
            <Eye className="h-4 w-4" />
            {newNotificationCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-terra px-1 text-[10px] font-medium text-background">
                {newNotificationCount > 9 ? "9+" : newNotificationCount}
              </span>
            )}
          </Button>
          {!onHome && (
            <Button
              variant="ghost"
              size="sm"
              onClick={back}
              className="h-8 gap-1.5 text-[13px]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Button>
          )}
          {!onHome && (
            <Button
              variant="ghost"
              size="icon"
              onClick={home}
              className="h-8 w-8"
              aria-label="New search"
            >
              <Search className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
