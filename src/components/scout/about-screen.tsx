"use client";

import { useScout } from "@/lib/store";

export function AboutScreen() {
  const { go } = useScout();

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
      <div className="mb-2 flex items-center gap-2 text-[12px] text-muted-foreground">
        <span>Scout</span>
        <span className="text-border">/</span>
        <span className="text-foreground">About</span>
      </div>

      <h1 className="editorial-title text-[40px] sm:text-[56px]">About</h1>

      <p className="editorial-lead mt-4 text-[22px] leading-snug text-foreground sm:text-[26px]">
        Why Scout exists.
      </p>

      <div className="my-8 h-px bg-border" />

      <div className="space-y-8 text-[16px] leading-[1.75] text-foreground/90">
        <p>
          Every consumer with a bank card and a pension makes political decisions without realising
          it. The coffee you buy, the phone you carry, the fund your pension sits in — each is a
          small vote cast into a web of state interests, sovereign ownership, and geopolitical risk
          that almost never appears on a receipt or a fund fact sheet. Scout exists to make that web
          visible, in plain language, to the person actually holding the money.
        </p>
        <p>
          This is a different question from the one most financial platforms answer. A terminal built
          for a trading desk assumes you already know what you are looking for and simply need it
          faster. An ESG platform tells you whether a company behaves well. Neither tells you what we
          think is the more fundamental question:{" "}
          <strong>who, politically, is standing behind — or leaning on — the company you are about to
          give your money to?</strong>
        </p>

        {/* Who Scout is for */}
        <section>
          <h2 className="editorial-title mb-3 text-[24px]">Who Scout is for</h2>
          <p>
            Scout is built first for the individual: the saver choosing where a pension is invested,
            the consumer curious why a familiar brand keeps appearing in unfamiliar headlines, the
            early-career professional trying to understand the world their money moves through. We
            built the professional layer — deeper reporting, export, extended historical depth — only
            after satisfying ourselves that the consumer experience stood on its own merits, because
            we did not want to build another tool that speaks fluently to analysts and condescends to
            everyone else.
          </p>
        </section>

        {/* What we believe */}
        <section>
          <h2 className="editorial-title mb-3 text-[24px]">What we believe</h2>
          <p>
            We believe that political exposure is a form of risk that deserves the same rigour
            ordinarily reserved for financial risk, and that it has been left to journalists and
            specialists for too long simply because nobody built the infrastructure to quantify it
            consistently.
          </p>
          <p className="mt-4">
            We believe that simplicity, honestly earned through good structure, is a form of respect
            for the reader — not a dilution of the material. A well-built interface should make a
            genuinely difficult subject tractable without making it false.
          </p>
          <p className="mt-4">
            We believe curiosity is worth designing for. A platform that answers only the question you
            arrived with, and gives you no reason to ask the next one, has failed at half its purpose.
          </p>
          <p className="mt-4">
            We believe that judgement about political risk belongs to people, not to models.
            Technology helps our analysts work faster; it does not decide what is true. Every claim
            you read has a named methodology and a human being who stands behind it.
          </p>
          <p className="mt-4">
            And we believe that an institution asking to be trusted with judgements about the world
            owes its reader an honest account of its own uncertainty — which is why you will find
            confidence levels, source tiers, and a visible history of our own corrections throughout
            the product, rather than a single confident number and nothing else.
          </p>
        </section>

        {/* Where we are going */}
        <section>
          <h2 className="editorial-title mb-3 text-[24px]">Where we are going</h2>
          <p>
            Scout today is a way of seeing a single company clearly. The underlying knowledge graph —
            built to trace relationships between firms, states, and capital rather than merely to
            store facts about each in isolation — is designed to grow into something considerably
            larger: a map of political and financial entanglement broad enough that an individual
            investor, for the first time, can ask of the whole of their portfolio the question a
            sovereign wealth fund's research desk would ask of a single position.
          </p>
        </section>
      </div>

      <div className="mt-12 flex flex-wrap gap-2">
        <button
          onClick={() => go({ kind: "method" })}
          className="rounded-full border border-border bg-card px-4 py-2 text-[14px] text-foreground transition-colors hover:border-foreground/30 hover:bg-secondary"
        >
          How Scout works
        </button>
        <button
          onClick={() => go({ kind: "search" })}
          className="rounded-full border border-border bg-card px-4 py-2 text-[14px] text-foreground transition-colors hover:border-foreground/30 hover:bg-secondary"
        >
          Start searching
        </button>
      </div>
    </div>
  );
}
