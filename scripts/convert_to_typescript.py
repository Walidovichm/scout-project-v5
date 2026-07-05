"""
Scout — Convert Python dataset to TypeScript.
Reads /home/z/my-project/scripts/companies_dataset.py (50 companies).
Writes /home/z/my-project/src/lib/companies-data.ts.
"""
import json
import re
import sys

sys.path.insert(0, "/home/z/my-project/scripts")
from companies_dataset import COMPANIES

# Map company name → website domain for Clearbit logos
DOMAINS = {
    "Apple Inc.": "apple.com",
    "NVIDIA Corporation": "nvidia.com",
    "TSMC (Taiwan Semiconductor Manufacturing Company)": "tsmc.com",
    "ASML Holding N.V.": "asml.com",
    "Samsung Electronics Co., Ltd.": "samsung.com",
    "Microsoft Corporation": "microsoft.com",
    "Alphabet Inc. (Google)": "abc.xyz",
    "Amazon.com, Inc.": "amazon.com",
    "Meta Platforms, Inc.": "meta.com",
    "Tencent Holdings Ltd.": "tencent.com",
    "Alibaba Group Holding Ltd.": "alibabagroup.com",
    "ByteDance Ltd. (TikTok)": "bytedance.com",
    "Huawei Technologies Co., Ltd.": "huawei.com",
    "Tesla, Inc.": "tesla.com",
    "BYD Company Ltd.": "byd.com",
    "Toyota Motor Corporation": "global.toyota",
    "Volkswagen Group": "volkswagenag.com",
    "Mercedes-Benz Group AG": "mercedes-benz.com",
    "Saudi Aramco": "aramco.com",
    "ExxonMobil Corporation": "corporate.exxonmobil.com",
    "Shell plc": "shell.com",
    "TotalEnergies SE": "totalenergies.com",
    "PetroChina Company Ltd.": "petrochina.com.cn",
    "Nestlé S.A.": "nestle.com",
    "The Coca-Cola Company": "coca-colacompany.com",
    "PepsiCo, Inc.": "pepsico.com",
    "Unilever PLC": "unilever.com",
    "Procter & Gamble Co.": "pg.com",
    "LVMH Moët Hennessy Louis Vuitton SE": "lvmh.com",
    "Starbucks Corporation": "starbucks.com",
    "McDonald's Corporation": "mcdonalds.com",
    "Nike, Inc.": "nike.com",
    "Inter IKEA Group": "ikea.com",
    "Pfizer Inc.": "pfizer.com",
    "Johnson & Johnson": "jnj.com",
    "Novo Nordisk A/S": "novonordisk.com",
    "Roche Holding AG": "roche.com",
    "AstraZeneca plc": "astrazeneca.com",
    "Bayer AG": "bayer.com",
    "Lockheed Martin Corporation": "lockheedmartin.com",
    "RTX Corporation (Raytheon Technologies)": "rtx.com",
    "Airbus SE": "airbus.com",
    "The Boeing Company": "boeing.com",
    "BlackRock, Inc.": "blackrock.com",
    "JPMorgan Chase & Co.": "jpmorganchase.com",
    "Glencore plc": "glencore.com",
    "BHP Group Ltd.": "bhp.com",
    "Foxconn Technology Group (Hon Hai Precision Industry)": "foxconn.com",
    "CATL (Contemporary Amperex Technology Co., Ltd.)": "catl.com",
    "Sony Group Corporation": "sony.com",
    # Batch 2 (51-100)
    "Netflix, Inc.": "netflix.com",
    "Spotify Technology S.A.": "spotify.com",
    "The Walt Disney Company": "thewaltdisneycompany.com",
    "Nintendo Co., Ltd.": "nintendo.com",
    "Electronic Arts Inc.": "ea.com",
    "Warner Bros. Discovery, Inc.": "wbd.com",
    "Uber Technologies, Inc.": "uber.com",
    "Airbnb, Inc.": "airbnb.com",
    "Booking Holdings Inc.": "bookingholdings.com",
    "Marriott International, Inc.": "marriott.com",
    "Delta Air Lines, Inc.": "delta.com",
    "American Airlines Group Inc.": "aa.com",
    "Deutsche Lufthansa AG": "lufthansagroup.com",
    "Emirates Airline (Emirates Group)": "emirates.com",
    "Ryanair Holdings plc": "ryanair.com",
    "Walmart Inc.": "walmart.com",
    "Costco Wholesale Corporation": "costco.com",
    "Target Corporation": "target.com",
    "Inditex S.A. (Zara)": "inditex.com",
    "H&M Hennes & Mauritz AB": "hm.com",
    "Adidas AG": "adidas-group.com",
    "Lululemon Athletica Inc.": "lululemon.com",
    "Mondelez International, Inc.": "mondelezinternational.com",
    "Danone S.A.": "danone.com",
    "Anheuser-Busch InBev SA/NV (AB InBev)": "ab-inbev.com",
    "Heineken N.V.": "theheinekencompany.com",
    "Yum! Brands, Inc.": "yum.com",
    "Domino's Pizza, Inc.": "dominos.com",
    "Bank of America Corporation": "bankofamerica.com",
    "Wells Fargo & Company": "wellsfargo.com",
    "HSBC Holdings plc": "hsbc.com",
    "Banco Santander, S.A.": "santander.com",
    "Allianz SE": "allianz.com",
    "AXA S.A.": "axa.com",
    "Ping An Insurance Group Co. of China": "pingan.com",
    "Berkshire Hathaway Inc.": "berkshirehathaway.com",
    "PayPal Holdings, Inc.": "paypal.com",
    "AT&T Inc.": "att.com",
    "Verizon Communications Inc.": "verizon.com",
    "Vodafone Group plc": "vodafone.com",
    "Deutsche Telekom AG": "telekom.com",
    "China Mobile Ltd.": "chinamobileltd.com",
    "Reliance Jio Platforms (Jio)": "jio.com",
    "Hermès International S.A.": "hermes.com",
    "Kering S.A.": "kering.com",
    "L'Oréal S.A.": "loreal.com",
    "Estée Lauder Companies Inc.": "elcompanies.com",
    "Coinbase Global, Inc.": "coinbase.com",
    "Block, Inc. (Square)": "block.xyz",
    "Take-Two Interactive Software, Inc.": "take2games.com",
}

