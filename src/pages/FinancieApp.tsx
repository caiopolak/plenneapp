
import React, { useState } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
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
import { SubscriptionPlans } from '@/components/subscription/SubscriptionPlans';
import { WhatsAppIntegration } from "@/components/whatsapp/WhatsAppIntegration";
import Education from './Education';
import { DashboardQuickActions } from "@/components/dashboard/DashboardQuickActions";

export default function FinancieApp() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { signOut } = useAuth();
  const { profile, subscription } = useProfile();

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background relative">
          <AppSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between items-center px-4 md:px-8 py-4 border-b border-border/80 z-30 bg-surface/80 backdrop-blur-lg shadow-neon gap-4 sticky top-0">
              <div className="flex items-center gap-4">
                <LogoPlenne showSymbol={false} />
                <h1 className="text-xl md:text-2xl font-display vibrant-text tracking-wide hidden xs:inline drop-shadow-md">Sua vida financeira, plena e vibrante.</h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-base font-semibold text-white">
                    {profile?.full_name || "Usuário"}
                  </p>
                  <p className="text-xs text-white/70 font-text">{profile?.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={signOut}
                  className="text-white/80 hover:text-primary hover:bg-primary/15 rounded-full"
                  aria-label="Sair"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </header>

            {/* Main Content */}
            <section className="flex-1 w-full px-4 md:px-8 pt-6 pb-8 overflow-y-auto">
              <div className="max-w-[1400px] mx-auto w-full">
                {activeTab === "dashboard" && (
                  <div className="space-y-8 animate-fade-in">
                    <WelcomeCard 
                      name={profile?.full_name?.split(" ")[0] || "Usuário"}
                      plan={subscription?.plan}
                      onViewReports={() => setActiveTab("analytics")}
                    />
                    <AnalyticsOverview />
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-8">
                      <div className="xl:col-span-2 shadow-vibrant rounded-2xl border-none relative overflow-hidden bg-surface/80 backdrop-blur-lg p-6">
                         <h2 className="text-2xl font-display vibrant-text mb-4">Análise de Performance</h2>
                         <FinancialCharts />
                      </div>
                      <div className="shadow-vibrant rounded-2xl border-none bg-surface/80 backdrop-blur-lg p-6">
                        <h2 className="text-2xl font-display text-white/90 mb-4">Ações Rápidas</h2>
                        <DashboardQuickActions />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "transactions" && (
                  <div className="animate-fade-in">
                    <h1 className="font-display text-4xl vibrant-text mb-8">Transações</h1>
                    <TransactionList />
                  </div>
                )}
                {activeTab === "goals" && (
                  <div className="animate-fade-in">
                    <h1 className="font-display text-4xl text-accent mb-8">Metas</h1>
                    <GoalList />
                  </div>
                )}
                {activeTab === "investments" && (
                  <div className="animate-fade-in">
                    <h1 className="font-display text-4xl text-secondary mb-8">Investimentos</h1>
                    <InvestmentList />
                  </div>
                )}
                {activeTab === "analytics" && (
                  <div className="animate-fade-in">
                    <h1 className="font-display text-4xl vibrant-text mb-8">Análises Detalhadas</h1>
                    <FinancialCharts />
                  </div>
                )}
                {activeTab === "education" && (
                  <div className="animate-fade-in">
                    <h1 className="font-display text-4xl vibrant-text mb-8">Educação Financeira</h1>
                    <Education />
                  </div>
                )}
                {activeTab === "whatsapp" && (
                  <div className="animate-fade-in">
                    <h1 className="font-display text-4xl text-success mb-8">Assistente WhatsApp</h1>
                    <WhatsAppIntegration />
                  </div>
                )}
                {activeTab === "subscription" && (
                  <div className="animate-fade-in">
                    <h1 className="font-display text-4xl text-purple-400 mb-8">Sua Assinatura</h1>
                    <SubscriptionPlans />
                  </div>
                )}
              </div>
            </section>
            
          </main>
        </div>
        {/* Elementos de fundo dinâmico */}
        <div className="fixed left-[-50px] top-[-100px] w-[300px] h-[300px] bg-primary/10 rounded-full blur-3xl z-0 animate-blob pointer-events-none" />
        <div className="fixed bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-secondary/10 rounded-full blur-3xl z-0 animate-blob pointer-events-none animation-delay-3000" />
      </SidebarProvider>
    </ProtectedRoute>
  );
}
