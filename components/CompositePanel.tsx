'use client';

import type { CityData } from '@/lib/dataUtils';
import { COMPOSITE_INDICATORS } from '@/lib/compositeIndicators';
import CompositeBarChart from './CompositeBarChart';

interface CompositePanelProps {
  allCities: CityData[];
  selectedCities: CityData[];
}

export default function CompositePanel({
  allCities,
  selectedCities,
}: CompositePanelProps) {
  if (selectedCities.length === 0) return null;

  const allCityNames = allCities.map((c) => c.city);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-slate-100">
        <h2 className="text-base font-semibold text-slate-800">
          Сводные показатели
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Агрегированные индексы для быстрого сравнения городов
        </p>
      </div>
      <div className="px-4 sm:px-6 pb-6 pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {COMPOSITE_INDICATORS.map((indicator) => {
            const data = allCities.map((city) => ({
              city: city.city,
              value: indicator.calculate(city),
            }));
            const filteredData = data.filter((d) =>
              selectedCities.some((c) => c.city === d.city)
            );
            return (
              <CompositeBarChart
                key={indicator.key}
                label={indicator.label}
                description={indicator.description}
                unit={indicator.unit}
                lowerIsBetter={indicator.lowerIsBetter}
                data={filteredData}
                allCityNames={allCityNames}
                subMetrics={indicator.subMetrics}
                selectedCities={selectedCities}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
