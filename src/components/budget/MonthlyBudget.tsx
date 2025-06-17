
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useBudgets } from "@/hooks/useBudgets";

export function MonthlyBudget() {
  const { budgets, loading } = useBudgets();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Orçamento do Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (budgets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Orçamento do Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Nenhum orçamento definido para este mês</p>
        </CardContent>
      </Card>
    );
  }

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount_limit, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const totalPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const getStatusColor = () => {
    if (totalPercentage >= 100) return "text-red-600";
    if (totalPercentage >= 80) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orçamento do Mês</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Gasto</span>
            <span className={`font-semibold ${getStatusColor()}`}>
              R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Orçamento Total</span>
            <span className="font-semibold">
              R$ {totalBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Progresso</span>
              <span className={`text-sm font-medium ${getStatusColor()}`}>
                {totalPercentage.toFixed(1)}%
              </span>
            </div>
            <Progress value={Math.min(totalPercentage, 100)} className="h-2" />
          </div>
          <div className="text-xs text-gray-500">
            {budgets.length} categoria{budgets.length !== 1 ? 's' : ''} com orçamento definido
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
