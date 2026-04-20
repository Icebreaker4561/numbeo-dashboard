'use client';

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

interface DataPoint {
  city: string;
  value: number | null;
}

interface CompositeBarChartProps {
  label: string;
  unit: string;
  lowerIsBetter: boolean;
  data: DataPoint[];
  allCityNames: string[];
}

const CustomTooltip = ({
  active,
  payload,
  unit,
  noData,
}: {
  active?: boolean;
  payload?: Array<{ payload: { displayCity: string; value: number | null } }>;
  unit: string;
  noData: string;
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
        <p className="text-slate-400">{noData}</p>
      )}
    </div>
  );
};

export default function CompositeBarChart({
  label,
  unit,
  lowerIsBetter,
  data,
  allCityNames,
}: CompositeBarChartProps) {
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

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4">
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-xs sm:text-sm font-medium text-slate-700 leading-tight flex-1">
          {label}
        </h4>
        {lowerIsBetter && (
          <span className="ml-2 flex-shrink-0 text-xs text-slate-400">↓ лучше</span>
        )}
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
                noData="Нет данных"
              />
            )}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {chartData.map((entry) => {
              const idx = allCityNames.indexOf(entry.fullCity);
              const color =
                entry.value !== null
                  ? getCityColor(idx >= 0 ? idx : 0)
                  : '#e2e8f0';
              return <Cell key={entry.fullCity} fill={color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
