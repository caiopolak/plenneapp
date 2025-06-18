
import React, { useState, useEffect } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LogoPlenne } from '../components/layout/LogoPlenne';
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { AnalyticsOverview } from "@/components/dashboard/AnalyticsOverview";
import { FinancialCharts } from "@/components/analytics/FinancialCharts";
import { TransactionList } from '@/components/transactions/TransactionList';
import { GoalList } from '@/components/goals/GoalList';
import { InvestmentList } from '@/components/investments/InvestmentList';
import { SubscriptionPlans } from "@/components/subscription/SubscriptionPlans";
import Education from './Education';
import AssistantPage from './AssistantPage';
import SettingsPage from './SettingsPage';
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { QuickNotifications } from "@/components/dashboard/QuickNotifications";
// FIXED imports below — use default import, not named
import ProfilePage from "./ProfilePage";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendsChartCard } from "@/components/analytics/TrendsChartCard";
import { ExpenseByCategoryChart } from "@/components/analytics/ExpenseByCategoryChart";
import { supabase } from "@/integrations/supabase/client";
import { WorkspaceManager } from "@/components/workspaces/WorkspaceManager";
import BudgetPage from "./BudgetPage";

// Define types for chart data
type MonthlyData = { month: string; income: number; expense: number };
type ExpenseCategoryData = { name: string; value: number; color?: string };