# =============================================================================
# SimpleIcons slugs — real brand SVG logos served via https://cdn.simpleicons.org/{slug}
# These are real, scalable vector logos for major consumer brands.
# Source: https://simpleicons.org (3000+ brand icons, MIT-licensed)
# =============================================================================

SIMPLEICONS_SLUGS = {
    # ---- Technology / Semiconductors ----
    "Apple Inc.": "apple",
    "NVIDIA Corporation": "nvidia",
    "Samsung Electronics Co., Ltd.": "samsung",
    "Microsoft Corporation": "microsoft",
    "Alphabet Inc. (Google)": "google",
    "Amazon.com, Inc.": "amazon",
    "Meta Platforms, Inc.": "meta",
    "Tencent Holdings Ltd.": "tencentqq",
    "Alibaba Group Holding Ltd.": "alibabacloud",
    "ByteDance Ltd. (TikTok)": "tiktok",
    "Huawei Technologies Co., Ltd.": "huawei",
    "Sony Group Corporation": "sony",

    # ---- Automotive ----
    "Tesla, Inc.": "tesla",
    "Toyota Motor Corporation": "toyota",
    "Volkswagen Group": "volkswagen",
    "Mercedes-Benz Group AG": "mercedes",

    # ---- Energy ----
    "Shell plc": "shell",

    # ---- Consumer Goods / Food / Beverage ----
    "The Coca-Cola Company": "cocacola",
    "PepsiCo, Inc.": "pepsi",
    "Unilever PLC": "unilever",
    "Starbucks Corporation": "starbucks",
    "McDonald's Corporation": "mcdonalds",
    "Nike, Inc.": "nike",
    "Inter IKEA Group": "ikea",
    "Adidas AG": "adidas",
    "Yum! Brands, Inc.": "kfc",

    # ---- Aerospace ----
    "Airbus SE": "airbus",
    "The Boeing Company": "boeing",

    # ---- Finance ----
    "Bank of America Corporation": "bankofamerica",
    "Wells Fargo & Company": "wellsfargo",
    "HSBC Holdings plc": "hsbc",
    "PayPal Holdings, Inc.": "paypal",

    # ---- Streaming / Media / Gaming ----
    "Netflix, Inc.": "netflix",
    "Spotify Technology S.A.": "spotify",
    "Nintendo Co., Ltd.": "nintendo",
    "Electronic Arts Inc.": "ea",
    "Take-Two Interactive Software, Inc.": "rockstargames",

    # ---- Travel / Hospitality ----
    "Uber Technologies, Inc.": "uber",
    "Airbnb, Inc.": "airbnb",
    "Deutsche Lufthansa AG": "lufthansa",

    # ---- Retail ----
    "Walmart Inc.": "walmart",
    "Target Corporation": "target",
    "Inditex S.A. (Zara)": "zara",
    "H&M Hennes & Mauritz AB": "handm",

    # ---- Telecom ----
    "Verizon Communications Inc.": "verizon",
    "Vodafone Group plc": "vodafone",
    "Reliance Jio Platforms (Jio)": "jio",

    # ---- Fintech ----
    "Coinbase Global, Inc.": "coinbase",
    "Block, Inc. (Square)": "square",
}

# Brand colors (hex without #) for SimpleIcons SVGs.
# Source: official brand guidelines / SimpleIcons brand color data.
# Applied via cdn.simpleicons.org/{slug}/{color} which serves the SVG with
# the specified fill color. Falls back to jsdelivr (monochrome) if cdn fails.
BRAND_COLORS = {
    "Apple Inc.": "000000",
    "NVIDIA Corporation": "76B900",
    "Samsung Electronics Co., Ltd.": "1428A0",
    "Microsoft Corporation": "5E5E5E",
    "Alphabet Inc. (Google)": "4285F4",
    "Amazon.com, Inc.": "FF9900",
    "Meta Platforms, Inc.": "0866FF",
    "Tencent Holdings Ltd.": "12B7F5",
    "Alibaba Group Holding Ltd.": "FF6A00",
    "ByteDance Ltd. (TikTok)": "25F4EE",
    "Huawei Technologies Co., Ltd.": "FF0000",
    "Sony Group Corporation": "000000",
    "Tesla, Inc.": "CC0000",
    "Toyota Motor Corporation": "EB0A1E",
    "Volkswagen Group": "001E50",
    "Mercedes-Benz Group AG": "00ADEF",
    "Shell plc": "FBCE07",
    "The Coca-Cola Company": "F40009",
    "PepsiCo, Inc.": "2151A5",
    "Unilever PLC": "1F36C7",
    "Starbucks Corporation": "00704A",
    "McDonald's Corporation": "FBC817",
    "Nike, Inc.": "111111",
    "Inter IKEA Group": "0058A3",
    "Adidas AG": "000000",
    "Yum! Brands, Inc.": "F4501A",
    "Airbus SE": "00205B",
    "The Boeing Company": "1D4E9C",
    "Bank of America Corporation": "012169",
    "Wells Fargo & Company": "D71E28",
    "HSBC Holdings plc": "DB0011",
    "PayPal Holdings, Inc.": "003087",
    "Netflix, Inc.": "E50914",
    "Spotify Technology S.A.": "1DB954",
    "Nintendo Co., Ltd.": "E60012",
    "Electronic Arts Inc.": "000000",
    "Take-Two Interactive Software, Inc.": "FCAF17",
    "Uber Technologies, Inc.": "000000",
    "Airbnb, Inc.": "FF5A5F",
    "Deutsche Lufthansa AG": "05164D",
    "Walmart Inc.": "0071CE",
    "Target Corporation": "CC0000",
    "Inditex S.A. (Zara)": "000000",
    "H&M Hennes & Mauritz AB": "E50010",
    "Verizon Communications Inc.": "CD040B",
    "Vodafone Group plc": "E60000",
    "Reliance Jio Platforms (Jio)": "0F3C97",
    "Coinbase Global, Inc.": "0052FF",
    "Block, Inc. (Square)": "3E4348",
}

