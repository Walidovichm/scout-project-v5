"use client";

import { Company, ConnectionStrength, ConfidenceLevel, ConnectionEdge, EntityNode } from "@/lib/data";
import { useScout } from "@/lib/store";
import { useState, useMemo } from "react";
import { ArrowRight, Network, Info, ShieldCheck, AlertCircle, ChevronDown, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CompanyLogo } from "./company-logo";
import { companies as ALL_COMPANIES } from "@/lib/companies-data";
import { getFlag, COUNTRY_FLAGS } from "@/lib/flags";

// ─── Government/regulator logo URLs ──────────────────────────────────────
// Uses Google Favicon API for government domains (reliable, returns real logos).
const GOV_LOGOS: Record<string, string> = {
  "U.S. Federal Government": "https://www.google.com/s2/favicons?domain=whitehouse.gov&sz=128",
  "United States (DoD)": "https://www.google.com/s2/favicons?domain=defense.gov&sz=128",
  "United States (FAA)": "https://www.google.com/s2/favicons?domain=faa.gov&sz=128",
  "United States (Fed, OCC, CFPB)": "https://www.google.com/s2/favicons?domain=federalreserve.gov&sz=128",
  "United States (Fed, OCC, FDIC, CFPB)": "https://www.google.com/s2/favicons?domain=federalreserve.gov&sz=128",
  "United States (Federal Reserve, OCC, FDIC, CFPB)": "https://www.google.com/s2/favicons?domain=federalreserve.gov&sz=128",
  "United States (State Department)": "https://www.google.com/s2/favicons?domain=state.gov&sz=128",
  "United States": "https://www.google.com/s2/favicons?domain=whitehouse.gov&sz=128",
  "European Union": "https://www.google.com/s2/favicons?domain=europa.eu&sz=128",
  "European Union (EASA)": "https://www.google.com/s2/favicons?domain=easa.europa.eu&sz=128",
  "OPEC+ members": "https://www.google.com/s2/favicons?domain=opec.org&sz=128",
  "Government of Saudi Arabia (PIF)": "https://www.google.com/s2/favicons?domain=pif.gov.sa&sz=128",
  "Government of Dubai (via ICD)": "https://www.google.com/s2/favicons?domain=icd.gov.ae&sz=128",
  "German government (KfW)": "https://www.google.com/s2/favicons?domain=kfw.de&sz=128",
  "German government (via KfW)": "https://www.google.com/s2/favicons?domain=kfw.de&sz=128",
  "State of Lower Saxony (Germany)": "https://www.google.com/s2/favicons?domain=niedersachsen.de&sz=128",
  "NATO allies": "https://www.google.com/s2/favicons?domain=nato.int&sz=128",
  "China (CCP)": "https://www.google.com/s2/favicons?domain=gov.cn&sz=128",
  "CNPC (state-owned parent)": "https://www.google.com/s2/favicons?domain=cnpc.com.cn&sz=128",
  "China Mobile Communications Group (state-owned parent)": "https://www.google.com/s2/favicons?domain=chinamobileltd.com&sz=128",
  "Ningde SASAC (state asset)": "https://www.google.com/s2/favicons?domain=sasac.gov.cn&sz=128",
  "BAIC (China, state-owned)": "https://www.google.com/s2/favicons?domain=baicmotor.com&sz=128",
};

// ─── Entity logo: flag for countries, gov logos, company logos, initials ───
function EntityLogo({
  entity,
  size = "md",
  rounded = "md",
}: {
  entity: EntityNode;
  size?: "sm" | "md" | "lg";
  rounded?: "sm" | "md" | "lg" | "full";
}) {
  const sizeMap = {
    sm: "h-7 w-7 text-[20px]",
    md: "h-10 w-10 text-[28px]",
    lg: "h-12 w-12 text-[34px]",
  };
  const roundMap = {
    sm: "rounded-md",
    md: "rounded-lg",
    lg: "rounded-xl",
    full: "rounded-full",
  };

  // 1. Check for government/regulator with a dedicated logo URL
  const govLogoUrl = GOV_LOGOS[entity.name];
  if (govLogoUrl) {
    return (
      <GovLogoImage
        name={entity.name}
        src={govLogoUrl}
        size={size}
        rounded={rounded}
        sizeMap={sizeMap}
        roundMap={roundMap}
      />
    );
  }

  // 2. Check if it's a country with a flag emoji
  const flag = getFlag(entity.name) || getFlag(entity.country || "");
  if (flag && (entity.type === "country" || entity.type === "government" || entity.type === "regulator")) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden border border-border/60 bg-secondary",
          sizeMap[size],
          roundMap[rounded]
        )}
        aria-label={`${entity.name} flag`}
      >
        <span className="leading-none">{flag}</span>
      </div>
    );
  }

  // 3. Try to find a company logo from the dataset
  const logoProps = findCompanyLogo(entity.name);
  if (logoProps.src || logoProps.fallbackSrc) {
    return (
      <CompanyLogo
        name={entity.name}
        {...logoProps}
        size={size}
        rounded={rounded}
      />
    );
  }

  // 4. Try fuzzy matching for common entity name patterns
  const fuzzyLogo = fuzzyMatchEntityLogo(entity.name);
  if (fuzzyLogo.src || fuzzyLogo.fallbackSrc) {
    return (
      <CompanyLogo
        name={entity.name}
        {...fuzzyLogo}
        size={size}
        rounded={rounded}
      />
    );
  }

  // 5. Fallback: CompanyLogo with initials
  return (
    <CompanyLogo
      name={entity.name}
      size={size}
      rounded={rounded}
    />
  );
}

// Government logo image with fallback
function GovLogoImage({
  name,
  src,
  size,
  rounded,
  sizeMap,
  roundMap,
}: {
  name: string;
  src: string;
  size: "sm" | "md" | "lg";
  rounded: "sm" | "md" | "lg" | "full";
  sizeMap: Record<string, string>;
  roundMap: Record<string, string>;
}) {
  const [error, setError] = useState(false);
  const flag = getFlag(name.split(" (")[0].split(",")[0].trim());

  if (error && flag) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden border border-border/60 bg-secondary",
          sizeMap[size],
          roundMap[rounded]
        )}
        aria-label={`${name} flag`}
      >
        <span className="leading-none">{flag}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden border border-border/60 bg-secondary",
        sizeMap[size],
        roundMap[rounded]
      )}
      aria-label={`${name} logo`}
    >
      <img
        src={src}
        alt={`${name} logo`}
        loading="lazy"
        className="h-full w-full object-contain p-2"
        onError={() => setError(true)}
      />
    </div>
  );
}

