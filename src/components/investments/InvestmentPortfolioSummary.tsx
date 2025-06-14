
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface Investment {
  id: string;
  name: string;
  type: string;
  amount: number;
  expected_return?: number;
  purchase_date: string;
}

interface InvestmentPortfolioSummaryProps {
  investments: Investment[];
}

function getTopPositions(investments: Investment[], topN: number = 3) {
  return [...investments]
    .sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0))
    .slice(0, topN);
}

function getInvestedByMonth(investments: Investment[]) {
  // Agrupa por MM/YYYY da purchase_date
  const map: { [key: string]: number } = {};
  investments.forEach(inv => {
    const date = new Date(inv.purchase_date);
    if (isNaN(date.getTime())) return;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    map[key] = (map[key] || 0) + Number(inv.amount || 0);
  });
  const arr = Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, value]) => ({
      month: month.split("-").reverse().join("/"), // MM/YYYY
      value,
    }));
  return arr;
}

export function InvestmentPortfolioSummary({ investments }: InvestmentPortfolioSummaryProps) {
  if (!investments.length) return null;

  const topPositions = getTopPositions(investments, 3);
  const investedByMonth = getInvestedByMonth(investments);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Maiores posições */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Top 3 Maiores Posições</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {topPositions.map((inv, i) => (
            <div key={inv.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition">
              <span className="font-medium">{i+1}º {inv.name}</span>
              <span className="font-bold text-blue-700">R$ {inv.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            </div>
          ))}
          {topPositions.length === 0 && (
            <div className="text-sm text-muted-foreground">Nenhum investimento</div>
          )}
        </CardContent>
      </Card>
      {/* Evolução dos investimentos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Aporte Total por Mês</CardTitle>
        </CardHeader>
        <CardContent className="pb-3">
          {investedByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={investedByMonth}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }}/>
                <YAxis tickFormatter={val => `R$ ${val}`} width={60} fontSize={12} />
                <Tooltip formatter={(val: number) => `R$ ${val.toLocaleString("pt-BR",{minimumFractionDigits:2})}`} />
                <Bar dataKey="value" fill="#2f9e44" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-sm text-muted-foreground py-7 text-center">Sem dados suficientes</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