# Generic per-dimension descriptions
DIMENSION_DESCRIPTIONS = {
    "Government Dependency": "Measures reliance on public policy, subsidies, procurement and regulatory decisions.",
    "Supply-Chain Concentration": "Measures dependency on a small number of suppliers or geographic regions.",
    "Strategic Sector Relevance": "Measures the company's importance to national strategic interests.",
    "Sanctions Exposure": "Measures direct or indirect exposure to international sanctions regimes.",
    "Regulatory Complexity": "Measures the breadth and intensity of regulatory regimes the company operates under.",
    "State Ownership": "Measures the percentage of equity held by government entities.",
    "Cross-Border Operations": "Measures the geographic spread of operations and revenue.",
    "Critical Infrastructure Exposure": "Measures the extent to which the company operates critical infrastructure.",
}


def slugify(name: str) -> str:
    """Create a slug from a company or entity name."""
    s = re.sub(r"[^a-zA-Z0-9\s]", "", name)
    s = re.sub(r"\s+", "-", s.strip()).lower()
    # Truncate for IDs
    return s[:40]


def slugify_entity(name: str, parent_id: str) -> str:
    """Create a unique-ish entity ID."""
    s = re.sub(r"[^a-zA-Z0-9\s]", "", name)
    s = re.sub(r"\s+", "-", s.strip()).lower()
    return f"{s[:30]}-{parent_id[:8]}"


def split_insight(insight: str):
    """Split an insight string into title + description.
    Title = first ~6 words or up to first comma/period.
    Description = full text.
    """
    # Try to find a natural break
    break_chars = [", ", ". ", " — ", " — ", " - "]
    title = insight
    for bc in break_chars:
        if bc in insight:
            parts = insight.split(bc, 1)
            if 4 <= len(parts[0].split()) <= 12:
                title = parts[0]
                break
    # Fallback: first 6 words
    if title == insight:
        words = insight.split()
        if len(words) > 8:
            title = " ".join(words[:6])
    # Title-case the title (light touch)
    title = title.rstrip(".,;—- ").rstrip()
    return {"title": title, "description": insight}


def derive_ownership(investors):
    """Derive ownership type from investor list."""
    for name, pct_or_role, desc in investors:
        nl = name.lower()
        dl = desc.lower()
        # State Street is a bank, not state ownership — exclude
        if "state street" in nl:
            continue
        if "state ownership" in dl or "state holding" in dl or "sovereign ownership" in dl:
            return "State-controlled"
        if "sovereign wealth" in dl and any(x in pct_or_role for x in ["10", "20", "30", "40", "50", "60", "70", "80", "90"]):
            return "State-controlled"
        if "state" in nl and "ownership" in dl:
            return "State-controlled"
        if "government" in nl and "ownership" in dl:
            return "State-controlled"
        if "foundation" in dl and "control" in dl:
            return "Foundation-controlled"
        if "founder" in dl and "control" in dl:
            return "Founder-controlled"
        if "family" in dl and "control" in dl:
            return "Family-controlled"
    return "Publicly traded"