// Known company domains for entities not in the 100-company dataset.
// Used as a fallback for Google Favicon lookup.
const ENTITY_DOMAINS: Record<string, string> = {
"ABC affiliates": "abc.com",
  "ADIA": "adia.ae",
  "AMD (US)": "amd.com",
  "API suppliers (Denmark, EU)": "novonordisk.com",
  "API suppliers (global)": "sigmaaldrich.com",
  "ASML (Netherlands)": "asml.com",
  "ASML Holding N.V.": "asml.com",
  "AT&T Inc.": "att.com",
  "AXA S.A.": "axa.com",
  "Adidas AG": "adidas.com",
  "Agricultural ingredients (botanicals)": "stevia.com",
  "Agricultural producers": "fao.org",
  "Airbnb, Inc.": "airbnb.com",
  "Airbus SE": "airbus.com",
  "Airlines (legacy + LCC)": "iata.org",
  "Airports": "aci.aero",
  "Airports (Frankfurt, Munich)": "fraport.com",
  "Airports (secondary, low-cost)": "aci.aero",
  "Albemarle (US)": "albemarle.com",
  "Alibaba Cloud / Tencent Cloud": "alibabacloud.com",
  "Alibaba Group Holding Ltd.": "alibabagroup.com",
  "Allianz Global Investors": "allianzgi.com",
  "Allianz SE": "allianz.com",
  "Alphabet Inc. (Google)": "abc.xyz",
  "Altria": "altria.com",
  "Aluminium / PET suppliers": "ball.com",
  "Aluminium can suppliers": "ball.com",
  "Amancio Ortega (via Pontegadea)": "inditex.com",
  "Amazon.com, Inc.": "amazon.com",
  "American Airlines Group Inc.": "aa.com",
  "Anheuser-Busch InBev SA/NV (AB InBev)": "ab-inbev.com",
  "Apparel manufacturers (Asia)": "gap.com",
  "Apple Inc.": "apple.com",
  "Applied Materials (US)": "amat.com",
  "Arnault family (via Christian Dior SE)": "lvmh.com",
  "Asia": "un.org",
  "Asset custodians (State Street, BNY)": "statestreet.com",
  "AstraZeneca plc": "astrazeneca.com",
  "Australia / South Africa": "un.org",
  "Austria / Belgium / Italy": "europa.eu",
  "BAE Systems (UK)": "baesystems.com",
  "BAIC (China, state-owned)": "baicmotor.com",
  "BHP Group Ltd.": "bhp.com",
  "BNP Paribas": "bnpparibas.com",
  "BNSF Railway (own subsidiary)": "bnsf.com",
  "BYD Company Ltd.": "byd.com",
  "Baillie Gifford": "bailliegifford.com",
  "Banco Santander, S.A.": "santander.com",
  "Bangladesh / India / China": "un.org",
  "Bangladesh / Turkey": "un.org",
  "Bank of America Corporation": "bankofamerica.com",
  "Barley / hop farmers (global)": "beerbrewers.eu",
  "Bayer AG": "bayer.com",
  "Beef suppliers (Cargill, JBS)": "cargill.com",
  "Belgian São Paulo families (Stichting), including Sicupira/Telles/Lemann": "ab-inbev.com",
  "Berkshire Hathaway (Warren Buffett)": "berkshirehathaway.com",
  "Berkshire Hathaway (self-held via repurchase)": "berkshirehathaway.com",
  "Berkshire Hathaway Energy (own subsidiary)": "berkshirehathawayenergy.com",
  "Berkshire Hathaway Inc.": "berkshirehathaway.com",
  "Bettencourt family (via Téthys)": "loreal.com",
  "BioNTech (Germany)": "biontech.de",
  "BlackRock (treasury / self-held)": "blackrock.com",
  "BlackRock, Inc.": "blackrock.com",
  "Block, Inc. (Square)": "block.xyz",
  "Bloomberg / Refinitiv": "bloomberg.com",
  "Boeing (737 MAX, 787)": "boeing.com",
  "Boeing (737-800, 737 MAX 8200)": "boeing.com",
  "Boeing (777, 787)": "boeing.com",
  "Boeing (787, 777)": "boeing.com",
  "Boeing / Airbus": "boeing.com",
  "Boeing 737 MAX delays": "boeing.com",
  "Booking Holdings Inc.": "bookingholdings.com",
  "Bosch (Germany)": "bosch.com",
  "Bottled water sources (Evian, Volvic)": "danone.com",
  "Botín family": "santander.com",
  "Brazil": "gov.br",
  "Brian Armstrong (founder/CEO)": "coinbase.com",
  "Broadcom": "broadcom.com",
  "ByteDance Ltd. (TikTok)": "bytedance.com",
  "C.A.F.E. Practices network (~400K farmers)": "starbucks.com",
  "CATL (Contemporary Amperex Technology Co., Ltd.)": "catl.com",
  "CDMOs": "catalent.com",
  "CDMOs (Catalent, Lonza)": "catalent.com",
  "CFM International (GE/Safran)": "cfmaeroengines.com",
  "CNPC (state-owned parent)": "cnpc.com.cn",
  "CPG manufacturers": "pg.com",
  "Cable / satellite / streaming": "comcast.com",
  "Cable networks": "comcast.com",
  "California": "ca.gov",
  "California / New York": "ca.gov",
  "Canada": "canada.ca",
  "Capital Research Group": "capgroup.com",
  "Car rental companies": "hertz.com",
  "Cargill / Tate & Lyle": "cargill.com",
  "Cashmere / wool suppliers": "lvmh.com",
  "Catalent, Lonza (CDMOs)": "catalent.com",
  "Caterpillar / Cummins": "caterpillar.com",
  "Caterpillar, Cummins": "caterpillar.com",
  "Cell culture media suppliers": "thermofisher.com",
  "Charter Life (formerly HSBC stake)": "hsbc.com",
  "Cheese suppliers (Leprino — exclusive)": "leprinofoods.com",
  "Cheese suppliers (Leprino)": "leprinofoods.com",
  "Chemical companies (BASF, Dow)": "basf.com",
  "Chemical companies (BASF, Givaudan, Firmenich)": "basf.com",
  "Chemical companies (Givaudan, Firmenich, IFF)": "givaudan.com",
  "Chemical suppliers (BASF, Lanxess)": "basf.com",
  "Chicken suppliers (Tyson, Pilgrim's)": "tysonfoods.com",
  "China (CCP)": "gov.cn",
  "China / Russia": "un.org",
  "China Mobile Communications Group (state-owned parent)": "chinamobileltd.com",
  "China Mobile Ltd.": "chinamobileltd.com",
  "Chip Wilson (founder)": "lululemon.com",
  "Cisco, Juniper": "cisco.com",
  "Cloud / data center providers": "aws.amazon.com",
  "Cloud / tech providers (AWS)": "aws.amazon.com",
  "Cloud providers (AWS, Azure)": "aws.amazon.com",
  "Cloud providers (AWS, Microsoft Azure)": "aws.amazon.com",
  "Cloud providers (AWS, Microsoft Azure, IBM)": "aws.amazon.com",
  "Coca-Cola Consolidated (US)": "cokeconsolidated.com",
  "Coca-Cola Europacific Partners (UK)": "cceptruck.com",
  "Coca-Cola FEMSA (Mexico)": "coca-colafemsa.com",
  "Coca-Cola HBC (Switzerland/Greece)": "coca-colahbc.com",
  "Coca-Cola, P&G, Kraft Heinz, etc.": "coca-cola.com",
  "Coinbase Global, Inc.": "coinbase.com",
  "Cold chain logistics": "dhl.com",
  "Collins Aerospace internal": "collinsaerospace.com",
  "Component suppliers (Asia)": "foxconn.com",
  "Consulting firms (Deloitte, PwC, Accenture)": "deloitte.com",
  "Content studios (Sony, Disney, Viacom)": "sony.com",
  "Continental (Germany)": "continental.com",
  "Contract manufacturers": "foxconn.com",
  "Corn suppliers (US Midwest)": "cargill.com",
  "Costco Wholesale Corporation": "costco.com",
  "Cotton suppliers (global)": "cotton.org",
  "Cotton suppliers (global, non-Xinjiang)": "cotton.org",
  "Cotton suppliers (non-Xinjiang)": "cotton.org",
  "CrowdStrike / Microsoft Azure": "crowdstrike.com",
  "Crypto custody providers (own)": "coinbase.com",
  "Custodian banks (State Street, BNY Mellon, JPMorgan)": "statestreet.com",
  "Cymer (US, ASML subsidiary)": "asml.com",
  "Côte d'Ivoire / Ghana": "un.org",
  "DICE, BioWare, Respawn (own studios)": "ea.com",
  "Dairy suppliers (global)": "danone.com",
  "Daniel Ek (founder/CEO)": "spotify.com",
  "Danone S.A.": "danone.com",
  "Data vendors (Bloomberg, Refinitiv)": "bloomberg.com",
  "Delta Air Lines, Inc.": "delta.com",
  "Denso (Japan, Toyota affiliate)": "denso.com",
  "Deutsche Lufthansa AG": "lufthansagroup.com",
  "Deutsche Telekom AG": "telekom.com",
  "Device component suppliers": "foxconn.com",
  "Diagnostics reagent suppliers": "thermofisher.com",
  "Diamond and precious stone suppliers (global)": "tiffany.com",
  "Domestic Chinese": "huawei.com",
  "Domestic Chinese service companies": "alibaba.com",
  "Domestic IT vendors": "huawei.com",
  "Domestic Saudi industrial base": "aramco.com",
  "Domestic U.S. service companies": "ibm.com",
  "Domestic chipmakers": "smic.com",
  "Domestic cloud vendors": "alibabacloud.com",
  "Domestic server makers": "inspur.com",
  "Domestic steel / equipment": "baosteel.com",
  "Domestic suppliers": "alibaba.com",
  "Domino's Pizza, Inc.": "dominos.com",
  "Drivers (gig workers)": "uber.com",
  "Dubai Airports": "dubaiairports.ae",
  "Electrolyte / separator suppliers": "catl.com",
  "Electronic Arts Inc.": "ea.com",
  "Elon Musk (founder/CEO)": "tesla.com",
  "Emirates Airline (Emirates Group)": "emirates.com",
  "Employees / founders": "linkedin.com",
  "Energy suppliers": "edf.fr",
  "Energy suppliers (gas, electricity)": "edf.fr",
  "Engineering contractors": "bechtel.com",
  "Engines (GE, RR, Pratt)": "ge.com",
  "Ericsson, Nokia": "ericsson.com",
  "Ericsson, Nokia, Huawei (legacy, phasing out)": "ericsson.com",
  "Ericsson, Nokia, Huawei (limited)": "ericsson.com",
  "Ericsson, Nokia, Samsung": "ericsson.com",
  "Estée Lauder Companies Inc.": "elcompanies.com",
  "European Union": "europa.eu",
  "European Union (EASA)": "easa.europa.eu",
  "Explosives suppliers": "orica.com",
  "Explosives suppliers (Orica, Orica)": "orica.com",
  "ExxonMobil Corporation": "corporate.exxonmobil.com",
  "FEMSA (Mexico)": "femsa.com",
  "FIFA / FIFPro (historic)": "fifa.com",
  "FIS, Fiserv": "fisglobal.com",
  "FIS, Fiserv, Jack Henry": "fisglobal.com",
  "Fiber optic cable suppliers": "corning.com",
  "Fiber optic cable suppliers (Corning, Prysmian)": "corning.com",
  "First Solar, SunPower": "firstsolar.com",
  "Florida": "fl.gov",
  "Food / beverage suppliers": "nestle.com",
  "Foreign institutional investors": "blackrock.com",
  "Foxconn / Asian electronics": "foxconn.com",
  "Foxconn / Hon Hai (TW/CN/IN)": "foxconn.com",
  "Foxconn / Hon Hai (Taiwan)": "foxconn.com",
  "Foxconn Technology Group (Hon Hai Precision Industry)": "foxconn.com",
  "France / California": "europa.eu",
  "Franchisees": "mcdonalds.com",
  "Franchisees (independent + master)": "mcdonalds.com",
  "Franchisees (property owners)": "marriott.com",
  "French ateliers": "lvmh.com",
  "French leather artisans (own ateliers)": "lvmh.com",
  "French vineyards (Champagne, Cognac)": "lvmh.com",
  "GE / Rolls-Royce / Pratt & Whitney": "ge.com",
  "GE Aerospace (US)": "geaerospace.com",
  "GE Aerospace / CFM (US/France)": "geaerospace.com",
  "GZBV (Germany, via KfW)": "kfw.de",
  "Gasoline suppliers": "shell.com",
  "Geico (own subsidiary)": "geico.com",
  "Genentech (US subsidiary)": "gene.com",
  "General Atlantic": "generalatlantic.com",
  "Geode Capital": "geodecapital.com",
  "German government (KfW)": "kfw.de",
  "German government (via KfW)": "kfw.de",
  "Germany": "bund.de",
  "Glass / metal suppliers": "corning.com",
  "Glass / packaging suppliers": "corning.com",
  "Glass / plastic suppliers": "corning.com",
  "Glass bottle suppliers": "corning.com",
  "Glass vial suppliers": "corning.com",
  "Glass vial suppliers (Corning, Schott)": "corning.com",
  "Glencore (Switzerland)": "glencore.com",
  "Glencore plc": "glencore.com",
  "Gold / diamond suppliers": "tiffany.com",
  "Google Cloud": "cloud.google.com",
  "Government of Dubai (via ICD)": "icd.gov.ae",
  "Government of Saudi Arabia (PIF)": "pif.gov.sa",
  "H&M Hennes & Mauritz AB": "hm.com",
  "H2 SAS": "hermes.com",
  "HSBC Custody Nominees": "hsbc.com",
  "HSBC Holdings plc": "hsbc.com",
  "Halliburton (legacy)": "halliburton.com",
  "Halliburton, Schlumberger, Baker Hughes": "halliburton.com",
  "Heineken N.V.": "theheinekencompany.com",
  "Heineken family (via L'Arche Green Investment / Stichting)": "theheinekencompany.com",
  "Hermès / Dumas family (via H51 SAS)": "hermes.com",
  "Hermès International S.A.": "hermes.com",
  "Hoffmann / Oeri founding family": "roche.com",
  "Hong Kong public": "marketwatch.com",
  "Host Hotels": "hosthotels.com",
  "Hosts (5M+)": "airbnb.com",
  "Hotels / properties (2M+)": "booking.com",
  "Huawei / Alibaba Cloud": "huawei.com",
  "Huawei Investment & Holding Trade Union Committee": "huawei.com",
  "Huawei Technologies Co., Ltd.": "huawei.com",
  "Huawei, ZTE (Chinese)": "huawei.com",
  "IHI": "ihi.co.jp",
  "Identity verification providers": "onfido.com",
  "Independent production companies": "imdb.com",
  "Index providers (MSCI, FTSE Russell)": "msci.com",
  "India": "gov.in",
  "Inditex S.A. (Zara)": "inditex.com",
  "Indonesia / Malaysia": "un.org",
  "Intel (US)": "intel.com",
  "Inter IKEA Group": "ikea.com",
  "Inter IKEA Holding (Netherlands)": "ikea.com",
  "Internet service providers": "comcast.com",
  "Iraq": "gov.iq",
  "Israel, UAE": "un.org",
  "Italian leather artisans (Tuscany)": "lvmh.com",
  "Ivan Glasenberg (former CEO)": "glencore.com",
  "JPMorgan Chase & Co.": "jpmorganchase.com",
  "Jack Dorsey (founder)": "block.xyz",
  "Jack Ma (founder)": "alibabagroup.com",
  "Japan": "go.jp",
  "Japan Trustee Services Bank": "tsb.jp",
  "Japan, Australia, South Korea": "un.org",
  "Japan, South Korea": "un.org",
  "Jeff Bezos (founder)": "amazon.com",
  "Jensen Huang (founder/CEO)": "nvidia.com",
  "Jewellery suppliers": "tiffany.com",
  "Jio Platforms (own subsidiary)": "jio.com",
  "Johnson & Johnson": "jnj.com",
  "KKR": "kkr.com",
  "KKR / Mubadala / ADIA / Silver Lake / General Atlantic": "kkr.com",
  "KLA (US)": "kla.com",
  "Kennedy Wilson Holdings": "kennedywilson.com",
  "Kering S.A.": "kering.com",
  "Kirkland Signature (own brand)": "costco.com",
  "Kuwait Investment Authority": "kia.gov.kw",
  "L'Arche Green Investment": "hermes.com",
  "L'Oréal S.A.": "loreal.com",
  "LG Energy Solution (South Korea)": "lgensol.com",
  "LVMH (Arnault)": "lvmh.com",
  "LVMH Moët Hennessy Louis Vuitton SE": "lvmh.com",
  "Lactalis (French dairy)": "lactalis.fr",
  "Lam Research (US)": "lamresearch.com",
  "Larry Page & Sergey Brin (founders)": "abc.xyz",
  "Lauder family": "elcompanies.com",
  "Lee family (founding)": "samsung.com",
  "Linens / amenities suppliers": "marriott.com",
  "Lockheed Martin Corporation": "lockheedmartin.com",
  "Logistics (DHL, Maersk)": "dhl.com",
  "Logistics (Maersk, DHL)": "maersk.com",
  "Logistics (Maersk, FedEx)": "fedex.com",
  "Logistics (own fleet)": "logistics.com",
  "Logistics (ports, rail, shipping)": "maersk.com",
  "Logistics (shipping, air)": "dhl.com",
  "Logistics (truck, rail)": "dhl.com",
  "Logistics providers": "dhl.com",
  "Lululemon Athletica Inc.": "lululemon.com",
  "MTU Aero Engines (Germany)": "mtu.de",
  "Maersk / shipping companies": "maersk.com",
  "Major consulting firms": "mckinsey.com",
  "Mark Zuckerberg (founder/CEO)": "meta.com",
  "Marmon, Lubrizol, IMC (own subsidiaries)": "berkshirehathaway.com",
  "Marriott International, Inc.": "marriott.com",
  "McDonald's Corporation": "mcdonalds.com",
  "Medical device component suppliers": "medtronic.com",
  "Mercedes-Benz Group AG": "mercedes-benz.com",
  "Meta Platforms, Inc.": "meta.com",
  "Microsoft Corporation": "microsoft.com",
  "Mingzhe Ma (founder)": "pingan.com",
  "Mining equipment (Caterpillar, Komatsu)": "caterpillar.com",
  "Minnesota": "mn.gov",
  "Mondelez International, Inc.": "mondelezinternational.com",
  "Morgan Stanley": "morganstanley.com",
  "Mubadala": "mubadala.com",
  "Music rights holders": "ascap.com",
  "Myanmar / Ethiopia": "un.org",
  "NATO allies": "nato.int",
  "NFL, NBA, NHL, UFC": "nfl.com",
  "NVIDIA / Qualcomm": "nvidia.com",
  "NVIDIA Corporation": "nvidia.com",
  "Naspers / Prosus (South Africa)": "naspers.com",
  "National Pension Service of Korea": "nps.or.kr",
  "Nestlé S.A.": "nestle.com",
  "Netflix, Inc.": "netflix.com",
  "New York City": "nyc.gov",
  "Newport Trust": "newporttrust.com",
  "Nike, Inc.": "nike.com",
  "Ningde SASAC (state asset)": "sasac.gov.cn",
  "Nintendo Co., Ltd.": "nintendo.com",
  "No external investors": "crunchbase.com",
  "No public shareholders": "crunchbase.com",
  "Norges Bank (Norway SWF)": "nbim.no",
  "Norges Bank Investment Management (Norway SWF)": "nbim.no",
  "Northvolt (Sweden, VW-backed)": "northvolt.com",
  "Novartis": "novartis.com",
  "Novo Nordisk A/S": "novonordisk.com",
  "Novo Nordisk Foundation": "novonordiskfonden.dk",
  "OPEC+ members": "opec.org",
  "Oil suppliers ( UAE refining)": "adnoc.ae",
  "Oil suppliers (UAE refining)": "adnoc.ae",
  "Oracle (US)": "oracle.com",
  "Oracle Hospitality": "oracle.com",
  "Other institutional": "blackrock.com",
  "Owned brand suppliers (Good & Gather, etc.)": "target.com",
  "Owned store properties": "walmart.com",
  "PRIMECAP Management": "primecap.com",
  "Packaging suppliers": "tetrapak.com",
  "Packaging suppliers (glass, plastic)": "tetrapak.com",
  "Palm oil derivatives": "unilever.com",
  "Panasonic (Japan)": "panasonic.com",
  "Paris": "paris.fr",
  "Pegatron (Taiwan)": "pegatron.com",
  "PepsiCo, Inc.": "pepsico.com",
  "Perfumers (Grasse, France)": "givaudan.com",
  "Persson family (via Ramsbury Invest)": "hm.com",
  "PetroChina Company Ltd.": "petrochina.com.cn",
  "Petrochemical companies": "basf.com",
  "Peugeot family (via Peugeot Invest)": "peugeot.com",
  "Pfizer Inc.": "pfizer.com",
  "Pharmaceutical ingredients": "sigmaaldrich.com",
  "Phil Knight (founder) + family": "nike.com",
  "Pinault family (via Artemis Group)": "kering.com",
  "Ping An Insurance (China)": "pingan.com",
  "Ping An Insurance Group Co. of China": "pingan.com",
  "Plastic packaging suppliers": "tetrapak.com",
  "Polyester / synthetic fibre suppliers": "unilever.com",
  "Pontegadea": "pontegadea.com",
  "Pony Ma (founder/CEO)": "tencent.com",
  "Porsche SE (Porsche/Piëch family)": "porsche.de",
  "Potato growers (US, EU)": "simplot.com",
  "Pratt & Whitney (RTX)": "prattwhitney.com",
  "Pratt & Whitney (RTX, US)": "prattwhitney.com",
  "Pratt & Whitney internal": "prattwhitney.com",
  "Procter & Gamble Co.": "pg.com",
  "Production studios (own + third-party)": "disney.com",
  "Property management software": "guesty.com",
  "Public float": "marketwatch.com",
  "Public float (B shares)": "marketwatch.com",
  "Public float (B-shares)": "marketwatch.com",
  "Public float (Class A)": "marketwatch.com",
  "Public float (HK + Shanghai)": "marketwatch.com",
  "Public float (HK)": "marketwatch.com",
  "Public float (Shenzhen)": "marketwatch.com",
  "Public float (Tadawul)": "marketwatch.com",
  "Public shareholders": "marketwatch.com",
  "Q-Power / PowerCo (VW subsidiary)": "volkswagenag.com",
  "Qatar Holding": "qia.qa",
  "Qatar Investment Authority": "qia.qa",
  "Qualcomm (US)": "qualcomm.com",
  "RTX Corporation (Raytheon Technologies)": "rtx.com",
  "Ramsbury Invest": "hm.com",
  "Raytheon (RTX)": "rtx.com",
  "Real estate REITs (Host Hotels, Sunstone)": "hosthotels.com",
  "Real estate developers": "related.com",
  "Refineries": "exxonmobil.com",
  "Refineries (Delta owns Trainer refinery)": "delta.com",
  "Refineries / oil companies": "exxonmobil.com",
  "Reinsurers (Munich Re, Swiss Re, Hannover Re)": "munichre.com",
  "Reliance Industries (Mukesh Ambani parent)": "ril.com",
  "Reliance Jio Platforms (Jio)": "jio.com",
  "Ren Zhengfei (founder)": "huawei.com",
  "Renaissance Technologies": "rentec.com",
  "Retail suppliers": "walmart.com",
  "Robin Zeng (founder/CEO)": "catl.com",
  "Roche Holding AG": "roche.com",
  "Rockstar studios (own)": "rockstargames.com",
  "Rolls-Royce (UK)": "rolls-royce.com",
  "Rolls-Royce / GE / Engine Alliance": "rolls-royce.com",
  "Rolls-Royce / GE / Pratt & Whitney": "rolls-royce.com",
  "Rosalia Mera ( Sandra Ortega Mera, daughter)": "inditex.com",
  "Russia": "gov.ru",
  "Russian nickel (Nornickel)": "nornickel.com",
  "Russian timber (historic, now sanctioned)": "ikea.com",
  "Ryanair Holdings plc": "ryanair.com",
  "SAP, Oracle": "sap.com",
  "SEPI (Spain)": "sepies.es",
  "SOGEPA (France)": "sogepa.fr",
  "Sabre": "sabre.com",
  "Safran (France)": "safran-group.com",
  "Samsung": "samsung.com",
  "Samsung (South Korea)": "samsung.com",
  "Samsung / Micron": "samsung.com",
  "Samsung C&T (affiliate)": "samsungcnt.com",
  "Samsung Electronics Co., Ltd.": "samsung.com",
  "Saudi Arabia": "gov.sa",
  "Saudi Arabia PIF": "pif.gov.sa",
  "Saudi Arabia, UAE": "un.org",
  "Saudi Aramco": "aramco.com",
  "Saudi public / institutions": "aramco.com",
  "Schlumberger (legacy)": "slb.com",
  "Self-supplied (vertical)": "linkedin.com",
  "Sequoia Capital (US/China)": "sequoiacap.com",
  "Shanghai public": "marketwatch.com",
  "Shell plc": "shell.com",
  "Shenzhen Investment Holdings (state-owned)": "sdi.gov.cn",
  "Shin-Etsu (Japan)": "shinetsu.co.jp",
  "Silk / fabric suppliers": "lvmh.com",
  "Silk producers (Italy, France)": "lvmh.com",
  "Silk producers (Lyon, France)": "lvmh.com",
  "Silver Lake": "silverlake.com",
  "Singapore GIC": "gic.com.sg",
  "SoftBank (Japan)": "softbank.com",
  "Software (SAP, Oracle)": "sap.com",
  "Sony (Japan)": "sony.com",
  "Sony / Microsoft / Nintendo": "sony.com",
  "Sony / Omnivision": "sony.com",
  "Sony Group Corporation": "sony.com",
  "Sony Music Entertainment": "sonymusic.com",
  "Sony Semiconductor (own subsidiary)": "sony-semicon.com",
  "South Africa": "gov.za",
  "South Korea": "korea.kr",
  "Spanish / Portuguese / Moroccan textile factories": "inditex.com",
  "Specialty metals suppliers (titanium, etc.)": "timet.com",
  "Spirit AeroSystems (US/UK/Belfast)": "spiritaero.com",
  "Spirit AeroSystems (formerly Boeing subsidiary)": "spiritaero.com",
  "Sports leagues": "nfl.com",
  "Sports leagues (NFL, NBA, etc.)": "nfl.com",
  "Spotify Technology S.A.": "spotify.com",
  "Starbucks Corporation": "starbucks.com",
  "State of Lower Saxony (Germany)": "niedersachsen.de",
  "State-owned power utilities": "edf.fr",
  "Sterile packaging suppliers": "steris.com",
  "Stichting IKEA Foundation": "ikeafoundation.org",
  "Stichting INGKA Foundation": "ingka.com",
  "Stripe / payment processors": "stripe.com",
  "Sugar suppliers (global)": "tateandlyle.com",
  "Sunstone": "sunstonehotels.com",
  "Susquehanna International (US)": "sig.com",
  "Swiss pension funds": "ubs.com",
  "Swiss watchmakers": "tagheuer.com",
  "Swiss watchmakers (Girard-Perregaux, Ulysse Nardin)": "girard-perregaux.com",
  "Synthetic fibre suppliers": "unilever.com",
  "Synthetic fibre suppliers (Luon, Nulu fabrics)": "lululemon.com",
  "T. Rowe Price": "troweprice.com",
  "TSMC (Taiwan Semiconductor Manufacturing Company)": "tsmc.com",
  "TSMC (Taiwan, pre-2020)": "tsmc.com",
  "TSMC (via AMD, NVIDIA)": "tsmc.com",
  "TSMC (via Annapurna Labs)": "tsmc.com",
  "Taiwan domestic institutions": "marketwatch.com",
  "Taiwan government (National Development Fund)": "ndc.gov.tw",
  "Take-Two Interactive Software, Inc.": "take2games.com",
  "Target Corporation": "target.com",
  "Tech (Oracle Hospitality, Sabre)": "sabre.com",
  "TechnipFMC, McDermott": "technipfmc.com",
  "Telco partners globally": "verizon.com",
  "Tencent Holdings": "tencent.com",
  "Tencent Holdings Ltd.": "tencent.com",
  "Tencent subsidiary (TCM)": "tencent.com",
  "Terry Gou (founder)": "foxconn.com",
  "Tesla, Inc.": "tesla.com",
  "Thailand / Indonesia": "un.org",
  "The Boeing Company": "boeing.com",
  "The Coca-Cola Company": "coca-colacompany.com",
  "The Master Trust Bank of Japan": "mtb.jp",
  "The Walt Disney Company": "thewaltdisneycompany.com",
  "Theme park construction firms": "disney.com",
  "Thousands of CPG manufacturers": "pg.com",
  "Thousands of sub-tier suppliers": "lockheedmartin.com",
  "Thousands of sub-tier suppliers (quality issues)": "boeing.com",
  "Tokyo Electron (Japan)": "tel.com",
  "Tomato suppliers": "kraftheinz.com",
  "TotalEnergies SE": "totalenergies.com",
  "Toyota Motor Corporation": "global.toyota",
  "Trading infrastructure providers": "swift.com",
  "Trumpf (Germany)": "trumpf.com",
  "U.S. Federal Government": "whitehouse.gov",
  "U.S. trucking companies": "ups.com",
  "Uber Technologies, Inc.": "uber.com",
  "Unilever PLC": "unilever.com",
  "Union Square Ventures": "usv.com",
  "United Kingdom": "gov.uk",
  "United States": "whitehouse.gov",
  "United States (DoD)": "defense.gov",
  "United States (FAA)": "faa.gov",
  "United States (Fed, OCC, CFPB)": "federalreserve.gov",
  "United States (Fed, OCC, FDIC, CFPB)": "federalreserve.gov",
  "United States (Federal Reserve, OCC, FDIC, CFPB)": "federalreserve.gov",
  "United States (State Department)": "state.gov",
  "Universal Music Group": "universalmusic.com",
  "VDL (Netherlands)": "vdlgroep.nl",
  "Various equipment vendors": "cisco.com",
  "Various manufacturing contractors": "foxconn.com",
  "Verizon Communications Inc.": "verizon.com",
  "Vestas, Siemens Gamesa": "vestas.com",
  "Vietnam": "gov.vn",
  "Vietnam / Indonesia / Cambodia": "un.org",
  "Visa / Mastercard": "visa.com",
  "Visa / Mastercard / UnionPay": "visa.com",
  "Vodafone Group plc": "vodafone.com",
  "Voice / motion capture actors (SAG-AFTRA)": "sagaftra.org",
  "Volkswagen Group": "volkswagenag.com",
  "Walmart Inc.": "walmart.com",
  "Walton Enterprises": "walmart.com",
  "Walton family (via Walton Enterprises LLC)": "walmart.com",
  "Wang Chuanfu (founder/CEO)": "byd.com",
  "Warner Bros. Discovery, Inc.": "wbd.com",
  "Warner Music Group": "wmg.com",
  "Water utilities": "veolia.com",
  "Wellington Management": "wellington.com",
  "Wells Fargo & Company": "wellsfargo.com",
  "Western technology providers": "intel.com",
  "Wheat / flour suppliers": "cargill.com",
  "Wheat suppliers": "cargill.com",
  "Wine / spirits producers": "pernod-ricard.com",
  "Wood suppliers (Poland, Sweden, Russia historic)": "ikea.com",
  "Yeezy inventory (sold down 2023-2024)": "adidas.com",
  "Yum! Brands, Inc.": "yum.com",
  "Zeiss (Germany)": "zeiss.com",
  "a16z (Andreessen Horowitz)": "a16z.com",  "Apple": "apple.com",
  "Banking partners (JPMorgan, Customer Bank)": "jpmorganchase.com",
  "Banking partners (JPMorgan, Wells Fargo)": "jpmorganchase.com",
  "Banking partners (Sutton Bank, Customer Bank)": "suttonbank.com",
  "China": "gov.cn",
  "Geely (China, via personal holding)": "geely.com",
  "PayPal Holdings, Inc.": "paypal.com",
  "Restaurants (Uber Eats)": "ubereats.com",
  "SK Hynix (via carve-outs)": "skhynix.com",
  "Supermicro (US)": "supermicro.com",
  "Supermicro": "supermicro.com",
  "Vanguard": "vanguard.com",
  "FMR LLC (Fidelity)": "fidelity.com",
  "FMR LLC": "fidelity.com",
  "Fidelity": "fidelity.com",
};

