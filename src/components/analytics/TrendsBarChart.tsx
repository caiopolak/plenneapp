
import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

type MonthlyData = { month: string; income: number; expense: number };

interface TrendsBarChartProps {
  data: MonthlyData[];
}

const currencyFormat = (value: number) =>
  `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

export function TrendsBarChart({ data }: TrendsBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-muted-foreground">
        Sem dados para exibir neste período.
      </div>
    );
  }

  return (
    <div className="w-full h-[320px] px-2 py-2 rounded-2xl bg-card/80 shadow border border-border animate-fade-in">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 13, fill: "#64748b" }} />
          <YAxis
            tick={{ fontSize: 13, fill: "#64748b" }}
            tickFormatter={currencyFormat}
          />
          <Tooltip
            formatter={(value: number) => currencyFormat(value)}
            labelFormatter={(label: string) => `Mês: ${label}`}
            contentStyle={{ backgroundColor: "#fff", borderRadius: 8, border: "1.5px solid #e5e7eb", fontFamily: "Poppins, Inter, sans-serif" }}
            wrapperClassName="!text-xs"
          />
          <Legend iconType="circle" />
          <Bar dataKey="income" name="Receitas" fill="#2f9e44" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name="Despesas" fill="#d62828" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
