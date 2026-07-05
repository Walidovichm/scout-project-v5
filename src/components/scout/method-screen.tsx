"use client";

import { useScout } from "@/lib/store";

export function MethodScreen() {
  const { go } = useScout();

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
      <div className="mb-2 flex items-center gap-2 text-[12px] text-muted-foreground">
        <span>Scout</span>
        <span className="text-border">/</span>
        <span className="text-foreground">Method</span>
      </div>

      <h1 className="editorial-title text-[40px] sm:text-[56px]">Method</h1>

      <p className="editorial-lead mt-4 text-[22px] leading-snug text-foreground sm:text-[26px]">
        How Scout builds what it tells you.
      </p>

      <div className="my-8 h-px bg-border" />

      <div className="space-y-8 text-[16px] leading-[1.75] text-foreground/90">
        <p>
          Most financial information tells you what a company is worth. Scout tells you what a
          company is <em>entangled with</em> — the governments it depends on, the states that hold
          leverage over it, the political currents that could alter its fortunes long before those
          currents show up in a share price. That is a harder thing to measure honestly, and we would
          rather be transparent about the difficulty than pretend it away.
        </p>

        {/* The architecture of a claim */}
        <section>
          <h2 className="editorial-title mb-3 text-[24px]">The architecture of a claim</h2>
          <p>
            Every assertion on Scout rests on a single principle:{" "}
            <strong>a number without a cause is not information, it is decoration.</strong> When we
            tell you that a company's Political Embeddedness score is elevated, that score is never
            presented without the specific relationship that produced it — a shareholding, a
            licensing dependency, a sanctions exposure, a state contract. If we cannot trace a score
            to a cause, we do not publish the score.
          </p>
          <p className="mt-4">
            This is why the Scout Index is built from three distinct pillars rather than a single
            opaque figure. <strong>Strategic Significance</strong> asks how much a company's activity
            matters to state interests — energy, defence, critical infrastructure, data.{" "}
            <strong>Political Embeddedness</strong> asks how directly the state's hand can be felt —
            ownership, procurement, regulatory capture, personnel overlap.{" "}
            <strong>Fragility</strong> asks how exposed the company is to a sudden shift in that
            relationship — a single-customer government contract, a single-jurisdiction supply chain,
            a leadership tied to a single political faction. Each pillar is itself built from
            measurable dimensions, not impressions, and the pillars are combined using a method
            borrowed from established development economics rather than invented for convenience —
            deliberately penalising a single catastrophic exposure rather than letting it be diluted
            away by unrelated strengths, in the same way the Human Development Index refuses to let
            strong wealth mask weak health outcomes.
          </p>
        </section>

        {/* The source hierarchy */}
        <section>
          <h2 className="editorial-title mb-3 text-[24px]">The source hierarchy</h2>
          <p>
            Not all information deserves equal trust, and Scout does not pretend otherwise. Every fact
            carries a visible tier:
          </p>
          <ul className="mt-4 space-y-2">
            <li className="flex gap-3">
              <span className="shrink-0 rounded-full border border-border bg-card px-2 py-0.5 text-[11px] font-medium tabular-nums text-foreground">
                T1
              </span>
              <span>
                <strong>Primary.</strong> Regulatory filings, court records, official state
                disclosures, company disclosures made under legal obligation.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 rounded-full border border-border bg-card px-2 py-0.5 text-[11px] font-medium tabular-nums text-foreground">
                T2
              </span>
              <span>
                <strong>Institutional.</strong> Reporting from established financial data providers,
                multilateral organisations, and recognised research institutions.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 rounded-full border border-border bg-card px-2 py-0.5 text-[11px] font-medium tabular-nums text-foreground">
                T3
              </span>
              <span>
                <strong>Reputable media.</strong> Investigative and beat reporting from publications
                with established editorial standards and a track record of correction.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 rounded-full border border-border bg-card px-2 py-0.5 text-[11px] font-medium tabular-nums text-foreground">
                T4
              </span>
              <span>
                <strong>Secondary.</strong> Analysis, commentary, and aggregation that synthesises the
                above without introducing new primary fact.
              </span>
            </li>
          </ul>
          <p className="mt-4">
            A claim resting on Tier 4 alone is marked as such, and we say so plainly rather than
            letting the confident tone of a well-designed interface imply a certainty the underlying
            evidence does not support.
          </p>
        </section>

        {/* What you are actually reading */}
        <section>
          <h2 className="editorial-title mb-3 text-[24px]">What you are actually reading</h2>
          <p>
            Everything you read on Scout was written and verified by a person. There is no model
            standing between you and the material, generating explanations, answering follow-up
            questions, or deciding what to surface next — what you see is a curated database, not a
            conversation with a machine. We use research tools, including machine learning, in our own
            internal process to help our analysts work through large volumes of filings, reporting,
            and disclosures more quickly than they otherwise could. But acceleration in research is not
            the same as authorship in publication: no claim reaches the product until a person has
            traced it to a source, assigned it a tier, and signed off on the wording. If a fact cannot
            be verified this way, it does not appear — regardless of how efficiently a tool might have
            surfaced it.
          </p>
          <p className="mt-4">
            We are telling you this plainly because we think it matters to how much you trust what
            follows. A platform that asks you to take seriously its judgements about political risk
            should not ask you, in the same breath, to also take on faith the reliability of a
            generative system you cannot inspect. Scout would rather be slower and fully accountable
            for every sentence than fast and only partially so.
          </p>
          <p className="mt-4">
            Scout will not tell you whether to buy or sell anything. Scout will not predict where a
            share price is going. What Scout will do is tell you, as precisely and as honestly as the
            evidence allows, what a company is exposed to and why — and it will tell you when the
            evidence is thin, rather than smoothing over that thinness with confident language. We
            regard that restraint not as a limitation of the product but as the entire basis of
            trusting it.
          </p>
        </section>

        {/* Correction as a discipline */}
        <section>
          <h2 className="editorial-title mb-3 text-[24px]">
            Correction as a discipline, not an embarrassment
          </h2>
          <p>
            Our methodology has changed before and will change again. An earlier hand-assigned scoring
            system produced inconsistencies we were not willing to leave standing — companies with
            materially different political exposure landing in the same tier purely because the
            scoring lacked a rigorous underlying structure. We replaced it, and we are telling you that
            we replaced it, because a platform that asks you to trust its judgement about the world
            should not conceal its own history of getting that judgement wrong.
          </p>
        </section>
      </div>

      <div className="mt-12 flex flex-wrap gap-2">
        <button
          onClick={() => go({ kind: "about" })}
          className="rounded-full border border-border bg-card px-4 py-2 text-[14px] text-foreground transition-colors hover:border-foreground/30 hover:bg-secondary"
        >
          About Scout
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
