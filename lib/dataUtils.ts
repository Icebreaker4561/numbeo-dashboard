export type SectionKey =
  | 'cost-of-living'
  | 'quality-of-life'
  | 'crime'
  | 'health-care'
  | 'pollution'
  | 'traffic'
  | 'property-investment';

export interface CityData {
  city: string;
  scrapedAt: string;
  sections: Partial<Record<SectionKey, Record<string, number>>>;
}

export const SECTION_LABELS: Record<SectionKey, string> = {
  'cost-of-living': 'Cost of Living',
  'quality-of-life': 'Quality of Life',
  crime: 'Crime',
  'health-care': 'Health Care',
  pollution: 'Pollution',
  traffic: 'Traffic',
  'property-investment': 'Property Investment',
};

export const SECTION_KEYS: SectionKey[] = [
  'cost-of-living',
  'quality-of-life',
  'crime',
  'health-care',
  'pollution',
  'traffic',
  'property-investment',
];

export const DEFAULT_CITIES = [
  'Barcelona',
  'Porto',
  'Lisbon',
  'Tbilisi',
  'Yerevan',
  'Antibes',
];

// Sections where values are monetary (prices in local currency)
export const MONETARY_SECTIONS: SectionKey[] = ['cost-of-living', 'property-investment'];

// Local currency per city slug (EUR cities are 1:1)
const CITY_CURRENCY: Record<string, string> = {
  Tbilisi: 'GEL',
  Batumi: 'GEL',
  Yerevan: 'AMD',
};

// Approximate EUR conversion rates (April 2026)
const EUR_RATE: Record<string, number> = {
  EUR: 1,
  GEL: 0.34,   // 1 GEL ≈ 0.34 EUR
  AMD: 0.0024, // 1 AMD ≈ 0.0024 EUR (1 EUR ≈ 415 AMD)
};

export function getCityCurrency(citySlug: string): string {
  return CITY_CURRENCY[citySlug] ?? 'EUR';
}

export function convertToEur(value: number, citySlug: string): number {
  const currency = getCityCurrency(citySlug);
  const rate = EUR_RATE[currency] ?? 1;
  return Math.round(value * rate * 100) / 100;
}

// Some metrics in monetary sections are % or ratios — don't convert
const NON_MONETARY_KEYWORDS = ['rate', 'ratio', 'index', '%'];

export function shouldConvertToEur(metricName: string): boolean {
  const lower = metricName.toLowerCase();
  return !NON_MONETARY_KEYWORDS.some((kw) => lower.includes(kw));
}

/** Clean display name: remove -Spain, -Portugal country suffixes */
export function displayCityName(slug: string): string {
  return slug
    .replace(/-Spain$/i, '')
    .replace(/-Portugal$/i, '')
    .replace(/-France$/i, '')
    .replace(/-Georgia$/i, '')
    .replace(/-Armenia$/i, '')
    .replace(/-/g, ' ');
}

/** Filter out cities with no metrics */
export function filterValidCities(cities: CityData[]): CityData[] {
  return cities.filter((c) => {
    const totalMetrics = Object.values(c.sections).reduce(
      (acc, section) => acc + Object.keys(section ?? {}).length,
      0
    );
    return totalMetrics > 0;
  });
}

/** Get all metric names for a section across a set of cities */
export function getSectionMetrics(
  cities: CityData[],
  section: SectionKey
): string[] {
  const metricSet = new Set<string>();
  for (const city of cities) {
    const sectionData = city.sections[section];
    if (sectionData) {
      Object.keys(sectionData).forEach((k) => metricSet.add(k));
    }
  }
  return Array.from(metricSet);
}

/** Build chart data for a single metric: [{city: ..., value: ...}, ...] */
export function getMetricChartData(
  cities: CityData[],
  section: SectionKey,
  metric: string
): Array<{ city: string; value: number | null }> {
  return cities.map((c) => ({
    city: c.city,
    value: c.sections[section]?.[metric] ?? null,
  }));
}

/** Assign a stable color to each city by index */
export const CITY_COLORS = [
  '#6366f1', // indigo
  '#f59e0b', // amber
  '#10b981', // emerald
  '#ef4444', // red
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#f97316', // orange
  '#14b8a6', // teal
  '#ec4899', // pink
  '#84cc16', // lime
];

export function getCityColor(index: number): string {
  return CITY_COLORS[index % CITY_COLORS.length];
}

/** Shorten long metric names for chart display */
export function shortMetricName(name: string, maxLen = 40): string {
  if (name.length <= maxLen) return name;
  return name.slice(0, maxLen - 1) + '…';
}