def build_connections_and_entities(c, company_id):
    """Build connections[] and entities{} from investors/governments/suppliers/countries lists."""
    entities = {}
    connections = []
    edge_id = 0

    # Add the company itself as an entity
    entities[company_id] = {
        "id": company_id,
        "name": c["name"],
        "type": "company",
        "country": c["cc"],
    }

    # Investors → owns edges
    for name, pct_or_role, desc in c.get("investors", []):
        eid = slugify_entity(name, company_id)
        # Determine entity type
        nl = name.lower()
        dl = desc.lower()
        # Known financial institutions that contain "state" but are NOT government
        if "state street" in nl or "state bank" in nl:
            etype = "investor"
        elif "sovereign" in dl or "sovereign wealth" in nl:
            etype = "fund"
        elif "pension" in nl or "pension" in dl:
            etype = "fund"
        elif ("state of" in nl or "government of" in nl or "government" in nl) and "ownership" in dl:
            etype = "government"
        elif "state" in nl and ("ownership" in dl or "holding" in dl or "soe" in dl):
            etype = "government"
        elif "government" in nl and "ownership" in dl:
            etype = "government"
        elif "sasco" in nl or "sasac" in nl:
            etype = "government"
        elif "foundation" in nl or "foundation" in dl:
            etype = "fund"
        else:
            etype = "investor"
        entities[eid] = {
            "id": eid,
            "name": name,
            "type": etype,
            "descriptor": desc,
        }
        # Determine strength from ownership percentage if present
        strength = "Moderate"
        pct_match = re.search(r"~?(\d+(?:\.\d+)?)\s*%", pct_or_role)
        if pct_match:
            pct_val = float(pct_match.group(1))
            if pct_val >= 20:
                strength = "Critical"
            elif pct_val >= 10:
                strength = "High"
            elif pct_val >= 5:
                strength = "Moderate"
            else:
                strength = "Low"
        # Determine confidence
        confidence = "Confirmed" if "13F" in desc or "filing" in desc.lower() or "confirmed" in desc.lower() else "High"
        edge_id += 1
        connections.append({
            "id": f"e{edge_id}",
            "source": eid,
            "target": company_id,
            "label": f"owns {pct_or_role}" if "%" in pct_or_role else pct_or_role,
            "type": "owns",
            "strength": strength,
            "confidence": confidence,
            "description": f"{name} {pct_or_role}. {desc}.",
            "evidence": "Public filings; institutional ownership data.",
        })

    # Governments → regulates edges
    for item in c.get("governments", []):
        name = item[0]
        role = item[1]
        strength = item[2] if len(item) > 2 else "High"
        eid = slugify_entity(name, company_id)
        # Determine if it's a regulator vs government
        nl = name.lower()
        if "union" in nl or "commission" in nl or "authority" in nl or "agency" in nl:
            gtype = "regulator"
        elif "state of" in nl or "government of" in nl or "government" in nl or "ministry" in nl:
            gtype = "government"
        elif "united states" in nl or "united kingdom" in nl or nl in ["china", "russia", "india", "japan", "germany", "france", "brazil", "saudi arabia", "israel", "uae"]:
            gtype = "government"
        else:
            gtype = "regulator"
        entities[eid] = {
            "id": eid,
            "name": name,
            "type": gtype,
            "descriptor": role,
        }
        edge_id += 1
        connections.append({
            "id": f"e{edge_id}",
            "source": eid,
            "target": company_id,
            "label": role[:50] + ("..." if len(role) > 50 else ""),
            "type": "regulates" if "subsid" not in role.lower() and "grant" not in role.lower() else "receives_grant_from",
            "strength": strength,
            "confidence": "Confirmed",
            "description": f"{name}: {role}.",
            "evidence": "Government regulation; public record.",
        })

    # Suppliers → supplies edges
    for item in c.get("suppliers", []):
        name = item[0]
        role = item[1]
        strength = item[2] if len(item) > 2 else "High"
        eid = slugify_entity(name, company_id)
        # Determine if it's a country or a company
        etype = "supplier"
        if any(x in name for x in ["Australia", "Chile", "DRC", "Indonesia", "Brazil", "Vietnam", "India", "China", "Africa", "America", "Europe", "Côte", "Ghana"]):
            etype = "country"
        elif any(x in name for x in ["producers", "farmers", "growers", "suppliers"]):
            etype = "supplier"
        entities[eid] = {
            "id": eid,
            "name": name,
            "type": etype,
            "descriptor": role,
        }
        edge_id += 1
        connections.append({
            "id": f"e{edge_id}",
            "source": eid,
            "target": company_id,
            "label": role[:50] + ("..." if len(role) > 50 else ""),
            "type": "supplies",
            "strength": strength,
            "confidence": "High",
            "description": f"{name}: {role}.",
        })

    # Countries → located_in edges
    for name, role in c.get("countries", []):
        eid = slugify_entity(name, company_id)
        entities[eid] = {
            "id": eid,
            "name": name,
            "type": "country",
            "descriptor": role,
        }
        edge_id += 1
        connections.append({
            "id": f"e{edge_id}",
            "source": company_id,
            "target": eid,
            "label": role[:50] + ("..." if len(role) > 50 else ""),
            "type": "manufactures_in",
            "strength": "High",
            "confidence": "Confirmed",
            "description": f"{name}: {role}.",
        })

    return connections, entities


def build_intelligence_report(c):
    """Synthesize intelligenceReport from insights + dimensions + timeline."""
    insights = c.get("insights", [])
    dimensions = c.get("dimensions", {})

    # Executive summary: first insight, prefixed with company context
    exec_summary = insights[0] if insights else f"{c['name']} is a {c['sector']} company headquartered in {c['hq']}."

    # Political context: second insight or derive from governments
    if len(insights) > 1:
        political = insights[1]
    else:
        political = f"{c['name']} operates under regulatory oversight across multiple jurisdictions including {c['country']}."

    # Financial relationships: derive from investors
    inv = c.get("investors", [])
    if inv:
        top_3 = inv[:3]
        names = ", ".join([i[0] for i in top_3])
        financial = f"Major institutional investors include {names}. The company is {derive_ownership(inv).lower()}."
    else:
        financial = "Ownership structure is private or complex."

    # Government relations: third insight or derive
    if len(insights) > 2:
        gov = insights[2]
    else:
        gov_count = len(c.get("governments", []))
        gov = f"The company maintains government relations across {gov_count} key jurisdictions."

    # Global dependencies: derive from countries
    countries = c.get("countries", [])
    if countries:
        top_country = countries[0]
        global_dep = f"Critical geographic dependencies include {top_country[0]} ({top_country[1]})."
        if len(countries) > 1:
            global_dep += f" Operations span {len(countries)}+ countries."
    else:
        global_dep = "Operations are concentrated in the company's home market."

    # Strategic risks: derive from highest-scoring dimensions
    sorted_dims = sorted(dimensions.items(), key=lambda x: -x[1])
    top_dims = sorted_dims[:3]
    risks = "Key strategic risks include: " + "; ".join([f"{d[0]} ({d[1]}/100)" for d in top_dims]) + "."

    # Future watchpoints: derive from timeline
    timeline = c.get("timeline", [])
    if timeline:
        most_recent = timeline[0]
        watch = f"Watch for developments following: {most_recent[1]} ({most_recent[0]})."
    else:
        watch = "No major recent events to flag."

    return {
        "executiveSummary": exec_summary,
        "politicalContext": political,
        "financialRelationships": financial,
        "governmentRelations": gov,
        "globalDependencies": global_dep,
        "strategicRisks": risks,
        "futureWatchpoints": watch,
    }


