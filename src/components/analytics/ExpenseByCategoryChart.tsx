
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
    <Card className="shadow rounded-xl border-0 bg-gradient-to-br from-red-50 to-white/80">
      <CardHeader>
        <CardTitle className="flex gap-2 items-center text-red-700">
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
                fill="#d62828"
                dataKey="value"
              >
                {data.map((entry, idx) => (
                  <Cell key={`cell-expense-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `R$ ${Number(value).toFixed(2)}`} />
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
