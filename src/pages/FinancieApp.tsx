
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
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export default function FinancieApp() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { signOut } = useAuth();
  const { profile, subscription } = useProfile();

  return (
    <ProtectedRoute>
      <WorkspaceProvider>
        <SidebarProvider>
          <div className="flex min-h-screen w-full bg-gradient-to-br from-background to-neutral-light relative">
            <AppSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
              {/* Header */}
              <header className="flex flex-col sm:flex-row justify-between items-center px-6 md:px-12 py-5 border-b border-primary/15 bg-surface/90 shadow-card gap-4 sticky top-0 z-30 backdrop-blur-lg">
                <div className="flex items-center gap-4">
                  <LogoPlenne />
                  <span className="slogan hidden xs:inline">Você no controle do seu dinheiro, de verdade.</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-base font-bold text-primary font-display">
                      {profile?.full_name || "Usuário"}
                    </p>
                    <p className="text-xs text-graphite/60 font-text">{profile?.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={signOut}
                    className="text-primary hover:text-secondary hover:bg-secondary/10 rounded-full"
                    aria-label="Sair"
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                </div>
              </header>

              {/* Main Content */}
              <section className="flex-1 w-full px-4 md:px-10 pt-8 pb-10 bg-gradient-to-br from-background/80 to-neutral-light/70">
                <div className="max-w-[1320px] mx-auto w-full">
                  {activeTab === "dashboard" && (
                    <div className="space-y-10 animate-fade-in">
                      <WelcomeCard 
                        name={profile?.full_name?.split(" ")[0] || "Usuário"}
                        plan={subscription?.plan}
                        onViewReports={() => setActiveTab("analytics")}
                      />
                      <AnalyticsOverview />
                      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-10">
                        <div className="xl:col-span-2 shadow-card rounded-2xl bg-surface p-7">
                          <h2 className="text-2xl font-display font-bold brand-gradient-text mb-4">Análise de Performance</h2>
                          <FinancialCharts />
                        </div>
                        <div className="shadow-accent rounded-2xl bg-surface p-7">
                          <h2 className="text-2xl font-display text-secondary mb-4">Ações Rápidas</h2>
                          <DashboardQuickActions />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "transactions" && (
                    <div className="animate-fade-in">
                      <h1 className="font-display text-4xl text-primary mb-8">Transações</h1>
                      <TransactionList />
                    </div>
                  )}
                  {activeTab === "goals" && (
                    <div className="animate-fade-in">
                      <h1 className="font-display text-4xl text-attention mb-8">Metas</h1>
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
                      <h1 className="font-display text-4xl brand-gradient-text mb-8">Análises Detalhadas</h1>
                      <FinancialCharts />
                    </div>
                  )}
                  {activeTab === "education" && (
                    <div className="animate-fade-in">
                      <h1 className="font-display text-4xl text-secondary mb-8">Educação Financeira</h1>
                      <Education />
                    </div>
                  )}
                  {activeTab === "whatsapp" && (
                    <div className="animate-fade-in">
                      <h1 className="font-display text-4xl text-secondary mb-8">Assistente WhatsApp</h1>
                      <WhatsAppIntegration />
                    </div>
                  )}
                  {activeTab === "subscription" && (
                    <div className="animate-fade-in">
                      <h1 className="font-display text-4xl text-attention mb-8">Sua Assinatura</h1>
                      <SubscriptionPlans />
                    </div>
                  )}
                </div>
              </section>
            </main>
          </div>
          {/* Fundo decorativo suave - usando o seu gradiente oficial */}
          <div className="fixed left-[-40px] top-[-90px] w-[360px] h-[360px] bg-gradient-to-tr from-primary/10 via-secondary/20 to-attention/10 rounded-full blur-3xl z-0 pointer-events-none" />
          <div className="fixed bottom-[-90px] right-[-80px] w-[420px] h-[420px] bg-gradient-to-bl from-secondary/10 via-primary/10 to-attention/10 rounded-full blur-3xl z-0 pointer-events-none" />
        </SidebarProvider>
      </WorkspaceProvider>
    </ProtectedRoute>
  );
}
