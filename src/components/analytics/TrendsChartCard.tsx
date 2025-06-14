
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendsChart } from './TrendsChart';

type MonthlyData = { month: string; income: number; expense: number };

export function TrendsChartCard({ data }: { data: MonthlyData[] }) {
  return (
    <Card className="p-4 rounded-xl shadow-lg border-0 bg-gradient-to-br from-[#f8fafc] to-white/70">
      <CardHeader>
        <CardTitle className="text-[--primary] font-bold flex gap-3 items-center">
          📈 Tendência Receitas x Despesas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TrendsChart data={data} />
      </CardContent>
    </Card>
  );
}
