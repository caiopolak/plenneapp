import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

interface TrendsChartProps {
  data: { month: string; income: number; expense: number }[];
}

const currencyFormat = (value: number) =>
  `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<any>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white/95 px-3 py-2 shadow-xl backdrop-blur-md font-poppins animate-fade-in">
        <div className="text-xs text-muted-foreground mb-1">Mês: <span className="font-bold text-gray-900">{label}</span></div>
        {payload.map((entry, i) => (
          <div key={entry.dataKey} className="flex items-center gap-2 my-1">
            <span
              className="inline-block rounded-full"
              style={{
                background: entry.color,
                width: 12,
                height: 12,
              }}
            />
            <span className="font-semibold">{entry.name}:</span>
            <span className="ml-1 font-mono">{currencyFormat(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CustomLegend = (props: any) => {
  const { payload } = props;
  return (
    <div className="flex gap-7 text-base font-poppins mt-2">
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-1">
          <span
            className="inline-block rounded-full"
            style={{ width: 12, height: 12, background: entry.color }}
          />
          <span className="font-semibold">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function TrendsChart({ data }: TrendsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="incomeColor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2f9e44" stopOpacity={0.85} />
            <stop offset="95%" stopColor="#2f9e44" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="expenseColor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#d62828" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#d62828" stopOpacity={0.08} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 5" className="opacity-70" />
        <XAxis
          dataKey="month"
          tick={{ fontFamily: "Inter, Poppins, sans-serif", fontSize: 13, fill: "#64748b" }}
        />
        <YAxis
          tickFormatter={currencyFormat}
          tick={{ fontFamily: "Inter, Poppins, sans-serif", fontSize: 13, fill: "#64748b" }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} iconType="circle" />
        <Area
          type="monotone"
          dataKey="income"
          name="Receitas"
          stroke="#2f9e44"
          fill="url(#incomeColor)"
          fillOpacity={1}
          strokeWidth={3}
          activeDot={{ r: 7 }}
          dot={{ r: 5, fill: "#2f9e44", stroke: "#fff", strokeWidth: 2 }}
          isAnimationActive
        />
        <Area
          type="monotone"
          dataKey="expense"
          name="Despesas"
          stroke="#d62828"
          fill="url(#expenseColor)"
          fillOpacity={1}
          strokeWidth={3}
          activeDot={{ r: 7 }}
          dot={{ r: 5, fill: "#d62828", stroke: "#fff", strokeWidth: 2 }}
          isAnimationActive
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
