
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export function CategoryComparisonChart({
  data,
}: {
  data: ChartData[];
}) {
  return (
    <Card className="shadow rounded-xl border-0 bg-gradient-to-r from-yellow-50 via-blue-50 to-green-50">
      <CardHeader>
        <CardTitle className="flex gap-2 items-center text-blue-900">
          📊 Comparativo Geral por Categoria
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="2 2" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(v) => `R$ ${v.toLocaleString()}`} />
            <Tooltip formatter={(value: number) => `R$ ${Number(value).toFixed(2)}`} />
            <Bar dataKey="value" fill="#003f5c" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
