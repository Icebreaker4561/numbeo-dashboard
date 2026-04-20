'use client';

import { useState } from 'react';
import type { CityData, SectionKey } from '@/lib/dataUtils';
import { SECTION_KEYS, DEFAULT_CITIES } from '@/lib/dataUtils';
import { UI, tSection } from '@/lib/translations';
import CitySelector from './CitySelector';
import SectionAccordion from './SectionAccordion';
import ColorLegend from './ColorLegend';
import CompositePanel from './CompositePanel';

interface DashboardProps {
  cities: CityData[];
}

export default function Dashboard({ cities }: DashboardProps) {
  const allCityNames = cities.map((c) => c.city);

  const initialSelected = DEFAULT_CITIES.filter((name) =>
    allCityNames.includes(name)
  );

  const [selected, setSelected] = useState<string[]>(initialSelected);

  const selectedCities = cities.filter((c) => selected.includes(c.city));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
              {UI.title}
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              {UI.subtitle(cities.length, 7)}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-4 sm:space-y-6">
        {/* City Selector */}
        <CitySelector
          allCities={allCityNames}
          selected={selected}
          onChange={setSelected}
        />

        {/* Legend */}
        {selected.length > 0 && (
          <ColorLegend cities={selected} allCities={allCityNames} />
        )}

        {/* Composite indicators */}
        {selected.length > 0 && (
          <CompositePanel allCities={cities} selectedCities={selectedCities} />
        )}

        {/* Empty state */}
        {selected.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-16 text-center">
            <p className="text-slate-400 text-base">{UI.selectOneCity}</p>
          </div>
        )}

        {/* Sections */}
        {selected.length > 0 &&
          SECTION_KEYS.map((sectionKey: SectionKey, i) => (
            <SectionAccordion
              key={sectionKey}
              label={tSection(sectionKey)}
              sectionKey={sectionKey}
              allCities={cities}
              selectedCities={selectedCities}
              defaultOpen={i === 0}
            />
          ))}

        {/* Footer */}
        <footer className="text-center text-xs text-slate-400 py-4">
          {UI.footer(new Date(cities[0]?.scrapedAt ?? '').toLocaleDateString('ru-RU'))}
        </footer>
      </main>
    </div>
  );
}
