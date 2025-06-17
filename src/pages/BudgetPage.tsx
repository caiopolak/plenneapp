
import React from "react";
import { BudgetManager } from "@/components/budget/BudgetManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BudgetPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Orçamentos</h1>
        <p className="text-muted-foreground">
          Gerencie seus orçamentos mensais e acompanhe seus gastos por categoria
        </p>
      </div>
      
      <BudgetManager />
    </div>
  );
}