# =============================================================================
# Scout Index — rigorous composite score
# See /download/scout-index-methodology.md for the full formula.
# =============================================================================

import math as _math

# Pillar structure: dimension name → (pillar, weight within pillar)
PILLAR_MAP = {
    "Strategic Sector Relevance":      ("strategic", 0.50),
    "Critical Infrastructure Exposure":("strategic", 0.30),
    "Cross-Border Operations":         ("strategic", 0.20),
    "Government Dependency":           ("political", 0.40),
    "State Ownership":                 ("political", 0.40),
    "Regulatory Complexity":           ("political", 0.20),
    "Sanctions Exposure":              ("fragility", 0.50),
    "Supply-Chain Concentration":      ("fragility", 0.50),
}

# Composite weights for the three pillars
PILLAR_WEIGHTS = {
    "strategic": 0.35,
    "political": 0.35,
    "fragility": 0.30,
}

PILLAR_LABELS = {
    "strategic": "Strategic Significance",
    "political": "Political Embeddedness",
    "fragility": "Fragility",
}

PILLAR_QUESTIONS = {
    "strategic": "How much does this company matter to geopolitics?",
    "political": "How connected is this company to state power?",
    "fragility": "How vulnerable is this company to disruption?",
}


def _weighted_power_mean_half(values_weights):
    """Weighted power mean with p = 1/2.
    M_{1/2}(x; w) = (sum w_i * sqrt(x_i))^2
    Returns 0 if all values are 0.
    """
    total_w = sum(w for _, w in values_weights)
    if total_w == 0:
        return 0.0
    s = sum(w * _math.sqrt(max(0.0, v)) for v, w in values_weights)
    return (s / total_w) ** 2 if total_w != 1 else s ** 2  # weights already sum to 1 in our use


def _tier_for_score(score):
    """Classify a Scout Index score into a tier."""
    if score < 25:
        return "Low"
    if score < 50:
        return "Moderate"
    if score < 70:
        return "Elevated"
    if score < 85:
        return "High"
    return "Critical"


def calculate_scout_index(dimensions):
    """Compute the Scout Index from raw dimension scores.

    Args:
        dimensions: dict of {dimension_name: score_0_to_100}

    Returns:
        (scout_index, pillars, tier, confidence)
        pillars: list of {id, label, question, score, weight, dimensions: [{label, score, weight}]}
    """
    # Group dimensions by pillar
    pillar_dims = {"strategic": [], "political": [], "fragility": []}
    for dim_name, score in dimensions.items():
        if dim_name in PILLAR_MAP:
            pillar, weight = PILLAR_MAP[dim_name]
            pillar_dims[pillar].append((dim_name, score, weight))

    # Compute pillar scores via weighted power mean (p=1/2)
    pillar_scores = {}
    pillars_output = []
    for pillar_key in ["strategic", "political", "fragility"]:
        dims = pillar_dims[pillar_key]
        if not dims:
            pillar_scores[pillar_key] = 0.0
            continue
        # weights are pre-normalized to sum to 1 within each pillar in PILLAR_MAP
        values_weights = [(score, weight) for _, score, weight in dims]
        score = _weighted_power_mean_half(values_weights)
        pillar_scores[pillar_key] = score
        pillars_output.append({
            "id": pillar_key,
            "label": PILLAR_LABELS[pillar_key],
            "question": PILLAR_QUESTIONS[pillar_key],
            "score": round(score, 1),
            "weight": PILLAR_WEIGHTS[pillar_key],
            "dimensions": [
                {"label": name, "score": sc, "weight": w}
                for name, sc, w in dims
            ],
        })

    # Composite: weighted power mean of pillars (p=1/2)
    composite_inputs = [
        (pillar_scores["strategic"], PILLAR_WEIGHTS["strategic"]),
        (pillar_scores["political"], PILLAR_WEIGHTS["political"]),
        (pillar_scores["fragility"], PILLAR_WEIGHTS["fragility"]),
    ]
    base = _weighted_power_mean_half(composite_inputs)

    # Critical Exposure Spike: max dimension > 85 amplifies up to +20%
    max_dim = max(dimensions.values()) if dimensions else 0
    if max_dim > 85:
        spike_multiplier = 1.0 + 0.20 * ((max_dim - 85) / 15.0)
    else:
        spike_multiplier = 1.0

    final = min(100.0, base * spike_multiplier)

    # Confidence band: ±max(2, 0.04 * score)
    confidence = max(2.0, 0.04 * final)

    tier = _tier_for_score(final)

    return round(final, 1), pillars_output, tier, round(confidence, 1)