// Fuzzy match entity names to companies for logo lookup.
// Handles patterns like "TSMC (Taiwan)", "AWS (Amazon)", "Apple / Samsung",
// "BAIC (China, state-owned)", "Foxconn / Hon Hai (TW/CN/IN)", etc.
function fuzzyMatchEntityLogo(name: string): { src?: string; fallbackSrc?: string; brandColor?: string } {
  const cleanName = name.toLowerCase().split(" (")[0].split(",")[0].trim();
  const parts = cleanName.split(/[/&]| - | and /).map(s => s.trim());

  // 0. Check known entity domains first (Google Favicon) — exact match
  const knownDomain = ENTITY_DOMAINS[name];
  if (knownDomain) {
    return { src: `https://www.google.com/s2/favicons?domain=${knownDomain}&sz=128` };
  }

  // 0b. Try substring matching against ENTITY_DOMAINS keys
  for (const [key, domain] of Object.entries(ENTITY_DOMAINS)) {
    if (cleanName === key.toLowerCase() || cleanName.includes(key.toLowerCase()) || key.toLowerCase().includes(cleanName)) {
      return { src: `https://www.google.com/s2/favicons?domain=${domain}&sz=128` };
    }
  }

  // Try each part of the name for domain matching too
  for (const part of parts) {
    const partDomain = ENTITY_DOMAINS[part] || ENTITY_DOMAINS[part.charAt(0).toUpperCase() + part.slice(1)];
    if (partDomain) {
      return { src: `https://www.google.com/s2/favicons?domain=${partDomain}&sz=128` };
    }
    // Also try substring match for each part
    for (const [key, domain] of Object.entries(ENTITY_DOMAINS)) {
      if (part === key.toLowerCase() || part.includes(key.toLowerCase()) || key.toLowerCase().includes(part)) {
        return { src: `https://www.google.com/s2/favicons?domain=${domain}&sz=128` };
      }
    }
  }

  // Try each part of the name for company dataset matching
  for (const part of parts) {
    if (part.length < 3) continue;

    let match = ALL_COMPANIES.find((c) => {
      const cName = c.name.toLowerCase().split(",")[0].split(" (")[0].trim();
      return cName === part || cName.startsWith(part) || part.startsWith(cName);
    });

    if (!match) {
      const stripped = part
        .replace(/\b(inc\.?|corp\.?|corporation|company|co\.?|ltd\.?|llc|plc|ag|se|group|holdings?)\b/g, "")
        .trim();
      if (stripped.length >= 3) {
        match = ALL_COMPANIES.find((c) => {
          const cName = c.name.toLowerCase().split(",")[0].split(" (")[0].trim();
          return cName.includes(stripped) || stripped.includes(cName);
        });
      }
    }

    if (match) {
      return { src: match.logo, fallbackSrc: match.logoFallback, brandColor: match.brandColor };
    }
  }

  return {};
}

