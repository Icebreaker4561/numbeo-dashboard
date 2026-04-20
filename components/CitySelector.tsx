'use client';

import { getCityColor } from '@/lib/dataUtils';

interface CitySelectorProps {
  allCities: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function CitySelector({
  allCities,
  selected,
  onChange,
}: CitySelectorProps) {
  const toggle = (city: string) => {
    if (selected.includes(city)) {
      onChange(selected.filter((c) => c !== city));
    } else {
      onChange([...selected, city]);
    }
  };

  const selectAll = () => onChange([...allCities]);
  const clearAll = () => onChange([]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-base font-semibold text-slate-800">
          Select Cities
          <span className="ml-2 text-sm font-normal text-slate-500">
            ({selected.length} selected)
          </span>
        </h2>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="text-xs px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            All
          </button>
          <button
            onClick={clearAll}
            className="text-xs px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            None
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {allCities.map((city, i) => {
          const isSelected = selected.includes(city);
          const color = getCityColor(i);
          return (
            <button
              key={city}
              onClick={() => toggle(city)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                isSelected
                  ? 'text-white shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
              style={
                isSelected
                  ? { backgroundColor: color, borderColor: color }
                  : {}
              }
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.7)' : color }}
              />
              {city}
            </button>
          );
        })}
      </div>
    </div>
  );
}