def generate_editorial(c, scout_index, pillars):
    """Auto-generate editorial content for the v2 company page.

    Returns:
        {
            governingQuestion: str,
            governingAnswer: str,
            pillarNarratives: {strategic, political, fragility},
            supportingInsights: [{title, detail}]
        }
    """
    name = c["name"]
    dims = c.get("dimensions", {})
    raw_insights = c.get("insights", [])

    # ── Identify the driving dimension (highest score) ──────────────────
    sorted_dims = sorted(dims.items(), key=lambda x: -x[1])
    top_dim_name, top_dim_score = sorted_dims[0]
    second_dim_name, second_dim_score = sorted_dims[1] if len(sorted_dims) > 1 else ("", 0)

    # ── Identify which pillar has the highest score ─────────────────────
    pillar_scores = {p["id"]: p["score"] for p in pillars}
    dominant_pillar = max(pillar_scores, key=pillar_scores.get)
    dominant_score = pillar_scores[dominant_pillar]

    # ── Generate governing question ─────────────────────────────────────
    # Based on the company's most distinctive geopolitical feature
    if dims.get("State Ownership", 0) >= 50:
        governing_question = f"Why is {name} an arm of state power rather than a private company?"
    elif dims.get("Sanctions Exposure", 0) >= 80:
        governing_question = f"Why is {name} at the frontline of U.S.–China technology competition?"
    elif dims.get("Supply-Chain Concentration", 0) >= 85:
        governing_question = f"Why does {name}'s entire business depend on a single supplier?"
    elif dims.get("Strategic Sector Relevance", 0) >= 85:
        governing_question = f"Why is {name} classified as critical infrastructure by multiple governments?"
    elif dims.get("Government Dependency", 0) >= 80:
        governing_question = f"Why does {name}'s business model depend on public money?"
    elif dims.get("Regulatory Complexity", 0) >= 85:
        governing_question = f"Why is {name} simultaneously regulated by dozens of governments?"
    elif dims.get("Critical Infrastructure Exposure", 0) >= 80:
        governing_question = f"Why do governments consider {name} too important to fail?"
    elif dims.get("Cross-Border Operations", 0) >= 85:
        governing_question = f"Why does {name}'s revenue depend on political stability in 50+ countries?"
    else:
        governing_question = f"What makes {name} geopolitically significant?"

    # ── Generate governing answer ───────────────────────────────────────
    # 2-3 sentences synthesizing the company's geopolitical position
    answer_parts = []

    # Sentence 1: the core claim
    if dims.get("State Ownership", 0) >= 50:
        gov_pct = dims.get("State Ownership", 0)
        answer_parts.append(
            f"{name} is {gov_pct}% state-owned, making it an instrument of national policy rather than a purely commercial entity."
        )
    elif dims.get("Sanctions Exposure", 0) >= 80:
        answer_parts.append(
            f"{name} is directly exposed to international sanctions regimes — its ability to operate in key markets is shaped more by geopolitics than by market demand."
        )
    elif dims.get("Supply-Chain Concentration", 0) >= 85:
        top_supplier = ""
        for s_name, s_role, *s_strength in c.get("suppliers", []):
            if s_strength and s_strength[0] == "Critical":
                top_supplier = s_name
                break
        if top_supplier:
            answer_parts.append(
                f"{name}'s entire operation depends on {top_supplier} — a single point of failure that governments classify as a national security concern."
            )
        else:
            answer_parts.append(
                f"{name}'s supply chain is critically concentrated, creating a single point of failure that governments classify as a national security concern."
            )
    elif dims.get("Strategic Sector Relevance", 0) >= 85:
        answer_parts.append(
            f"{name} operates in a sector that governments classify as strategically critical — its success or failure is a matter of national policy, not just market competition."
        )
    elif dims.get("Government Dependency", 0) >= 80:
        answer_parts.append(
            f"{name} depends on government contracts, subsidies, or procurement for a material share of its revenue — public policy is not a side issue but a core business driver."
        )
    else:
        answer_parts.append(
            f"{name} operates at the intersection of commerce and geopolitics, with connections to governments, investors, and suppliers that shape its strategic options."
        )

    # Sentence 2: the key tension
    fragility_score = pillar_scores.get("fragility", 0)
    if fragility_score >= 80:
        answer_parts.append(
            "Its Scout Index is driven primarily by Fragility — the company is highly vulnerable to disruption from sanctions, supply chain shocks, or political decisions."
        )
    elif dims.get("State Ownership", 0) >= 50:
        answer_parts.append(
            "Its Scout Index is driven primarily by Political Embeddedness — corporate decisions and state decisions are effectively the same."
        )
    elif dims.get("Strategic Sector Relevance", 0) >= 85:
        answer_parts.append(
            "Its Scout Index is driven primarily by Strategic Significance — the company is too important to be left to the market alone."
        )

    # Sentence 3: what Scout reveals
    answer_parts.append(
        f"Scout maps the full network of relationships — investors, governments, suppliers, and countries — that determine {name}'s geopolitical exposure."
    )

    governing_answer = " ".join(answer_parts)

    # ── Generate pillar narratives ──────────────────────────────────────
    pillar_narratives = {}
    for pillar in pillars:
        p_id = pillar["id"]
        p_label = pillar["label"]
        p_score = pillar["score"]
        p_dims = pillar["dimensions"]

        # Find the highest-scoring dimension in this pillar
        top_p_dim = max(p_dims, key=lambda d: d["score"]) if p_dims else None
        top_p_name = top_p_dim["label"] if top_p_dim else ""
        top_p_val = top_p_dim["score"] if top_p_dim else 0

        # Generate a one-line causal sentence
        if p_id == "strategic":
            if p_score >= 85:
                narrative = f"Strategically critical ({p_score}/100) — {top_p_name.lower()} at {top_p_val}/100 drives the score"
            elif p_score >= 70:
                narrative = f"Strategically significant ({p_score}/100) — {top_p_name.lower()} at {top_p_val}/100 is the primary driver"
            elif p_score >= 50:
                narrative = f"Moderately strategic ({p_score}/100) — operates in a relevant but not critical sector"
            else:
                narrative = f"Limited strategic significance ({p_score}/100) — not classified as critical by most governments"
        elif p_id == "political":
            if top_p_name == "State Ownership" and top_p_val >= 50:
                narrative = f"State-controlled ({p_score}/100) — {top_p_val}% government ownership gives direct political leverage"
            elif top_p_name == "Government Dependency" and top_p_val >= 70:
                narrative = f"Government-dependent ({p_score}/100) — public money funds a material share of revenue"
            elif top_p_name == "Regulatory Complexity" and top_p_val >= 80:
                narrative = f"Heavily regulated ({p_score}/100) — subject to {top_p_val}+ regulatory regimes globally"
            elif p_score >= 70:
                narrative = f"Politically embedded ({p_score}/100) — strong government relationships across multiple dimensions"
            elif p_score >= 50:
                narrative = f"Politically connected ({p_score}/100) — notable but bounded government relationships"
            else:
                narrative = f"Limited political embeddedness ({p_score}/100) — minimal state ownership or dependency"
        elif p_id == "fragility":
            if top_p_name == "Sanctions Exposure" and top_p_val >= 80:
                narrative = f"Sanctions-exposed ({p_score}/100) — direct exposure to international sanctions regimes at {top_p_val}/100"
            elif top_p_name == "Supply-Chain Concentration" and top_p_val >= 85:
                narrative = f"Critically fragile ({p_score}/100) — supply chain concentration at {top_p_val}/100 creates single-point-of-failure risk"
            elif p_score >= 70:
                narrative = f"Highly fragile ({p_score}/100) — vulnerable to geopolitical disruption"
            elif p_score >= 50:
                narrative = f"Moderately fragile ({p_score}/100) — some exposure to disruption"
            else:
                narrative = f"Relatively resilient ({p_score}/100) — limited exposure to sanctions or supply chain shocks"

        pillar_narratives[p_id] = narrative

    # ── Generate supporting insights from raw insights ─────────────────
    supporting = []
    for insight in raw_insights[:3]:
        # Split into title + detail
        result = split_insight(insight)
        supporting.append(result)

    return {
        "governingQuestion": governing_question,
        "governingAnswer": governing_answer,
        "pillarNarratives": {
            "strategic": pillar_narratives.get("strategic", ""),
            "political": pillar_narratives.get("political", ""),
            "fragility": pillar_narratives.get("fragility", ""),
        },
        "supportingInsights": supporting,
    }


