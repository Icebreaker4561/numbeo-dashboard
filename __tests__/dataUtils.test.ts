import {
  filterValidCities,
  getSectionMetrics,
  getMetricChartData,
  getCityColor,
  CITY_COLORS,
  shortMetricName,
  DEFAULT_CITIES,
  SECTION_KEYS,
} from '../lib/dataUtils';
import type { CityData } from '../lib/dataUtils';

const mockCities: CityData[] = [
  {
    city: 'CityA',
    scrapedAt: '2026-01-01T00:00:00Z',
    sections: {
      'cost-of-living': { Beer: 2.5, Coffee: 1.2 },
      'quality-of-life': { 'Safety Index': 60 },
    },
  },
  {
    city: 'CityB',
    scrapedAt: '2026-01-01T00:00:00Z',
    sections: {
      'cost-of-living': { Beer: 3.0, Coffee: 1.5, Wine: 5 },
    },
  },
  {
    city: 'EmptyCity',
    scrapedAt: '2026-01-01T00:00:00Z',
    sections: {},
  },
];

describe('filterValidCities', () => {
  it('removes cities with no metrics', () => {
    const result = filterValidCities(mockCities);
    expect(result.map((c) => c.city)).toEqual(['CityA', 'CityB']);
  });

  it('keeps all cities when all have metrics', () => {
    const result = filterValidCities([mockCities[0], mockCities[1]]);
    expect(result).toHaveLength(2);
  });

  it('returns empty array when all cities are empty', () => {
    const result = filterValidCities([mockCities[2]]);
    expect(result).toHaveLength(0);
  });
});

describe('getSectionMetrics', () => {
  it('returns union of metric keys across cities', () => {
    const metrics = getSectionMetrics(mockCities, 'cost-of-living');
    expect(metrics).toContain('Beer');
    expect(metrics).toContain('Coffee');
    expect(metrics).toContain('Wine');
    expect(metrics).toHaveLength(3);
  });

  it('returns empty array for section with no data', () => {
    const metrics = getSectionMetrics(mockCities, 'crime');
    expect(metrics).toHaveLength(0);
  });

  it('handles city missing a section gracefully', () => {
    const metrics = getSectionMetrics(mockCities, 'quality-of-life');
    expect(metrics).toContain('Safety Index');
    expect(metrics).toHaveLength(1);
  });
});

describe('getMetricChartData', () => {
  it('returns value for each city', () => {
    const data = getMetricChartData(mockCities, 'cost-of-living', 'Beer');
    expect(data).toEqual([
      { city: 'CityA', value: 2.5 },
      { city: 'CityB', value: 3.0 },
      { city: 'EmptyCity', value: null },
    ]);
  });

  it('returns null for city missing the metric', () => {
    const data = getMetricChartData(mockCities, 'cost-of-living', 'Wine');
    expect(data.find((d) => d.city === 'CityA')?.value).toBeNull();
    expect(data.find((d) => d.city === 'CityB')?.value).toBe(5);
  });
});

describe('getCityColor', () => {
  it('returns a color string for index 0', () => {
    expect(getCityColor(0)).toBe(CITY_COLORS[0]);
  });

  it('wraps around when index exceeds palette size', () => {
    expect(getCityColor(CITY_COLORS.length)).toBe(CITY_COLORS[0]);
  });

  it('returns different colors for adjacent indices', () => {
    expect(getCityColor(0)).not.toBe(getCityColor(1));
  });
});

describe('shortMetricName', () => {
  it('returns the name unchanged if short enough', () => {
    expect(shortMetricName('Beer', 40)).toBe('Beer');
  });

  it('truncates and adds ellipsis for long names', () => {
    const long = 'A'.repeat(50);
    const result = shortMetricName(long, 40);
    expect(result.length).toBe(40);
    expect(result.endsWith('…')).toBe(true);
  });

  it('defaults to max 40 chars', () => {
    const long = 'B'.repeat(50);
    const result = shortMetricName(long);
    expect(result.length).toBe(40);
  });
});

describe('DEFAULT_CITIES', () => {
  it('contains the 6 default cities', () => {
    expect(DEFAULT_CITIES).toContain('Barcelona');
    expect(DEFAULT_CITIES).toContain('Porto');
    expect(DEFAULT_CITIES).toContain('Lisbon');
    expect(DEFAULT_CITIES).toContain('Tbilisi');
    expect(DEFAULT_CITIES).toContain('Yerevan');
    expect(DEFAULT_CITIES).toContain('Antibes');
    expect(DEFAULT_CITIES).toHaveLength(6);
  });
});

describe('SECTION_KEYS', () => {
  it('contains all 7 sections', () => {
    expect(SECTION_KEYS).toHaveLength(7);
    expect(SECTION_KEYS).toContain('cost-of-living');
    expect(SECTION_KEYS).toContain('property-investment');
  });
});

describe('real cities.json data', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const rawData: CityData[] = require('../app/data/cities.json');

  it('has 17 total cities in the file', () => {
    expect(rawData).toHaveLength(17);
  });

  it('filters out 3 empty cities, leaving 14 valid', () => {
    const valid = filterValidCities(rawData);
    expect(valid).toHaveLength(14);
  });

  it('all default cities are present and valid', () => {
    const valid = filterValidCities(rawData);
    const names = valid.map((c) => c.city);
    for (const city of DEFAULT_CITIES) {
      expect(names).toContain(city);
    }
  });

  it('Barcelona has cost-of-living metrics', () => {
    const barcelona = rawData.find((c) => c.city === 'Barcelona')!;
    const metrics = getSectionMetrics([barcelona], 'cost-of-living');
    expect(metrics.length).toBeGreaterThan(10);
  });

  it('getMetricChartData returns numeric values for Beer across real cities', () => {
    const valid = filterValidCities(rawData);
    const data = getMetricChartData(valid, 'cost-of-living', 'Domestic Draft Beer (0.5 Liter)');
    const withValues = data.filter((d) => d.value !== null);
    expect(withValues.length).toBeGreaterThan(0);
  });
});
