
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useBudgets } from "@/hooks/useBudgets";

export function BudgetAlerts() {
  const { budgets, loading } = useBudgets();
  
  if (loading) return null;

  const alertBudgets = budgets.filter(budget => budget.percentage >= 80);
  
  if (alertBudgets.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Orçamentos sob Controle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Parabéns! Todos os seus orçamentos estão dentro do limite planejado.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          Alertas de Orçamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alertBudgets.map((budget) => (
          <Alert key={budget.id} className={`border-l-4 ${
            budget.percentage >= 100 
              ? 'border-l-destructive bg-destructive/10' 
              : 'border-l-warning bg-warning/10'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {budget.percentage >= 100 ? (
                  <XCircle className="h-4 w-4 text-red-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                )}
                <div>
                  <p className="font-medium">{budget.category}</p>
                  <AlertDescription className="mt-1">
                    Gasto: R$ {budget.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de R$ {budget.amount_limit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </AlertDescription>
                </div>
              </div>
              <Badge variant={budget.percentage >= 100 ? "destructive" : "secondary"}>
                {budget.percentage.toFixed(1)}%
              </Badge>
            </div>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}
