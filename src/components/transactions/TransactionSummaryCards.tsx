
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
      <Card className="bg-white shadow-card border border-[--primary]/10">
        <CardContent className="p-4">
          <div className="text-sm text-[--primary] font-text">Receitas</div>
          <div className="text-2xl font-bold text-[--secondary] font-display">
            R$ {totalIncome.toFixed(2).replace('.', ',')}
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white shadow-card border border-[--primary]/10">
        <CardContent className="p-4">
          <div className="text-sm text-[--primary] font-text">Despesas</div>
          <div className="text-2xl font-bold text-[--error] font-display">
            R$ {totalExpense.toFixed(2).replace('.', ',')}
          </div>
        </CardContent>
      </Card>
      <Card className="bg-[#eaf6ee]/80 shadow-card border border-[--primary]/10">
        <CardContent className="p-4">
          <div className="text-sm text-[--primary] font-text">Saldo</div>
          <div className={`text-2xl font-bold font-display ${balance >= 0 ? 'text-[--secondary]' : 'text-[--error]'}`}>
            R$ {balance.toFixed(2).replace('.', ',')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