// Render entity name — no flag in text (flag shows only as logo icon)
function renderEntityName(name: string): string {
  return name;
}

// Find a matching company from the dataset for entity logo lookup.
function findCompanyLogo(name: string): { src?: string; fallbackSrc?: string; brandColor?: string } {
  const cleanName = name.toLowerCase().split(" (")[0].split(",")[0].trim();

  const countryNames = new Set([
    "china", "india", "japan", "germany", "france", "brazil", "russia",
    "united states", "united kingdom", "europe", "european union", "asia",
    "australia", "canada", "mexico", "italy", "spain", "netherlands",
    "switzerland", "sweden", "south korea", "north korea", "singapore",
    "hong kong", "taiwan", "vietnam", "indonesia", "thailand", "malaysia",
    "philippines", "saudi arabia", "uae", "dubai", "israel", "turkey",
    "poland", "hungary", "czech republic", "austria", "belgium", "ireland",
    "denmark", "norway", "finland", "portugal", "greece", "argentina",
    "chile", "colombia", "peru", "south africa", "nigeria", "egypt",
    "morocco", "algeria", "kenya", "ghana", "ethiopia", "pakistan",
    "bangladesh", "sri lanka", "kazakhstan", "uzbekistan", "iran", "iraq",
    "qatar", "kuwait", "bahrain", "oman", "jordan", "lebanon",
  ]);
  if (countryNames.has(cleanName)) return {};

  let match = ALL_COMPANIES.find((c) => {
    const cName = c.name.toLowerCase().split(",")[0].split(" (")[0].trim();
    return cName === cleanName;
  });
  if (!match && cleanName.length >= 5) {
    match = ALL_COMPANIES.find((c) => {
      const cName = c.name.toLowerCase().split(",")[0].split(" (")[0].trim();
      return cName.startsWith(cleanName) && cleanName.length >= 5;
    });
  }
  if (!match) {
    match = ALL_COMPANIES.find((c) => {
      const cName = c.name.toLowerCase().split(",")[0].split(" (")[0].trim();
      return cleanName.startsWith(cName) && cName.length >= 5;
    });
  }

  if (match) return { src: match.logo, fallbackSrc: match.logoFallback, brandColor: match.brandColor };
  return {};
}