def convert_company(c):
    """Convert a Python company dict to a TypeScript-compatible dict."""
    name = c["name"]
    company_id = slugify(name)

    # Logo URLs:
    # - Primary: SimpleIcons via jsDelivr (monochrome SVG, reliable)
    #   URL: https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/{slug}.svg
    #   The SVG is tinted with the brand color via CSS mask-image in the
    #   CompanyLogo component (brandColor field).
    # - Fallback: Google Favicon API (real PNG favicons, colored)
    #   URL: https://www.google.com/s2/favicons?domain={domain}&sz=128
    domain = DOMAINS.get(name, "")
    slug = SIMPLEICONS_SLUGS.get(name, "")
    color = BRAND_COLORS.get(name, "")

    favicon_url = f"https://www.google.com/s2/favicons?domain={domain}&sz=128" if domain else ""
    jsdelivr_url = f"https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/{slug}.svg" if slug else ""

    if slug:
        # Monochrome SVG via jsDelivr — will be tinted via CSS mask with brandColor
        logo_url = jsdelivr_url
        logo_fallback = favicon_url
        brand_color = color  # hex without #, e.g. "76B900"
    else:
        # No SimpleIcons slug — use favicon directly (already colored)
        logo_url = favicon_url
        logo_fallback = ""
        brand_color = ""

    # Build connections + entities
    connections, entities = build_connections_and_entities(c, company_id)

    # Build footprint dimensions array
    raw_dimensions = dict(c.get("dimensions", {}))
    footprint_dimensions = [
        {"label": dim, "score": score, "description": DIMENSION_DESCRIPTIONS.get(dim, "")}
        for dim, score in raw_dimensions.items()
    ]

    # ─── Scout Index calculation ────────────────────────────────────────────
    # See /download/scout-index-methodology.md for the full formula.
    # Three pillars (Strategic Significance, Political Embeddedness, Fragility),
    # each a weighted power mean with p=1/2 of its dimensions.
    # Composite is a weighted power mean of pillars (p=1/2).
    # Critical Exposure Spike: max dimension >85 amplifies the composite up to +20%.
    scout_index, scout_pillars, scout_tier, scout_confidence = calculate_scout_index(raw_dimensions)

    # Generate editorial content for v2 company page
    editorial = generate_editorial(c, scout_index, scout_pillars)

    # Build key insights array
    key_insights = [split_insight(i) for i in c.get("insights", [])]

    # Build quick facts
    quick_facts = [
        {"label": "Founded", "value": str(c["founded"])},
        {"label": "Employees", "value": c["employees"]},
        {"label": "Headquarters", "value": c["hq"]},
        {"label": "CEO", "value": c["ceo"]},
        {"label": "Market capitalisation", "value": c["marketCap"]},
        {"label": "Ownership", "value": derive_ownership(c.get("investors", []))},
        {"label": "Sector", "value": c["sector"]},
        {"label": "Country", "value": c["country"]},
    ]

    # Build money journey
    money_journey = []
    for step in c.get("money_journey", []):
        step_name, detail, pct, confidence = step
        money_journey.append({
            "step": step_name,
            "detail": detail,
            "confidence": confidence,
            "percentage": pct if isinstance(pct, (int, float)) else None,
        })

    # Build timeline
    timeline = []
    for i, t in enumerate(c.get("timeline", [])):
        date, title, category, desc = t
        # Extract year from date
        year_match = re.search(r"\b(20\d{2}|19\d{2})\b", date)
        year = int(year_match.group(1)) if year_match else 2024
        timeline.append({
            "id": f"t{i+1}",
            "date": date,
            "year": year,
            "title": title,
            "category": category,
            "description": desc,
            "source": {"name": c["sources"][0][0] if c.get("sources") else "Scout editorial", "type": "Editorial", "date": date},
        })

    # Build sources
    sources = []
    for s in c.get("sources", []):
        src_name, src_type, src_date, src_tier = s
        sources.append({"name": src_name, "type": src_type, "date": src_date, "tier": src_tier})

    # Build intelligence report
    report = build_intelligence_report(c)

    return {
        "id": company_id,
        "name": name,
        "logo": logo_url,
        "logoFallback": logo_fallback,
        "brandColor": brand_color,
        "domain": domain,
        "country": c["country"],
        "countryCode": c["cc"],
        "sector": c["sector"],
        "tagline": c["sector"].split("·")[0].strip() if "·" in c["sector"] else c["sector"],
        "heroQuote": build_hero_quote(c),
        "founded": str(c["founded"]),
        "employees": c["employees"],
        "headquarters": c["hq"],
        "ceo": c["ceo"],
        "marketCap": c["marketCap"],
        "ownershipType": derive_ownership(c.get("investors", [])),
        "politicalFootprint": scout_index,  # alias for backward compat; equals scoutIndex
        "scoutIndex": scout_index,
        "scoutIndexPillars": scout_pillars,
        "scoutIndexTier": scout_tier,
        "scoutIndexConfidence": scout_confidence,
        "footprintDimensions": footprint_dimensions,
        "keyInsights": key_insights,
        "quickFacts": quick_facts,
        "connections": connections,
        "entities": entities,
        "moneyJourney": money_journey,
        "timeline": timeline,
        "intelligenceReport": report,
        "sources": sources,
        "editorial": editorial,
    }


