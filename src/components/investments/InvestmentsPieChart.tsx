
import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Investment {
  id: string;
  name: string;
  type: string;
  amount: number;
}

interface InvestmentsPieChartProps {
  investments: Investment[];
}

const COLORS: string[] = [
  "#0066CC", // actions
  "#36C486", // bonds
  "#F59E42", // crypto
  "#F44336", // real estate
  "#7758D1", // funds
  "#94A3B8", // savings
  "#A3A3A3"  // Default
];

const TYPE_LABELS: Record<string, string> = {
  stocks: "Ações",
  bonds: "Títulos",
  crypto: "Criptomoedas",
  real_estate: "Imóveis",
  funds: "Fundos",
  savings: "Poupança",
};

function extractData(investments: Investment[]) {
  const aggregated: Record<string, number> = {};
  investments.forEach(inv => {
    aggregated[inv.type] = (aggregated[inv.type] || 0) + Number(inv.amount || 0);
  });
  return Object.entries(aggregated).map(([type, amount], i) => ({
    name: TYPE_LABELS[type] || type,
    value: Number(amount),
    color: COLORS[i % COLORS.length],
  }));
}

export function InvestmentsPieChart({ investments }: InvestmentsPieChartProps) {
  const data = extractData(investments);
  if (!investments.length || data.every(d => d.value === 0)) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Distribuição por Tipo de Investimento</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={75}
              innerRadius={40}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
              {data.map((entry, i) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(val: number) => `R$ ${val.toLocaleString("pt-BR", {minimumFractionDigits: 2})}`} />
            <Legend verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
