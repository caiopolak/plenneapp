import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PiggyBank, TrendingUp, Wallet } from "lucide-react";
import { BudgetManager } from "./BudgetManager";
import { BudgetAlerts } from "./BudgetAlerts";
import { useBudgets } from "@/hooks/useBudgets";

export function BudgetPageStyled() {
  const { budgets, loading } = useBudgets();

  const totalBudgeted = budgets.reduce((sum, b) => sum + Number(b.amount_limit), 0);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-display brand-gradient-text flex items-center gap-2">
            <PiggyBank className="w-7 h-7 text-primary" />
            Orçamentos
          </h1>
          <p className="text-muted-foreground">
            Controle seus gastos e mantenha suas finanças organizadas
          </p>
        </div>
      </div>

      {/* 1. Alertas de orçamento - Importante no topo */}
      <BudgetAlerts />

      {/* 2. Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Orçado</p>
                <p className="text-2xl font-bold text-foreground">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalBudgeted)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Categorias Ativas</p>
                <p className="text-2xl font-bold text-foreground">{budgets.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-secondary/10">
                <TrendingUp className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Média por Categoria</p>
                <p className="text-2xl font-bold text-foreground">
                  {budgets.length > 0 
                    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalBudgeted / budgets.length)
                    : 'R$ 0,00'
                  }
                </p>
              </div>
              <div className="p-3 rounded-xl bg-accent/10">
                <PiggyBank className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Gerenciador de orçamento */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <BudgetManager />
        </CardContent>
      </Card>
    </div>
  );
}