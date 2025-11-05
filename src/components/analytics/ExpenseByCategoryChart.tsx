
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#003f5c', '#2f9e44', '#f8961e', '#d62828', '#6f42c1', '#20c997'];

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export function ExpenseByCategoryChart({ data }: { data: ChartData[] }) {
  return (
    <Card className="shadow-card rounded-xl border border-border bg-card">
      <CardHeader>
        <CardTitle className="flex gap-2 items-center text-foreground">
          💸 Despesas por Categoria
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={90}
                fill="hsl(var(--destructive))"
                dataKey="value"
                stroke="hsl(var(--card))"
              >
                {data.map((entry, idx) => (
                  <Cell key={`cell-expense-${idx}`} fill={COLORS[idx % COLORS.length]} stroke="hsl(var(--card))" />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => `R$ ${Number(value).toFixed(2)}`}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[220px] flex items-center justify-center text-muted-foreground">
            Nenhuma despesa no período selecionado
          </div>
        )}
      </CardContent>
    </Card>
  );
}
