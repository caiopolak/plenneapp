
import React from "react";
import { Card, CardContent } from '@/components/ui/card';

type Props = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
};

export function TransactionSummaryCards({ totalIncome, totalExpense, balance }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-[hsl(var(--card-success-bg))] shadow-card border border-[hsl(var(--card-success-border))]">
        <CardContent className="p-4">
          <div className="text-sm text-[hsl(var(--card-success-text))] font-text">Receitas</div>
          <div className="text-2xl font-bold text-[hsl(var(--card-success-accent))] font-display">
            R$ {totalIncome.toFixed(2).replace('.', ',')}
          </div>
        </CardContent>
      </Card>
      <Card className="bg-[hsl(var(--card-error-bg))] shadow-card border border-[hsl(var(--card-error-border))]">
        <CardContent className="p-4">
          <div className="text-sm text-[hsl(var(--card-error-text))] font-text">Despesas</div>
          <div className="text-2xl font-bold text-[hsl(var(--card-error-accent))] font-display">
            R$ {totalExpense.toFixed(2).replace('.', ',')}
          </div>
        </CardContent>
      </Card>
      <Card className={`shadow-card border ${balance >= 0 ? 'bg-[hsl(var(--card-info-bg))] border-[hsl(var(--card-info-border))]' : 'bg-[hsl(var(--card-warning-bg))] border-[hsl(var(--card-warning-border))]'}`}>
        <CardContent className="p-4">
          <div className={`text-sm font-text ${balance >= 0 ? 'text-[hsl(var(--card-info-text))]' : 'text-[hsl(var(--card-warning-text))]'}`}>Saldo</div>
          <div className={`text-2xl font-bold font-display ${balance >= 0 ? 'text-[hsl(var(--card-info-accent))]' : 'text-[hsl(var(--card-warning-accent))]'}`}>
            R$ {balance.toFixed(2).replace('.', ',')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
