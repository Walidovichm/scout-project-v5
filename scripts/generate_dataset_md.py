"""
Scout — Markdown generator for 50-company real dataset.
Reads /home/z/my-project/scripts/companies_dataset.py
Writes /home/z/my-project/download/scout-companies-dataset.md
"""
import sys
import os

sys.path.insert(0, "/home/z/my-project/scripts")
from companies_dataset import COMPANIES

TIER_NAMES = {
    1: "Primary source",
    2: "Institutional source",
    3: "Reputable media",
    4: "Secondary source",
}


def fmt_tuple_list(items, formatter):
    """Format a list of tuples into markdown lines using the formatter function."""
    return [formatter(item) for item in items]


def fmt_investor(item):
    name, pct, desc = item
    return f"- **{name}** — {pct} — {desc}"


def fmt_government(item):
    name, role, *rest = item
    strength = rest[0] if rest else ""
    strength_str = f" *({strength})*" if strength else ""
    return f"- **{name}** — {role}{strength_str}"


def fmt_supplier(item):
    name, role, *rest = item
    strength = rest[0] if rest else ""
    strength_str = f" *({strength})*" if strength else ""
    return f"- **{name}** — {role}{strength_str}"


def fmt_country(item):
    name, role = item
    return f"- **{name}** — {role}"


def fmt_money_step(item, idx):
    step, detail, pct, confidence = item
    pct_str = f" ({pct}%)" if pct is not None else ""
    return f"{idx}. **{step}**{pct_str} — {detail} *[{confidence}]*"


def fmt_timeline(item):
    date, title, category, desc = item
    return f"- **{date}** — **{title}** *({category})* — {desc}"


def fmt_source(item):
    name, type_, date, tier = item
    return f"- {name} — {type_} — {date} — **Tier {tier}** ({TIER_NAMES.get(tier, '')})"


def generate_company(c):
    """Generate markdown for a single company."""
    lines = []
    lines.append(f"## {c['n']}. {c['name']}")
    lines.append("")
    lines.append(f"| Field | Value |")
    lines.append(f"|---|---|")
    lines.append(f"| Country | {c['country']} ({c['cc']}) |")
    lines.append(f"| Sector | {c['sector']} |")
    lines.append(f"| Founded | {c['founded']} |")
    lines.append(f"| Employees | {c['employees']} |")
    lines.append(f"| Headquarters | {c['hq']} |")
    lines.append(f"| CEO | {c['ceo']} |")
    lines.append(f"| Market cap | {c['marketCap']} |")
    lines.append("")

    # Hero quote
    lines.append(f"> *{c.get('insights', [''])[0][:0]}{c['name']} sits at the centre of a complex global ecosystem. See below for the political, financial and strategic relationships.*")
    lines.append("")

    # Footprint
    lines.append(f"### Political Footprint: **{c['footprint']}/100**")
    lines.append("")
    lines.append("| Dimension | Score |")
    lines.append("|---|---|")
    for dim, score in c["dimensions"].items():
        lines.append(f"| {dim} | {score} |")
    lines.append("")

    # Three key insights
    lines.append("### Three Key Insights")
    lines.append("")
    for i, insight in enumerate(c["insights"], 1):
        lines.append(f"{i}. {insight}")
    lines.append("")

    # Investors
    lines.append("### Major Investors")
    lines.append("")
    lines.extend(fmt_tuple_list(c["investors"], fmt_investor))
    lines.append("")

    # Governments
    lines.append("### Government Relations")
    lines.append("")
    lines.extend(fmt_tuple_list(c["governments"], fmt_government))
    lines.append("")

    # Suppliers
    lines.append("### Critical Suppliers")
    lines.append("")
    lines.extend(fmt_tuple_list(c["suppliers"], fmt_supplier))
    lines.append("")

    # Countries
    lines.append("### Country Operations & Dependencies")
    lines.append("")
    lines.extend(fmt_tuple_list(c["countries"], fmt_country))
    lines.append("")

    # Money journey
    lines.append("### Money Journey")
    lines.append("")
    lines.append("*Educational visualisation — illustrates principal pathways, not exact accounting.*")
    lines.append("")
    for i, item in enumerate(c["money_journey"], 1):
        lines.append(fmt_money_step(item, i))
    lines.append("")

    # Timeline
    lines.append("### Timeline")
    lines.append("")
    lines.extend(fmt_tuple_list(c["timeline"], fmt_timeline))
    lines.append("")

    # Sources
    lines.append("### Sources")
    lines.append("")
    lines.extend(fmt_tuple_list(c["sources"], fmt_source))
    lines.append("")

    lines.append("---")
    lines.append("")

    return "\n".join(lines)


