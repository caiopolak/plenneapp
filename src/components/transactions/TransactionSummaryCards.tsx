import React from "react";
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { TransactionSparkline } from './TransactionSparkline';

type Transaction = {
  type: string;
  amount: number;
  date: string;
};

type Props = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactions?: Transaction[];
  previousIncome?: number;
  previousExpense?: number;
};

export function TransactionSummaryCards({ 
  totalIncome, 
  totalExpense, 
  balance,
  transactions = [],
  previousIncome = 0,
  previousExpense = 0
}: Props) {
  const formatCurrency = (value: number) => 
    value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const incomeChange = previousIncome > 0 
    ? ((totalIncome - previousIncome) / previousIncome) * 100 
    : 0;
  const expenseChange = previousExpense > 0 
    ? ((totalExpense - previousExpense) / previousExpense) * 100 
    : 0;

  const showSparklines = transactions.length > 5;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Receitas */}
      <Card className="bg-[hsl(var(--card-success-bg))] shadow-card border border-[hsl(var(--card-success-border))] card-hover group overflow-hidden">
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
          
          {/* Change indicator */}
          {previousIncome > 0 && (
            <div className={`flex items-center gap-1 text-xs mt-1 ${
              incomeChange >= 0 ? 'text-emerald-600' : 'text-red-500'
            }`}>
              {incomeChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              <span>{incomeChange >= 0 ? '+' : ''}{incomeChange.toFixed(1)}% vs mês anterior</span>
            </div>
          )}
          
          {/* Sparkline */}
          {showSparklines && (
            <div className="mt-3 -mx-2 -mb-2">
              <TransactionSparkline 
                transactions={transactions} 
                type="income" 
                height={35}
                color="hsl(142, 71%, 45%)"
              />
            </div>
          )}
          
          {!showSparklines && (
            <p className="text-xs text-[hsl(var(--card-success-text))]/70 mt-1 hidden sm:block">
              Total de entradas no período
            </p>
          )}
        </CardContent>
      </Card>

      {/* Despesas */}
      <Card className="bg-[hsl(var(--card-error-bg))] shadow-card border border-[hsl(var(--card-error-border))] card-hover group overflow-hidden">
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
          
          {/* Change indicator */}
          {previousExpense > 0 && (
            <div className={`flex items-center gap-1 text-xs mt-1 ${
              expenseChange <= 0 ? 'text-emerald-600' : 'text-red-500'
            }`}>
              {expenseChange <= 0 ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
              <span>{expenseChange >= 0 ? '+' : ''}{expenseChange.toFixed(1)}% vs mês anterior</span>
            </div>
          )}
          
          {/* Sparkline */}
          {showSparklines && (
            <div className="mt-3 -mx-2 -mb-2">
              <TransactionSparkline 
                transactions={transactions} 
                type="expense" 
                height={35}
                color="hsl(0, 84%, 60%)"
              />
            </div>
          )}
          
          {!showSparklines && (
            <p className="text-xs text-[hsl(var(--card-error-text))]/70 mt-1 hidden sm:block">
              Total de saídas no período
            </p>
          )}
        </CardContent>
      </Card>

      {/* Saldo */}
      <Card className={`shadow-card border card-hover group sm:col-span-2 lg:col-span-1 overflow-hidden ${
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
          
          {/* Sparkline */}
          {showSparklines && (
            <div className="mt-3 -mx-2 -mb-2">
              <TransactionSparkline 
                transactions={transactions} 
                type="balance" 
                height={35}
                color={balance >= 0 ? 'hsl(217, 91%, 60%)' : 'hsl(38, 92%, 50%)'}
              />
            </div>
          )}
          
          {!showSparklines && (
            <p className={`text-xs mt-1 hidden sm:block ${
              balance >= 0 ? 'text-[hsl(var(--card-info-text))]/70' : 'text-[hsl(var(--card-warning-text))]/70'
            }`}>
              {balance >= 0 ? 'Você está no azul! 🎉' : 'Atenção: saldo negativo'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
