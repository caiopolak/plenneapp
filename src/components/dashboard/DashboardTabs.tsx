
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TransactionList } from "@/components/transactions/TransactionList";
import { GoalList } from "@/components/goals/GoalList";
import { InvestmentList } from "@/components/investments/InvestmentList";
import { DashboardMain } from "./DashboardMain";
import { BarChart3, Target, TrendingUp, Home } from "lucide-react";
// Removendo import do orçamento
// import { BudgetList } from "@/components/budget/BudgetList"; // REMOVIDO

export function DashboardTabs() {
  const [tab, setTab] = useState("dashboard");

  // Função de exportação simples: exporta saldo, receitas, despesas, e totais dos últimos 6 meses (mock)
  const handleExportResumo = () => {
    const resumo = [
      ['Seção', 'Valor'],
      ['Saldo', 'Veja detalhes nas abas abaixo'],
      ['Resumo', 'Exportação manual - ajuste conforme seu cenário'],
      ['Data', new Date().toLocaleDateString('pt-BR')],
    ];
    const csvContent = resumo.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resumo_dashboard_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Removido botão "Exportar Resumo CSV" pois funções individuais já existem nas abas

  // Agora renderiza apenas o DashboardMain, sem as abas de navegação
  return (
    <div>
      <DashboardMain />
    </div>
  );
}

