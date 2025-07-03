import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PiggyBank, Plus, AlertTriangle, TrendingUp } from "lucide-react";
import { BudgetManager } from "./BudgetManager";
import { BudgetAlerts } from "./BudgetAlerts";
import { useBudgets } from "@/hooks/useBudgets";

export function BudgetPageStyled() {
  const { budgets, loading } = useBudgets();

  if (loading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight brand-gradient-text flex items-center gap-2">
            <PiggyBank className="w-8 h-8 text-[#2f9e44]" />
            Orçamentos
          </h1>
          <p className="text-muted-foreground">
            Controle seus gastos e mantenha suas finanças organizadas
          </p>
        </div>
      </div>

      {/* Grid principal */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Gerenciador de orçamento */}
        <div className="lg:col-span-3">
          <Card className="bg-gradient-to-br from-white to-[#eaf6ee]/30 border-[#2f9e44]/20 shadow-lg">
            <CardContent className="p-6">
              <BudgetManager />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-[#003f5c] to-[#2f9e44] text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total Orçado</p>
                <p className="text-2xl font-bold">
                  R$ {budgets.reduce((sum, b) => sum + Number(b.amount_limit), 0).toFixed(2)}
                </p>
              </div>
              <PiggyBank className="w-10 h-10 text-white/80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#2f9e44] to-[#f8961e] text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Categorias Ativas</p>
                <p className="text-2xl font-bold">{budgets.length}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-white/80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#f8961e] to-[#003f5c] text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Economia Potencial</p>
                <p className="text-2xl font-bold">R$ 450,00</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-white/80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de orçamento */}
      <BudgetAlerts />
    </div>
  );
}