const LANE_ORDER: ConnectionStrength[] = ["Critical", "High", "Moderate", "Low"];

const LANE_CONFIG: Record<
  ConnectionStrength,
  { label: string; description: string; bg: string; border: string; dot: string; badge: string }
> = {
  Critical: {
    label: "Critical leverage",
    description: "Relationships that could halt or fundamentally reshape this company's operations.",
    bg: "bg-foreground/5",
    border: "border-foreground/30",
    dot: "bg-ink",
    badge: "bg-foreground text-background",
  },
  High: {
    label: "High leverage",
    description: "Material relationships that shape strategic options and cost structure.",
    bg: "bg-terra-soft/10",
    border: "border-terra/30",
    dot: "bg-terra",
    badge: "bg-terra-soft text-foreground",
  },
  Moderate: {
    label: "Moderate leverage",
    description: "Relevant to understanding the ecosystem but not a defining dependency.",
    bg: "bg-muted/30",
    border: "border-border",
    dot: "bg-muted-foreground",
    badge: "bg-secondary text-foreground",
  },
  Low: {
    label: "Low leverage",
    description: "Contextual relationships; unlikely to materially affect strategy.",
    bg: "bg-muted/20",
    border: "border-border/60",
    dot: "bg-muted-foreground/50",
    badge: "bg-muted text-muted-foreground",
  },
};

