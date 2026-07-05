"use client";

import { useScout } from "@/lib/store";
import { getCompany } from "@/lib/data";
import { TopNav } from "@/components/scout/top-nav";
import { SearchScreen } from "@/components/scout/search-screen";
import { CompanyScreen } from "@/components/scout/company-screen";
import { ConnectionsScreen } from "@/components/scout/connections-screen";
import { MoneyJourneyScreen } from "@/components/scout/money-journey";
import { TimelineScreen } from "@/components/scout/timeline";
import { DiscoverScreen } from "@/components/scout/discover-screen";
import { AboutScreen } from "@/components/scout/about-screen";
import { MethodScreen } from "@/components/scout/method-screen";
import { ReportScreen, SourcesScreen } from "@/components/scout/report-screen";
import { WatchlistScreen } from "@/components/scout/watchlist-screen";
import { CompanyScreenV2 } from "@/components/scout/company-screen-v2";

export default function Home() {
  const { view } = useScout();

  const renderView = () => {
    switch (view.kind) {
      case "search":
        return <SearchScreen />;
      case "discover":
        return <DiscoverScreen />;
      case "watchlist":
        return <WatchlistScreen />;
      case "about":
        return <AboutScreen />;
      case "method":
        return <MethodScreen />;
      case "company": {
        const c = getCompany(view.id);
        return c ? <CompanyScreenV2 company={c} /> : <SearchScreen />;
      }
      case "company-mock": {
        const c = getCompany(view.id);
        return c ? <CompanyScreenV2 company={c} /> : <SearchScreen />;
      }
      case "connections": {
        const c = getCompany(view.id);
        return c ? <ConnectionsScreen company={c} /> : <SearchScreen />;
      }
      case "money-journey": {
        const c = getCompany(view.id);
        return c ? <MoneyJourneyScreen company={c} /> : <SearchScreen />;
      }
      case "timeline": {
        const c = getCompany(view.id);
        return c ? <TimelineScreen company={c} /> : <SearchScreen />;
      }
      case "report": {
        const c = getCompany(view.id);
        return c ? <ReportScreen company={c} /> : <SearchScreen />;
      }
      case "sources": {
        const c = getCompany(view.id);
        return c ? <SourcesScreen company={c} /> : <SearchScreen />;
      }
      default:
        return <SearchScreen />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNav />
      <main className="flex-1">{renderView()}</main>
    </div>
  );
}
