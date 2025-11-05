
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
    <div className="w-full h-[320px] px-2 py-2 rounded-2xl bg-card shadow-card border border-border animate-fade-in">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 13, fill: "hsl(var(--muted-foreground))" }} stroke="hsl(var(--muted-foreground))" />
          <YAxis
            tick={{ fontSize: 13, fill: "hsl(var(--muted-foreground))" }}
            tickFormatter={currencyFormat}
            stroke="hsl(var(--muted-foreground))"
          />
          <Tooltip
            formatter={(value: number) => currencyFormat(value)}
            labelFormatter={(label: string) => `Mês: ${label}`}
            contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: 8, border: "1.5px solid hsl(var(--border))", fontFamily: "Poppins, Inter, sans-serif" }}
            wrapperClassName="!text-xs"
          />
          <Legend iconType="circle" />
          <Bar dataKey="income" name="Receitas" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name="Despesas" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
