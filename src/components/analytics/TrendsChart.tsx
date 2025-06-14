
import React from "react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

interface TrendsChartProps {
  data: { month: string; income: number; expense: number }[];
}

export function TrendsChart({ data }: TrendsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(value) => `R$ ${value.toLocaleString()}`} />
        <Tooltip 
          formatter={(value: number) => [`R$ ${Number(value).toFixed(2)}`, '']}
          labelFormatter={(label) => `Mês: ${label}`}
          wrapperStyle={{ fontFamily: 'Inter, Poppins, sans-serif', fontSize: 14 }}
        />
        <Line
          type="monotone"
          dataKey="income"
          stroke="#2f9e44"
          strokeWidth={3}
          name="Receitas"
          dot={{ r: 5, fill: "#2f9e44", stroke: "#fff" }}
          activeDot={{ r: 7 }}
        />
        <Line
          type="monotone"
          dataKey="expense"
          stroke="#d62828"
          strokeWidth={3}
          name="Despesas"
          dot={{ r: 5, fill: "#d62828", stroke: "#fff" }}
          activeDot={{ r: 7 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
