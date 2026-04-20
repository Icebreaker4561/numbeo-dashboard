'use client';

import { useState } from 'react';
import { getSectionMetrics, getMetricChartData } from '@/lib/dataUtils';
import type { CityData, SectionKey } from '@/lib/dataUtils';
import MetricBarChart from './MetricBarChart';

interface SectionAccordionProps {
  label: string;
  sectionKey: SectionKey;
  allCities: CityData[];
  selectedCities: CityData[];
  defaultOpen?: boolean;
}

// Currency metrics — show $ prefix context in tooltip
const CURRENCY_KEYWORDS = [
  'apartment', 'rent', 'salary', 'price', 'restaurant', 'meal', 'beer',
  'coffee', 'water', 'milk', 'bread', 'rice', 'eggs', 'cheese', 'chicken',
  'beef', 'apples', 'bananas', 'oranges', 'tomatoes', 'potatoes', 'onions',
  'lettuce', 'wine', 'domestic beer', 'cigarettes', 'ticket', 'pass',
  'taxi', 'gasoline', 'volkswagen', 'toyota', 'utilities', 'mobile phone',
  'internet', 'fitness', 'tennis', 'cinema', 'preschool', 'school', 'jeans',
  'dress', 'nike', 'shoes', 'mortgage',
];

function guessUnit(metric: string): string | undefined {
  const lower = metric.toLowerCase();
  if (lower.includes('rate') && lower.includes('%')) return '%';
  if (lower.includes('index') || lower.includes('ratio')) return '';
  if (CURRENCY_KEYWORDS.some((k) => lower.includes(k))) return '€';
  return '';
}

export default function SectionAccordion({
  label,
  sectionKey,
  allCities,
  selectedCities,
  defaultOpen = false,
}: SectionAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  const metrics = getSectionMetrics(selectedCities, sectionKey);

  const hasData = metrics.length > 0 && selectedCities.length > 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 sm:px-6 py-4 text-left hover:bg-slate-50 transition-colors"
        aria-expanded={open}
      >
        <span className="text-base font-semibold text-slate-800">{label}</span>
        <span className="flex items-center gap-2">
          {hasData && (
            <span className="text-xs text-slate-400 font-normal hidden sm:inline">
              {metrics.length} metrics · {selectedCities.length} cities
            </span>
          )}
          <svg
            className={`w-5 h-5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {open && (
        <div className="border-t border-slate-100 px-4 sm:px-6 pb-6 pt-4">
          {!hasData ? (
            <p className="text-sm text-slate-400 py-4 text-center">
              No data available. Select at least one city.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {metrics.map((metric) => {
                const data = getMetricChartData(allCities, sectionKey, metric);
                // Only keep selected cities
                const filteredData = data.filter((d) =>
                  selectedCities.some((c) => c.city === d.city)
                );
                return (
                  <MetricBarChart
                    key={metric}
                    metric={metric}
                    data={filteredData}
                    unit={guessUnit(metric)}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