def generate():
    out = []
    # Header
    out.append("# Scout — Company Dataset")
    out.append("")
    out.append("## 50 geopolitically significant companies · Real intelligence data")
    out.append("")
    out.append("*Scout — Consumer Geopolitical Intelligence Platform*")
    out.append("")
    out.append("**Everything is political.**")
    out.append("")
    out.append("---")
    out.append("")
    out.append("## About this dataset")
    out.append("")
    out.append("This dataset contains real, publicly disclosed intelligence on 50 of the world's")
    out.append("most geopolitically significant companies. Each entry follows the structure defined")
    out.append("in the Scout PRD and includes:")
    out.append("")
    out.append("- **Identity** — country, sector, founding, CEO, market cap")
    out.append("- **Political Footprint** — a 0-100 score across 8 dimensions of geopolitical exposure")
    out.append("- **Three Key Insights** — the most important facts a consumer should understand in 30 seconds")
    out.append("- **Major Investors** — top shareholders with ownership percentages")
    out.append("- **Government Relations** — key government relationships and their strategic importance")
    out.append("- **Critical Suppliers** — supply chain dependencies and their strength")
    out.append("- **Country Operations & Dependencies** — geographic concentration of operations")
    out.append("- **Money Journey** — illustrative flow of how money moves through the company")
    out.append("- **Timeline** — recent geopolitical events affecting the company")
    out.append("- **Sources** — primary sources used to compile the data, ranked by tier")
    out.append("")
    out.append("### Source hierarchy")
    out.append("")
    out.append("| Tier | Type |")
    out.append("|---|---|")
    out.append("| 1 | Primary sources — corporate filings, government databases, regulatory decisions, court documents |")
    out.append("| 2 | Institutional sources — international organisations, central banks, sovereign fund reports |")
    out.append("| 3 | Reputable media — Reuters, Financial Times, Bloomberg, The Economist |")
    out.append("| 4 | Secondary sources — think tanks, academic publications, industry reports |")
    out.append("")
    out.append("### Important disclaimers")
    out.append("")
    out.append("- All market capitalisations, ownership percentages, employee counts and financial metrics are approximate and current as of early 2025 unless otherwise noted.")
    out.append("- This dataset is for **educational and editorial purposes only**. It is not investment advice.")
    out.append("- Scout does not predict markets, recommend stocks, or advocate political positions. It documents relationships and explains their potential significance.")
    out.append("- Every effort has been made to ensure accuracy, but readers should consult primary sources for any decision-making purpose.")
    out.append("")
    out.append("---")
    out.append("")
    # Table of contents
    out.append("## Table of Contents")
    out.append("")
    out.append("### Technology · Semiconductors · Consumer Electronics (1-12)")
    out.append("")
    for c in COMPANIES[:12]:
        out.append(f"- {c['n']}. {c['name']}")
    out.append("")
    out.append("### Telecom · Automotive · Energy (13-23)")
    out.append("")
    for c in COMPANIES[12:23]:
        out.append(f"- {c['n']}. {c['name']}")
    out.append("")
    out.append("### Consumer Goods · Food · Beverage · Luxury · Retail (24-33)")
    out.append("")
    for c in COMPANIES[23:33]:
        out.append(f"- {c['n']}. {c['name']}")
    out.append("")
    out.append("### Pharmaceuticals · Defence · Aerospace (34-43)")
    out.append("")
    for c in COMPANIES[33:43]:
        out.append(f"- {c['n']}. {c['name']}")
    out.append("")
    out.append("### Finance · Mining · Critical Manufacturing · Conglomerates (44-50)")
    out.append("")
    for c in COMPANIES[43:]:
        out.append(f"- {c['n']}. {c['name']}")
    out.append("")
    out.append("---")
    out.append("")

    # Companies
    for c in COMPANIES:
        out.append(generate_company(c))

    # Footer
    out.append("## Dataset metadata")
    out.append("")
    out.append(f"- **Total companies**: {len(COMPANIES)}")
    out.append(f"- **Countries represented**: {len(set(c['country'].split(' / ')[0] for c in COMPANIES))}")
    out.append(f"- **Average Political Footprint**: {sum(c['footprint'] for c in COMPANIES) // len(COMPANIES)}/100")
    out.append(f"- **Sectors covered**: Technology, Semiconductors, Telecom, Automotive, Energy, Consumer Goods, Food & Beverage, Luxury, Retail, Pharmaceuticals, Defence, Aerospace, Finance, Mining, Manufacturing, Conglomerates")
    out.append("")
    out.append("---")
    out.append("")
    out.append("*Scout — Understand where your money goes.*")
    out.append("")

    return "\n".join(out)


if __name__ == "__main__":
    md = generate()
    out_path = "/home/z/my-project/download/scout-companies-dataset.md"
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(md)
    print(f"Wrote {len(md):,} characters to {out_path}")
    print(f"Companies: {len(COMPANIES)}")
