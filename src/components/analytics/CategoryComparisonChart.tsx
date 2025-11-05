
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
    <Card className="shadow-card rounded-xl border border-border bg-card">
      <CardHeader>
        <CardTitle className="flex gap-2 items-center text-foreground">
          📊 Comparativo Geral por Categoria
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="2 2" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
            <YAxis tickFormatter={(v) => `R$ ${v.toLocaleString()}`} stroke="hsl(var(--muted-foreground))" />
            <Tooltip 
              formatter={(value: number) => `R$ ${Number(value).toFixed(2)}`}
              contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
            />
            <Bar dataKey="value" fill="hsl(var(--primary))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