const ENTITY_TYPE_LABEL: Record<string, string> = {
  company: "Company",
  government: "Government",
  regulator: "Regulator",
  investor: "Investor",
  fund: "Fund",
  supplier: "Supplier",
  country: "Country",
};

const confidenceLabel: Record<ConfidenceLevel, { label: string; dot: string }> = {
  Confirmed: { label: "Confirmed", dot: "bg-foreground" },
  High: { label: "High confidence", dot: "bg-terra" },
  Moderate: { label: "Moderate confidence", dot: "bg-muted-foreground" },
  Low: { label: "Preliminary", dot: "bg-muted-foreground/50" },
};

type FilterType = "All" | "Government" | "Investor" | "Supplier" | "Country";

function getEntityType(edge: ConnectionEdge, entity: EntityNode): FilterType {
  if (edge.type === "owns" || edge.type === "funds") return "Investor";
  if (edge.type === "regulates" || edge.type === "receives_grant_from" || edge.type === "procures_from")
    return "Government";
  if (edge.type === "supplies") return "Supplier";
  return "Country";
}

export function ConnectionsScreen({ company }: { company: Company }) {
  const { go } = useScout();
  const [filter, setFilter] = useState<FilterType>("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Group ALL connections by strength (leverage), not by entity type
  const lanes = useMemo(() => {
    const grouped: Record<ConnectionStrength, ConnectionEdge[]> = {
      Critical: [],
      High: [],
      Moderate: [],
      Low: [],
    };
    for (const edge of company.connections) {
      grouped[edge.strength].push(edge);
    }
    return grouped;
  }, [company]);

  // Apply filter
  const filteredLanes = useMemo(() => {
    if (filter === "All") return lanes;
    const result: Record<ConnectionStrength, ConnectionEdge[]> = {
      Critical: [], High: [], Moderate: [], Low: [],
    };
    for (const [strength, edges] of Object.entries(lanes)) {
      result[strength as ConnectionStrength] = edges.filter((edge) => {
        const entity = company.entities[edge.source === company.id ? edge.target : edge.source];
        if (!entity) return false;
        return getEntityType(edge, entity) === filter;
      });
    }
    return result;
  }, [lanes, filter, company]);

  // Government summary
  const govConnections = company.connections.filter((edge) => {
    const entity = company.entities[edge.source === company.id ? edge.target : edge.source];
    if (!entity) return false;
    return getEntityType(edge, entity) === "Government";
  });
  const govCount = govConnections.length;
  const criticalGovCount = govConnections.filter((e) => e.strength === "Critical").length;
  const highGovCount = govConnections.filter((e) => e.strength === "High").length;

  const investorConnections = company.connections.filter((edge) => {
    const entity = company.entities[edge.source === company.id ? edge.target : edge.source];
    if (!entity) return false;
    return getEntityType(edge, entity) === "Investor";
  });
  const sovereignInvestors = investorConnections.filter((edge) => {
    const entity = company.entities[edge.source === company.id ? edge.target : edge.source];
    return entity && (entity.type === "fund" || entity.type === "government") &&
      (entity.descriptor?.toLowerCase().includes("sovereign") ||
       entity.descriptor?.toLowerCase().includes("state") ||
       entity.descriptor?.toLowerCase().includes("pension"));
  }).length;

  const selectedEdge = selectedId
    ? company.connections.find((c) => c.id === selectedId) ?? null
    : null;
  const selectedEntity = selectedEdge
    ? company.entities[selectedEdge.source === company.id ? selectedEdge.target : selectedEdge.source]
    : null;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
      {/* Header */}
      <div className="mb-2 flex items-center gap-2 text-[12px] text-muted-foreground">
        <button onClick={() => go({ kind: "company", id: company.id })} className="hover:text-foreground">
          {company.name}
        </button>
        <span className="text-border">/</span>
        <span className="text-foreground">Connections</span>
      </div>

      <div className="flex items-start gap-4">
        <CompanyLogo
          name={company.name}
          src={company.logo}
          fallbackSrc={company.logoFallback}
          brandColor={company.brandColor}
          size="lg"
          rounded="lg"
        />
        <div>
          <h1 className="editorial-title text-[36px] leading-none sm:text-[44px]">
            {company.name}'s connections
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            Ordered by <strong>strength of leverage</strong>, not by entity type. A government with
            majority ownership sits at Critical; a government with a minor regulatory filing sits at
            Moderate — the layout itself communicates where leverage is real versus incidental.
          </p>
        </div>
      </div>

      <div className="my-8 h-px bg-border" />

      {/* Government summary strip */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard
          label="Governments engaged"
          value={govCount}
          subtext={criticalGovCount > 0 ? `${criticalGovCount} at Critical` : undefined}
          accent={criticalGovCount > 0 ? "terra" : "default"}
        />
        <SummaryCard
          label="High-leverage gov"
          value={highGovCount}
          subtext={highGovCount > 0 ? "Material political power" : "None at this level"}
          accent={highGovCount > 0 ? "terra" : "default"}
        />
        <SummaryCard
          label="Sovereign / state investors"
          value={sovereignInvestors}
          subtext={sovereignInvestors > 0 ? "State capital involved" : "No state capital"}
          accent={sovereignInvestors > 0 ? "terra" : "default"}
        />
        <SummaryCard
          label="Total connections"
          value={company.connections.length}
          subtext="Across all entity types"
          accent="default"
        />
      </div>

      {/* Filter row */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="editorial-eyebrow mr-1 text-muted-foreground">Filter by type</span>
        {(["All", "Government", "Investor", "Supplier", "Country"] as FilterType[]).map((f) => {
          const count = f === "All"
            ? company.connections.length
            : company.connections.filter((edge) => {
                const entity = company.entities[edge.source === company.id ? edge.target : edge.source];
                return entity && getEntityType(edge, entity) === f;
              }).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-[12.5px] transition-all",
                filter === f
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-foreground/80 hover:border-foreground/30 hover:text-foreground"
              )}
            >
              {f}
              <span className="ml-1.5 tabular-nums opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {/* ═══ Leverage lanes — full width, no sidebar ═══ */}
      <div className="space-y-6">
          {LANE_ORDER.map((strength) => {
            const edges = filteredLanes[strength];
            if (edges.length === 0) return null;
            const config = LANE_CONFIG[strength];

            return (
              <section key={strength}>
                {/* Lane header */}
                <div className={cn("mb-3 rounded-lg border px-4 py-2.5", config.border, config.bg)}>
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", config.dot)} />
                    <span className="text-[14px] font-medium text-foreground">{config.label}</span>
                    <span className="text-[12px] tabular-nums text-muted-foreground">{edges.length}</span>
                  </div>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                    {config.description}
                  </p>
                </div>

                {/* Entity cards */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {edges.map((edge) => {
                    const entity = company.entities[edge.source === company.id ? edge.target : edge.source];
                    if (!entity) return null;
                    const isSelected = selectedId === edge.id;
                    const cConfig = confidenceLabel[edge.confidence];

                    return (
                      <button
                        key={edge.id}
                        onClick={() => setSelectedId(isSelected ? null : edge.id)}
                        className={cn(
                          "group relative flex flex-col gap-2 rounded-xl border bg-card p-4 text-left transition-all",
                          isSelected
                            ? "border-foreground/40 ring-1 ring-foreground/10 shadow-sm"
                            : "border-border hover:border-foreground/20 hover:shadow-sm"
                        )}
                      >
                        {/* Top row: entity logo + name + strength badge */}
                        <div className="flex items-start gap-2.5">
                          <EntityLogo entity={entity} size="md" rounded="md" />
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-[14px] font-medium leading-tight text-foreground">
                              {renderEntityName(entity.name)}
                            </h3>
                            <span className="mt-0.5 inline-block rounded-full border border-border px-1.5 py-0.5 text-[9.5px] uppercase tracking-wider text-muted-foreground">
                              {ENTITY_TYPE_LABEL[entity.type] || entity.type}
                            </span>
                          </div>
                          <span className={cn("shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider", config.badge)}>
                            {strength}
                          </span>
                        </div>

                        {/* Relationship label */}
                        <div className="rounded-md bg-secondary/50 px-2.5 py-1.5 text-[12px] text-foreground">
                          {edge.label}
                        </div>

                        {/* Description */}
                        {edge.description && (
                          <p className="line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
                            {edge.description}
                          </p>
                        )}

                        {/* Confidence */}
                        <div className="mt-auto flex items-center gap-1.5 border-t border-border/60 pt-2 text-[10.5px] text-muted-foreground">
                          <span className={cn("h-1.5 w-1.5 rounded-full", cConfig.dot)} />
                          {cConfig.label}
                          <ArrowRight className="ml-auto h-3 w-3 opacity-0 transition-opacity group-hover:opacity-60" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {/* Empty state */}
          {LANE_ORDER.every((s) => filteredLanes[s].length === 0) && (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
              <Network className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-[14px] text-muted-foreground">
                No {filter !== "All" ? filter.toLowerCase() : ""} connections at any leverage level.
              </p>
            </div>
          )}
      </div>

      {/* ═══ Detail overlay — appears when a card is clicked, immediately visible ═══ */}
      {selectedEdge && selectedEntity && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm animate-fade-up"
            onClick={() => setSelectedId(null)}
          />
          {/* Slide-in panel from right */}
          <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-border bg-card shadow-2xl animate-fade-up scrollbar-scout">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 px-5 py-3 backdrop-blur">
              <span className="editorial-eyebrow text-muted-foreground">Relationship detail</span>
              <button
                onClick={() => setSelectedId(null)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-3">
                <EntityLogo entity={selectedEntity} size="lg" rounded="lg" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-serif text-[20px] font-medium leading-tight">
                    {selectedEntity.name}
                  </h3>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="rounded-full border border-border px-1.5 py-0.5 text-[9.5px] uppercase tracking-wider text-muted-foreground">
                      {ENTITY_TYPE_LABEL[selectedEntity.type] || selectedEntity.type}
                    </span>
                    {selectedEntity.descriptor && (
                      <span className="text-[12px] text-muted-foreground">{selectedEntity.descriptor}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="my-4 flex items-center justify-center gap-3 rounded-lg bg-secondary/50 px-4 py-3">
                <span className="text-[12px] text-muted-foreground">{selectedEntity.name}</span>
                <span className="text-terra">→</span>
                <span className="text-[12px] font-medium text-foreground">{company.name}</span>
              </div>

              <div className="rounded-md bg-terra-soft/30 px-3 py-2 text-[13px] text-foreground">
                {selectedEdge.label}
              </div>

              <p className="mt-4 text-[14px] leading-relaxed text-foreground/90">
                {selectedEdge.description}
              </p>

              {selectedEdge.evidence && (
                <div className="mt-3 border-l-2 border-border pl-3">
                  <div className="editorial-eyebrow mb-1 text-[10px] text-muted-foreground">Evidence</div>
                  <p className="text-[12.5px] italic leading-relaxed text-muted-foreground">
                    {selectedEdge.evidence}
                  </p>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11.5px] font-medium", LANE_CONFIG[selectedEdge.strength].badge)}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                  {selectedEdge.strength} leverage
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-[11.5px] text-muted-foreground">
                  <span className={cn("h-1.5 w-1.5 rounded-full", confidenceLabel[selectedEdge.confidence].dot)} />
                  {confidenceLabel[selectedEdge.confidence].label}
                </span>
              </div>

              {/* What this means */}
              <div className="mt-5 rounded-xl border border-border bg-secondary/30 p-4">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-terra" />
                  <div className="editorial-eyebrow text-terra">What this means</div>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-foreground/85">
                  {getStrengthExplanation(selectedEdge.strength, selectedEntity.name, company.name)}
                </p>
              </div>

              {/* Methodology */}
              <div className="mt-3 rounded-xl border border-dashed border-border bg-card/50 p-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                  <div className="editorial-eyebrow text-muted-foreground">Methodology</div>
                </div>
                <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
                  Leverage labels (Critical/High/Moderate/Low) describe <strong>relationship strength</strong>,
                  not Scout Index tiers. They are qualitatively assessed from public filings and regulatory records.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  subtext,
  accent = "default",
}: {
  label: string;
  value: number;
  subtext?: string;
  accent?: "default" | "terra";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        accent === "terra" ? "border-terra/30 bg-terra-soft/5" : "border-border bg-card"
      )}
    >
      <div className="editorial-eyebrow text-[10px] text-muted-foreground">{label}</div>
      <div className="mt-1 font-serif text-[24px] font-medium tabular-nums text-foreground">
        {value}
      </div>
      {subtext && (
        <div className={cn("mt-0.5 text-[10.5px]", accent === "terra" ? "text-terra" : "text-muted-foreground")}>
          {subtext}
        </div>
      )}
    </div>
  );
}

function getStrengthExplanation(
  strength: ConnectionStrength,
  entityName: string,
  companyName: string
): string {
  switch (strength) {
    case "Critical":
      return `${entityName} has critical leverage over ${companyName}. A disruption to this relationship — whether through political, regulatory, financial or operational channels — would materially affect ${companyName}'s ability to operate. This relationship is monitored closely by analysts and policymakers.`;
    case "High":
      return `${entityName} represents a strategically important relationship for ${companyName}. While not strictly critical, this connection materially shapes ${companyName}'s strategic options, cost structure or regulatory exposure.`;
    case "Moderate":
      return `${entityName} maintains a meaningful relationship with ${companyName}. The connection is relevant to understanding ${companyName}'s broader ecosystem but is not a defining strategic dependency.`;
    case "Low":
      return `${entityName} has a limited or contextual relationship with ${companyName}. Documented for completeness; unlikely to materially affect ${companyName}'s strategic position.`;
  }
}
