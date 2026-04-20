'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { getCityColor, displayCityName } from '@/lib/dataUtils';
import type { CityData } from '@/lib/dataUtils';
import type { SubMetric } from '@/lib/compositeIndicators';

interface DataPoint {
  city: string;
  value: number | null;
}

interface CompositeBarChartProps {
  label: string;
  description: string;
  unit: string;
  lowerIsBetter: boolean;
  data: DataPoint[];
  allCityNames: string[];
  subMetrics: SubMetric[];
  selectedCities: CityData[];
}

const CustomTooltip = ({
  active,
  payload,
  unit,
}: {
  active?: boolean;
  payload?: Array<{ payload: { displayCity: string; value: number | null } }>;
  unit: string;
}) => {
  if (!active || !payload || !payload.length) return null;
  const { displayCity, value } = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-md px-3 py-2 text-sm">
      <p className="font-semibold text-slate-800">{displayCity}</p>
      {value !== null ? (
        <p className="text-slate-600">
          {value.toLocaleString(undefined, { maximumFractionDigits: 1 })}
          {unit ? ` ${unit}` : ''}
        </p>
      ) : (
        <p className="text-slate-400">Нет данных</p>
      )}
    </div>
  );
};

export default function CompositeBarChart({
  label,
  description,
  unit,
  lowerIsBetter,
  data,
  allCityNames,
  subMetrics,
  selectedCities,
}: CompositeBarChartProps) {
  const [expanded, setExpanded] = useState(false);

  const hasAnyValue = data.some((d) => d.value !== null);
  if (!hasAnyValue) return null;

  const chartData = data.map((d) => ({
    city: (() => {
      const n = displayCityName(d.city);
      return n.length > 12 ? n.slice(0, 12) + '…' : n;
    })(),
    displayCity: displayCityName(d.city),
    fullCity: d.city,
    value: d.value,
  }));

  const maxVal = Math.max(
    ...data.filter((d) => d.value !== null).map((d) => d.value as number)
  );

  const hasSubMetrics = subMetrics.length > 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="p-3 sm:p-4">
        <div className="mb-3">
          <div className="flex items-start justify-between">
            <h4 className="text-xs sm:text-sm font-medium text-slate-700 leading-tight flex-1">
              {label}
            </h4>
            {lowerIsBetter && (
              <span className="ml-2 flex-shrink-0 text-xs text-slate-400">↓ лучше</span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-snug">{description}</p>
        </div>

        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 4, left: 0, bottom: 4 }}
            barCategoryGap="30%"
          >
            <XAxis
              dataKey="city"
              tick={{ fontSize: 10, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 9, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              width={42}
              domain={[0, lowerIsBetter ? maxVal * 1.1 : 100]}
              tickFormatter={(v: number) =>
                v >= 1000
                  ? `${(v / 1000).toFixed(0)}k`
                  : v.toLocaleString(undefined, { maximumFractionDigits: 0 })
              }
            />
            <Tooltip
              content={(props) => (
                <CustomTooltip
                  active={props.active}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  payload={props.payload as any}
                  unit={unit}
                />
              )}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry) => {
                const idx = allCityNames.indexOf(entry.fullCity);
                return (
                  <Cell
                    key={entry.fullCity}
                    fill={
                      entry.value !== null
                        ? getCityColor(idx >= 0 ? idx : 0)
                        : '#e2e8f0'
                    }
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {hasSubMetrics && (
        <>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="w-full flex items-center justify-between px-3 sm:px-4 py-2 text-xs text-slate-500 hover:bg-slate-50 border-t border-slate-100 transition-colors"
          >
            <span>{expanded ? 'Скрыть составляющие' : 'Показать составляющие'}</span>
            <svg
              className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expanded && (
            <div className="border-t border-slate-100 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left px-3 py-2 font-medium text-slate-500 whitespace-nowrap">
                      Показатель
                    </th>
                    {selectedCities.map((city) => {
                      const idx = allCityNames.indexOf(city.city);
                      return (
                        <th
                          key={city.city}
                          className="text-right px-3 py-2 font-medium whitespace-nowrap"
                          style={{ color: getCityColor(idx >= 0 ? idx : 0) }}
                        >
                          {displayCityName(city.city)}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {subMetrics.map((sm, i) => (
                    <tr
                      key={i}
                      className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                    >
                      <td className="px-3 py-2 text-slate-600 whitespace-nowrap">
                        {sm.label}
                        {sm.unit ? (
                          <span className="ml-1 text-slate-400">{sm.unit}</span>
                        ) : null}
                      </td>
                      {selectedCities.map((city) => {
                        const val = sm.getValue(city);
                        return (
                          <td
                            key={city.city}
                            className="text-right px-3 py-2 text-slate-700 whitespace-nowrap tabular-nums"
                          >
                            {val !== null
                              ? val.toLocaleString(undefined, { maximumFractionDigits: 1 })
                              : <span className="text-slate-300">—</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