def build_hero_quote(c):
    """Build a hero quote for the company."""
    name = c["name"]
    sector = c["sector"]
    return f"When you interact with {name}, your money enters a complex network of shareholders, governments, suppliers and financial institutions across the {sector.lower()} ecosystem."


def category_for(c):
    """Get the broad category for the company."""
    sector = c["sector"].lower()
    if any(x in sector for x in ["technology", "semiconductor", "consumer electronics", "electronics manufacturing"]):
        return "Technology · Semiconductors"
    if any(x in sector for x in ["telecom"]):
        return "Telecom"
    if any(x in sector for x in ["streaming", "gaming", "media", "entertainment"]):
        return "Media · Streaming · Gaming"
    if any(x in sector for x in ["automotive", "ev"]):
        return "Automotive"
    if any(x in sector for x in ["airlines", "travel", "hospitality", "mobility"]):
        return "Travel · Hospitality"
    if any(x in sector for x in ["energy", "oil", "battery"]):
        return "Energy"
    if any(x in sector for x in ["retail", "fashion", "apparel", "luxury", "cosmetics", "sportswear", "personal care", "household", "consumer goods"]):
        return "Retail · Fashion · Consumer Goods"
    if any(x in sector for x in ["food", "beverage", "restaurant", "coffeehouse", "snacks", "dairy", "beer", "qsr", "consumer services"]):
        return "Food & Beverage"
    if any(x in sector for x in ["pharma", "medical"]):
        return "Pharmaceuticals"
    if any(x in sector for x in ["defence", "aerospace"]):
        return "Defence · Aerospace"
    if any(x in sector for x in ["finance", "banking", "asset management", "insurance", "fintech", "cryptocurrency", "payments"]):
        return "Finance · Insurance · Fintech"
    if any(x in sector for x in ["mining", "metals"]):
        return "Mining · Metals"
    if "conglomerate" in sector:
        return "Conglomerate"
    return "Other"


def main():
    converted = [convert_company(c) for c in COMPANIES]

    # Build category groups for the discover page
    categories = {}
    for c, original in zip(converted, COMPANIES):
        cat = category_for(original)
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(c["id"])

    # Write the TypeScript file
    ts = []
    ts.append("// AUTO-GENERATED from /home/z/my-project/scripts/companies_dataset.py")
    ts.append("// Do not edit by hand — edit the Python source and re-run the converter.")
    ts.append("")
    ts.append("import type { Company } from './data';")
    ts.append("")
    ts.append(f"export const companies: Company[] = {json.dumps(converted, indent=2)};")
    ts.append("")
    ts.append(f"export const companiesByCategory: Record<string, string[]> = {json.dumps(categories, indent=2)};")
    ts.append("")
    ts.append(f"export const companyCount = {len(converted)};")
    ts.append("")

    out_path = "/home/z/my-project/src/lib/companies-data.ts"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(ts))

    print(f"Wrote {len(converted)} companies to {out_path}")
    print(f"Categories: {list(categories.keys())}")


if __name__ == "__main__":
    main()
