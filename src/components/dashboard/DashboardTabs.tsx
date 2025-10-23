
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

  return (
    <div>
      {/* Removido o botão 'Exportar Resumo CSV' aqui */}
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="mb-6 shadow-md bg-card/50 hidden md:grid grid-cols-4 rounded-xl px-1 py-[6px]">
          <TabsTrigger 
            value="dashboard" 
            className="flex gap-2 items-center font-display text-primary data-[state=active]:bg-secondary/10 data-[state=active]:text-primary rounded-lg transition-all"
          >
            <Home className="w-5 h-5" /> Dashboard
          </TabsTrigger>
          <TabsTrigger 
            value="transactions" 
            className="flex gap-2 items-center font-display text-primary data-[state=active]:bg-secondary/10 data-[state=active]:text-primary rounded-lg transition-all"
          >
            <BarChart3 className="w-5 h-5" /> Transações
          </TabsTrigger>
          <TabsTrigger 
            value="goals" 
            className="flex gap-2 items-center font-display text-primary data-[state=active]:bg-secondary/10 data-[state=active]:text-primary rounded-lg transition-all"
          >
            <Target className="w-5 h-5" /> Metas
          </TabsTrigger>
          <TabsTrigger 
            value="investments" 
            className="flex gap-2 items-center font-display text-primary data-[state=active]:bg-secondary/10 data-[state=active]:text-primary rounded-lg transition-all"
          >
            <TrendingUp className="w-5 h-5" /> Investimentos
          </TabsTrigger>
          {/* REMOVIDO: Orçamentos */}
        </TabsList>
        <TabsContent value="dashboard" className="animate-fade-in">
          <DashboardMain />
        </TabsContent>
        <TabsContent value="transactions" className="animate-fade-in">
          <TransactionList />
        </TabsContent>
        <TabsContent value="goals" className="animate-fade-in">
          <GoalList />
        </TabsContent>
        <TabsContent value="investments" className="animate-fade-in">
          <InvestmentList />
        </TabsContent>
        {/* REMOVIDO: <TabsContent value="budgets"> */}
      </Tabs>
    </div>
  );
}

