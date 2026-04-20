'use client';

import { getCityColor, displayCityName } from '@/lib/dataUtils';

interface ColorLegendProps {
  cities: string[];
  allCities: string[];
}

export default function ColorLegend({ cities, allCities }: ColorLegendProps) {
  if (cities.length === 0) return null;
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-4 sm:px-6 py-4">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
        Color Legend
      </p>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {cities.map((city) => {
          const idx = allCities.indexOf(city);
          return (
            <div key={city} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: getCityColor(idx >= 0 ? idx : 0) }}
              />
              <span className="text-sm text-slate-700">{displayCityName(city)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
