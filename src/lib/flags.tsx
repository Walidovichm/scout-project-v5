// Country flag emoji helper — shared across Scout components
// Converts a country name or code to a Unicode flag emoji.

export const COUNTRY_FLAGS: Record<string, string> = {
  "United States": "🇺🇸", "US": "🇺🇸", "USA": "🇺🇸",
  "China": "🇨🇳", "CN": "🇨🇳",
  "Taiwan": "🇹🇼", "TW": "🇹🇼",
  "South Korea": "🇰🇷", "KR": "🇰🇷", "Korea": "🇰🇷",
  "Japan": "🇯🇵", "JP": "🇯🇵",
  "Netherlands": "🇳🇱", "NL": "🇳🇱",
  "Germany": "🇩🇪", "DE": "🇩🇪",
  "France": "🇫🇷", "FR": "🇫🇷",
  "United Kingdom": "🇬🇧", "UK": "🇬🇧", "GB": "🇬🇧",
  "Switzerland": "🇨🇭", "CH": "🇨🇭",
  "Saudi Arabia": "🇸🇦", "SA": "🇸🇦",
  "Russia": "🇷🇺", "RU": "🇷🇺",
  "India": "🇮🇳", "IN": "🇮🇳",
  "Brazil": "🇧🇷", "BR": "🇧🇷",
  "Canada": "🇨🇦", "CA": "🇨🇦",
  "Australia": "🇦🇺", "AU": "🇦🇺",
  "Mexico": "🇲🇽", "MX": "🇲🇽",
  "Italy": "🇮🇹", "IT": "🇮🇹",
  "Spain": "🇪🇸", "ES": "🇪🇸",
  "Sweden": "🇸🇪", "SE": "🇸🇪",
  "Denmark": "🇩🇰", "DK": "🇩🇰",
  "Norway": "🇳🇴", "NO": "🇳🇴",
  "Finland": "🇫🇮", "FI": "🇫🇮",
  "Ireland": "🇮🇪", "IE": "🇮🇪",
  "Belgium": "🇧🇪", "BE": "🇧🇪",
  "Luxembourg": "🇱🇺", "LU": "🇱🇺",
  "Singapore": "🇸🇬", "SG": "🇸🇬",
  "United Arab Emirates": "🇦🇪", "UAE": "🇦🇪", "AE": "🇦🇪",
  "Israel": "🇮🇱", "IL": "🇮🇱",
  "Turkey": "🇹🇷", "TR": "🇹🇷",
  "South Africa": "🇿🇦", "ZA": "🇿🇦",
  "Argentina": "🇦🇷", "AR": "🇦🇷",
  "Chile": "🇨🇱", "CL": "🇨🇱",
  "Indonesia": "🇮🇩", "ID": "🇮🇩",
  "Vietnam": "🇻🇳", "VN": "🇻🇳",
  "Thailand": "🇹🇭", "TH": "🇹🇭",
  "Malaysia": "🇲🇾", "MY": "🇲🇾",
  "Philippines": "🇵🇭", "PH": "🇵🇭",
  "Poland": "🇵🇱", "PL": "🇵🇱",
  "Hungary": "🇭🇺", "HU": "🇭🇺",
  "Czech Republic": "🇨🇿", "CZ": "🇨🇿",
  "Austria": "🇦🇹", "AT": "🇦🇹",
  "Portugal": "🇵🇹", "PT": "🇵🇹",
  "Greece": "🇬🇷", "GR": "🇬🇷",
  "Hong Kong": "🇭🇰", "HK": "🇭🇰",
  "Pakistan": "🇵🇰", "PK": "🇵🇰",
  "Bangladesh": "🇧🇩", "BD": "🇧🇩",
  "Nigeria": "🇳🇬", "NG": "🇳🇬",
  "Egypt": "🇪🇬", "EG": "🇪🇬",
  "Kenya": "🇰🇪", "KE": "🇰🇪",
  "Colombia": "🇨🇴", "CO": "🇨🇴",
  "Peru": "🇵🇪", "PE": "🇵🇪",
  "Qatar": "🇶🇦", "QA": "🇶🇦",
  "Kuwait": "🇰🇼", "KW": "🇰🇼",
  "Iran": "🇮🇷", "IR": "🇮🇷",
  "Iraq": "🇮🇶", "IQ": "🇮🇶",
  "Kazakhstan": "🇰🇿", "KZ": "🇰🇿",
  "European Union": "🇪🇺", "EU": "🇪🇺",
  "Côte d'Ivoire": "🇨🇮",
  "Ghana": "🇬🇭", "GH": "🇬🇭",
  "Ethiopia": "🇪🇹", "ET": "🇪🇹",
  "Sri Lanka": "🇱🇰", "LK": "🇱🇰",
  "Morocco": "🇲🇦", "MA": "🇲🇦",
  "Algeria": "🇩🇿", "DZ": "🇩🇿",
  "Jordan": "🇯🇴", "JO": "🇯🇴",
  "Lebanon": "🇱🇧", "LB": "🇱🇧",
  "Oman": "🇴🇲", "OM": "🇴🇲",
  "Bahrain": "🇧🇭", "BH": "🇧🇭",
  "Uzbekistan": "🇺🇿", "UZ": "🇺🇿",
};

// Get flag emoji for a country name or code
export function getFlag(countryNameOrCode: string): string {
  return COUNTRY_FLAGS[countryNameOrCode] || "";
}

// Render text with country flags inserted after country names
export function renderWithFlags(text: string): import("react").ReactNode {
  if (!text) return text;
  const countryNames = Object.keys(COUNTRY_FLAGS)
    .filter(k => k.length > 2 && !k.match(/^[A-Z]{2,3}$/))
    .sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`\\b(${countryNames.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'g');

  const parts: import("react").ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const countryName = match[1];
    parts.push(
      <span key={key++}>
        {countryName} <span className="text-[0.9em]">{COUNTRY_FLAGS[countryName]}</span>
      </span>
    );
    lastIndex = match.index + countryName.length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? parts : text;
}