export default function FinancieApp() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { signOut } = useAuth();
  const { profile, subscription } = useProfile();

  // Abre modal de nova transação
  const handleAddTransaction = () => {
    setActiveTab("transactions");
    // Ideal: abrir modal, aqui apenas navega para tab para exemplo compatível
  };

  // Custom hooks para gráficos
  const { user } = useAuth();
  const [trendData, setTrendData] = useState<MonthlyData[]>([]);
  const [expenseByCategoryData, setExpenseByCategoryData] = useState<ExpenseCategoryData[]>([]);
  const [loadingGraphs, setLoadingGraphs] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function fetchGraphs() {
      setLoadingGraphs(true);
      try {
        // Gráfico linha: Receitas vs Despesas últimos 6 meses
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(endDate.getMonth() - 5);
        const { data: transactions } = await supabase
          .from('transactions')
          .select('amount, type, date, category')
          .eq('user_id', user.id)
          .gte('date', startDate.toISOString().split('T')[0])
          .lte('date', endDate.toISOString().split('T')[0]);

        type Transaction = { amount: number; type: string; date: string; category: string };

        // Formatar dados para gráfico de tendência
        const monthMap: { [key: string]: { income: number; expense: number; month: string } } = {};
        (transactions as Transaction[] | null)?.forEach((tx) => {
          const month = tx.date.substring(0, 7);
          if (!monthMap[month]) monthMap[month] = { income: 0, expense: 0, month };
          if (tx.type === "income") monthMap[month].income += Number(tx.amount);
          if (tx.type === "expense") monthMap[month].expense += Number(tx.amount);
        });
        const trend: MonthlyData[] = Object.values(monthMap)
          .sort((a, b) => a.month.localeCompare(b.month))
          .map(d => ({
            month: new Date(d.month + "-01").toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
            income: d.income,
            expense: d.expense
          }));
        setTrendData(trend);

        // Gráfico pizza: despesas por categoria no mês atual
        const current = new Date();
        const mStart = new Date(current.getFullYear(), current.getMonth(), 1);
        const mEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
        const expenseCats: { [cat: string]: number } = {};
        (transactions as Transaction[] | null)?.filter(tx =>
          tx.type === "expense" &&
          new Date(tx.date) >= mStart &&
          new Date(tx.date) <= mEnd
        ).forEach(tx => {
          expenseCats[tx.category] = (expenseCats[tx.category] || 0) + Number(tx.amount);
        });
        const COLORS = ['#003f5c', '#2f9e44', '#f8961e', '#d62828', '#6f42c1', '#20c997'];
        const expCatData: ExpenseCategoryData[] = Object.entries(expenseCats).map(([name, value], i) => ({
          name, value, color: COLORS[i % COLORS.length]
        }));
        setExpenseByCategoryData(expCatData);

      } catch (e) {
        setTrendData([]);
        setExpenseByCategoryData([]);
      }
      setLoadingGraphs(false);
    }
    fetchGraphs();
  }, [user]);

  return (
      <WorkspaceProvider>
        <SidebarProvider>
          <div className="flex min-h-screen w-full bg-gradient-to-br from-background to-neutral-light relative">
            <AppSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden relative">
              {/* Remoção total do cabeçalho */}
              {/* Main Content */}
              <section className="flex-1 w-full px-2 sm:px-4 md:px-10 pt-6 pb-10 bg-gradient-to-br from-background/80 to-neutral-light/70 min-h-[calc(100vh-56px)] sm:min-h-[calc(100vh-80px)] transition-padding">
                <div className="max-w-[1320px] mx-auto w-full">
                  {/* DASHBOARD */}
                  {activeTab === "dashboard" && (
                    <div className="space-y-6 animate-fade-in">
                      {/* Dicas e alertas primeiro */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      </div>
                      {/* Tabs Transações, Metas, Investimentos */}
                      <div className="mt-0">
                        <DashboardTabs />
                      </div>
                    </div>
                  )}
                  
                  {/* PERFIL */}
                  {activeTab === "profile" && (
                    <div className="animate-fade-in">
                      <ProfilePage />
                    </div>
                  )}
                  
                  {/* WORKSPACES */}
                  {activeTab === "workspaces" && (
                    <div className="animate-fade-in">
                      <WorkspaceManager />
                    </div>
                  )}
                  
                  {/* ORÇAMENTOS */}
                  {activeTab === "budgets" && (
                    <div className="animate-fade-in">
                      <BudgetPage />
                    </div>
                  )}
                  
                  {/* ANÁLISES */}
                  {activeTab === "analytics" && (
                    <div className="animate-fade-in">
                      <h1 className="font-display text-4xl brand-gradient-text mb-8">Análises Detalhadas</h1>
                      <FinancialCharts />
                    </div>
                  )}
                  
                  {/* EDUCAÇÃO */}
                  {activeTab === "education" && (
                    <div className="animate-fade-in">
                      <h1 className="font-display text-4xl text-secondary mb-8">Educação Financeira</h1>
                      <Education />
                    </div>
                  )}
                  
                  {/* ASSISTENTE - NOVA ÁREA CONSOLIDADA */}
                  {activeTab === "assistant" && (
                    <div className="animate-fade-in">
                      <AssistantPage />
                    </div>
                  )}
                  
                  {/* ASSINATURA */}
                  {activeTab === "subscription" && (
                    <div className="animate-fade-in">
                      <h1 className="font-display text-4xl text-attention mb-8">Sua Assinatura</h1>
                      <SubscriptionPlans />
                    </div>
                  )}
                  
                  {/* CONFIGURAÇÕES - NOVA PÁGINA */}
                  {activeTab === "settings" && (
                    <div className="animate-fade-in">
                      <SettingsPage />
                    </div>
                  )}
                </div>
              </section>
            </main>
          </div>
          {/* Fundo decorativo suave */}
          <div className="fixed left-[-40px] top-[-90px] w-[360px] h-[360px] bg-gradient-to-tr from-primary/10 via-secondary/20 to-attention/10 rounded-full blur-3xl z-0 pointer-events-none" />
          <div className="fixed bottom-[-90px] right-[-80px] w-[420px] h-[420px] bg-gradient-to-bl from-secondary/10 via-primary/10 to-attention/10 rounded-full blur-3xl z-0 pointer-events-none" />
        </SidebarProvider>
      </WorkspaceProvider>
  );
}
