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
import { getCityColor } from '@/lib/dataUtils';

interface DataPoint {
  city: string;
  value: number | null;
}

interface MetricBarChartProps {
  metric: string;
  data: DataPoint[];
  unit?: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: DataPoint }>;
  label?: string;
  unit?: string;
}) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-md px-3 py-2 text-sm">
        <p className="font-semibold text-slate-800">{label}</p>
        <p className="text-slate-600">
          {val != null ? val.toLocaleString(undefined, { maximumFractionDigits: 2 }) : 'N/A'}
          {unit ? ` ${unit}` : ''}
        </p>
      </div>
    );
  }
  return null;
};

export default function MetricBarChart({ metric, data, unit }: MetricBarChartProps) {
  const filtered = data.filter((d) => d.value !== null);
  if (filtered.length === 0) return null;

  // Determine all cities order from original data (to keep color indices stable)
  const allCityNames = data.map((d) => d.city);

  const chartData = filtered.map((d) => ({
    city: d.city.length > 10 ? d.city.slice(0, 10) + '…' : d.city,
    fullCity: d.city,
    value: d.value as number,
  }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4">
      <h4 className="text-xs sm:text-sm font-medium text-slate-700 mb-3 leading-tight">
        {metric}
      </h4>
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
            tickFormatter={(v: number) =>
              v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toLocaleString(undefined, { maximumFractionDigits: 1 })
            }
          />
          <Tooltip
            content={(props) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const pl = props.payload as any;
              return (
                <CustomTooltip
                  active={props.active}
                  payload={pl}
                  label={
                    pl && pl[0]
                      ? (pl[0].payload as { fullCity: string }).fullCity
                      : (props.label as string)
                  }
                  unit={unit}
                />
              );
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {chartData.map((entry) => {
              const idx = allCityNames.indexOf(entry.fullCity);
              return (
                <Cell
                  key={entry.fullCity}
                  fill={getCityColor(idx >= 0 ? idx : 0)}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
