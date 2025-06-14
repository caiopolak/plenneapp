
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
        <div className="flex min-h-screen w-full bg-vibrant-gradient md:bg-[radial-gradient(circle_at_10%_25%,rgba(255,86,169,0.15)_0%,rgba(60,142,255,0.09)_45%,#0C0B1A_100%)] transition-colors duration-300 relative">
          <AppSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between items-center px-3 md:px-8 py-3 md:py-6 border-b border-border/50 z-30 bg-surface/95 backdrop-blur-xl shadow-neon gap-4 transition-all">
              <div className="flex items-center gap-4">
                <LogoPlenne />
                <span className="ml-2 text-lg md:text-2xl font-display vibrant-text tracking-wide hidden xs:inline drop-shadow">Sua vida financeira plena & vibrante.</span>
              </div>
              <div className="flex items-center gap-5">
                <div className="text-right">
                  <p className="text-base md:text-lg font-semibold text-accent vibrant-text">
                    {profile?.full_name || "Usuário"}
                  </p>
                  <p className="text-xs text-white/60 font-inter">{profile?.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="text-white hover:text-primary hover:bg-primary/15 border border-border/40 shadow-vibrant"
                  aria-label="Sair"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </header>

            {/* Main Content */}
            <section className="flex-1 w-full px-1 xs:px-2 sm:px-4 md:px-8 pt-2 sm:pt-6 pb-3 sm:pb-8 bg-vibrant-mobile md:bg-transparent transition-colors duration-500 overflow-y-auto">
              <div className="max-w-[1250px] mx-auto w-full">
                {activeTab === "dashboard" && (
                  <div className="space-y-8 mb-10 animate-fade-in">
                    {/* Card de boas-vindas vibrante */}
                    <div className="mb-3">
                      <WelcomeCard 
                        name={profile?.full_name?.split(" ")[0] || "Usuário"}
                        plan={subscription?.plan}
                        onViewReports={() => setActiveTab("analytics")}
                      />
                    </div>
                    <AnalyticsOverview />
                    {/* GRID Visualizações + Ações rápidas */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-8">
                      <div className="xl:col-span-2 shadow-vibrant rounded-2xl border-none relative overflow-hidden bg-surface/80 backdrop-blur-lg">
                        <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-br from-purple-500/30 via-pink-500/15 to-blue-500/10 rounded-2xl"/>
                        <div className="relative z-10">
                          <div className="px-7 pt-7">
                            <h2 className="text-xl font-display vibrant-text mb-3">Análises Visuais</h2>
                          </div>
                          <FinancialCharts />
                        </div>
                      </div>
                      <div className="shadow-vibrant rounded-2xl border-none bg-gradient-to-br from-vibrant-pink/10 via-vibrant-purple/10 to-vibrant-blue/10 backdrop-blur-lg">
                        <div className="px-6 pt-6">
                          <h2 className="text-xl font-display text-white/90">Ações rápidas</h2>
                        </div>
                        <div className="px-4 pb-8 pt-2">
                          <DashboardQuickActions />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "transactions" && (
                  <div className="animate-fade-in px-0 sm:px-2 md:px-6">
                    <h1 className="font-display text-3xl vibrant-text mb-6">Transações</h1>
                    <TransactionList />
                  </div>
                )}
                {activeTab === "goals" && (
                  <div className="animate-fade-in px-0 sm:px-2 md:px-6">
                    <h1 className="font-display text-3xl text-vibrant-gold mb-6">Metas</h1>
                    <GoalList />
                  </div>
                )}
                {activeTab === "investments" && (
                  <div className="animate-fade-in px-0 sm:px-2 md:px-6">
                    <h1 className="font-display text-3xl text-vibrant-blue mb-6">Investimentos</h1>
                    <InvestmentList />
                  </div>
                )}
                {activeTab === "analytics" && (
                  <div className="animate-fade-in px-0 sm:px-2 md:px-6">
                    <h1 className="font-display text-3xl vibrant-text mb-6">Análises</h1>
                    <FinancialCharts />
                  </div>
                )}
                {activeTab === "education" && (
                  <div className="animate-fade-in px-0 sm:px-2 md:px-6">
                    <h1 className="font-display text-3xl vibrant-text mb-7">Educação Financeira</h1>
                    <Education />
                  </div>
                )}
                {activeTab === "whatsapp" && (
                  <div className="animate-fade-in px-0 sm:px-2 md:px-6">
                    <h1 className="font-display text-3xl text-vibrant-green mb-6">WhatsApp IA</h1>
                    <WhatsAppIntegration />
                  </div>
                )}
                {activeTab === "subscription" && (
                  <div className="animate-fade-in px-0 sm:px-2 md:px-6">
                    <h1 className="font-display text-3xl text-vibrant-purple mb-6">Assinatura</h1>
                    <SubscriptionPlans />
                  </div>
                )}
              </div>
            </section>

            <footer className="bg-primary text-white py-6 sm:py-8 mt-8 text-center rounded-t-[2.5rem] shadow-neon font-display tracking-wide">
              <span className="text-xs sm:text-base text-white/80">
                © 2025 Plenne. Educação, atitude e inteligência financeira sem complicação.
              </span>
            </footer>
          </main>
        </div>
        {/* Elementos de fundo dinâmico */}
        <div className="fixed left-12 top-[-90px] w-[290px] h-[200px] bg-[radial-gradient(ellipse_at_center,_rgba(255,86,169,0.18)_0%,_transparent_74%)] z-0 animate-blob pointer-events-none" />
        <div className="fixed bottom-[-100px] right-[-80px] w-[340px] h-[260px] bg-[radial-gradient(circle_at_bottom_right,_rgba(60,142,255,0.14)_0%,_transparent_70%)] z-0 animate-blob pointer-events-none" />
      </SidebarProvider>
    </ProtectedRoute>
  );
}
