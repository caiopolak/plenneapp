import React from "react";
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

type Props = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
};

export function TransactionSummaryCards({ totalIncome, totalExpense, balance }: Props) {
  const formatCurrency = (value: number) => 
    value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Receitas */}
      <Card className="bg-[hsl(var(--card-success-bg))] shadow-card border border-[hsl(var(--card-success-border))] card-hover group">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[hsl(var(--card-success-text))] font-text">Receitas</span>
            <div className="p-2 rounded-full bg-[hsl(var(--card-success-accent))]/10 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[hsl(var(--card-success-accent))]" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[hsl(var(--card-success-accent))] font-display truncate">
            R$ {formatCurrency(totalIncome)}
          </div>
          <p className="text-xs text-[hsl(var(--card-success-text))]/70 mt-1 hidden sm:block">
            Total de entradas no período
          </p>
        </CardContent>
      </Card>

      {/* Despesas */}
      <Card className="bg-[hsl(var(--card-error-bg))] shadow-card border border-[hsl(var(--card-error-border))] card-hover group">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[hsl(var(--card-error-text))] font-text">Despesas</span>
            <div className="p-2 rounded-full bg-[hsl(var(--card-error-accent))]/10 group-hover:scale-110 transition-transform">
              <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-[hsl(var(--card-error-accent))]" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[hsl(var(--card-error-accent))] font-display truncate">
            R$ {formatCurrency(totalExpense)}
          </div>
          <p className="text-xs text-[hsl(var(--card-error-text))]/70 mt-1 hidden sm:block">
            Total de saídas no período
          </p>
        </CardContent>
      </Card>

      {/* Saldo */}
      <Card className={`shadow-card border card-hover group sm:col-span-2 lg:col-span-1 ${
        balance >= 0 
          ? 'bg-[hsl(var(--card-info-bg))] border-[hsl(var(--card-info-border))]' 
          : 'bg-[hsl(var(--card-warning-bg))] border-[hsl(var(--card-warning-border))]'
      }`}>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium font-text ${
              balance >= 0 ? 'text-[hsl(var(--card-info-text))]' : 'text-[hsl(var(--card-warning-text))]'
            }`}>
              Saldo
            </span>
            <div className={`p-2 rounded-full group-hover:scale-110 transition-transform ${
              balance >= 0 ? 'bg-[hsl(var(--card-info-accent))]/10' : 'bg-[hsl(var(--card-warning-accent))]/10'
            }`}>
              <Wallet className={`w-4 h-4 sm:w-5 sm:h-5 ${
                balance >= 0 ? 'text-[hsl(var(--card-info-accent))]' : 'text-[hsl(var(--card-warning-accent))]'
              }`} />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl lg:text-3xl font-bold font-display truncate ${
            balance >= 0 ? 'text-[hsl(var(--card-info-accent))]' : 'text-[hsl(var(--card-warning-accent))]'
          }`}>
            R$ {formatCurrency(balance)}
          </div>
          <p className={`text-xs mt-1 hidden sm:block ${
            balance >= 0 ? 'text-[hsl(var(--card-info-text))]/70' : 'text-[hsl(var(--card-warning-text))]/70'
          }`}>
            {balance >= 0 ? 'Você está no azul! 🎉' : 'Atenção: saldo negativo'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
