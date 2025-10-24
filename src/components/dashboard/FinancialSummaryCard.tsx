import React from "react";

interface FinancialSummaryCardProps {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  totalInvestments: number;
  monthlyTransactions: number;
}

export const FinancialSummaryCard: React.FC<FinancialSummaryCardProps> = ({
  balance,
  totalIncome,
  totalExpense,
  totalInvestments,
  monthlyTransactions,
}) => {
  return (
    <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
      {/* Saldo */}
      <div className="bg-gradient-to-br from-primary to-secondary/60 rounded-xl px-5 py-4 flex flex-col items-center shadow hover:scale-[1.03] transition-transform border-primary/10 border">
        <div className="flex items-center gap-2">
          {balance >= 0 ? (
            <span className="text-green-600 bg-green-50 dark:bg-green-900/30 rounded-full p-2">
              <svg width="28" height="28"><g><circle cx="14" cy="14" r="12" fill="#A9FFD5"/><text x="14" y="20" fontSize="18" textAnchor="middle" fill="#2f9e44">↑</text></g></svg>
            </span>
          ) : (
            <span className="text-red-600 bg-red-50 dark:bg-red-900/30 rounded-full p-2">
              <svg width="28" height="28"><g><circle cx="14" cy="14" r="12" fill="#fee2e2"/><text x="14" y="20" fontSize="18" textAnchor="middle" fill="#d62828">↓</text></g></svg>
            </span>
          )}
          <span className="text-xs text-primary-foreground font-highlight">Saldo</span>
        </div>
        <div className={`text-xl font-extrabold font-display ${balance >= 0 ? 'text-primary-foreground' : 'text-red-100'}`}>
          R$ {Math.abs(balance).toFixed(2).replace('.', ',')}
        </div>
        <div className="text-xs text-primary-foreground/80 mt-1">{balance >= 0 ? 'Positivo' : 'Negativo'} este mês</div>
      </div>

      {/* Receitas */}
      <div className="bg-card rounded-xl px-5 py-4 flex flex-col items-center shadow hover:scale-[1.03] transition-transform border-secondary/10 border">
        <div className="flex items-center gap-2">
          <span className="bg-green-100 dark:bg-green-900/30 text-secondary rounded-full p-2">R$</span>
          <span className="text-xs text-foreground font-highlight">Receitas</span>
        </div>
        <div className="text-xl font-bold text-secondary font-display">
          R$ {totalIncome.toFixed(2).replace('.', ',')}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {monthlyTransactions} transações
        </div>
      </div>

      {/* Despesas */}
      <div className="bg-card rounded-xl px-5 py-4 flex flex-col items-center shadow hover:scale-[1.03] transition-transform border-primary/10 border">
        <div className="flex items-center gap-2">
          <span className="bg-red-100 dark:bg-red-900/30 text-destructive rounded-full p-2">R$</span>
          <span className="text-xs text-destructive font-highlight">Despesas</span>
        </div>
        <div className="text-xl font-bold text-destructive font-display">
          R$ {totalExpense.toFixed(2).replace('.', ',')}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Este mês
        </div>
      </div>

      {/* Investido */}
      <div className="bg-card rounded-xl px-5 py-4 flex flex-col items-center shadow hover:scale-[1.03] transition-transform border-primary/10 border">
        <div className="flex items-center gap-2">
          <span className="bg-blue-100 dark:bg-blue-900/30 text-primary rounded-full p-2">💰</span>
          <span className="text-xs text-foreground font-highlight">Investido</span>
        </div>
        <div className="text-xl font-bold text-primary font-display">
          R$ {totalInvestments.toFixed(2).replace('.', ',')}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Total investido
        </div>
      </div>
    </div>
  );
}
