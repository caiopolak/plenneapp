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
import { SubscriptionPlans } from "@/components/subscription/SubscriptionPlans";
import { WhatsAppIntegration } from "@/components/whatsapp/WhatsAppIntegration";
import Education from './Education';
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { QuickNotifications } from "@/components/dashboard/QuickNotifications";
import { FinancialTipsCard } from "@/components/dashboard/FinancialTipsCard";
import { FinancialAlertsList } from "@/components/dashboard/FinancialAlertsList";
import { BudgetList } from "@/components/budget/BudgetList";

export default function FinancieApp() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { signOut } = useAuth();
  const { profile, subscription } = useProfile();

  // Abre modal de nova transação
  const handleAddTransaction = () => {
    setActiveTab("transactions");
    // Ideal: abrir modal, aqui apenas navega para tab para exemplo compatível
  };

  return (
    <ProtectedRoute>
      <WorkspaceProvider>
        <SidebarProvider>
          <div className="flex min-h-screen w-full bg-gradient-to-br from-background to-neutral-light relative">
            <AppSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden relative">
              {/* Botão para abrir o menu lateral no mobile */}
              <div className="sm:hidden flex items-center sticky top-0 z-40 bg-surface/90 h-14 px-4 border-b border-primary/10">
                <SidebarTrigger />
                <div className="ml-4 flex-1 flex items-center gap-2">
                  <LogoPlenne />
                  <span className="slogan text-xs font-medium text-primary/80">Controle financeiro de verdade.</span>
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
              {/* Header desktop e notificações rápidas */}
              <header className="hidden sm:flex flex-row justify-between items-center px-6 md:px-12 py-5 border-b border-primary/15 bg-surface/90 shadow-card gap-4 sticky top-0 z-30 backdrop-blur-lg">
                <div className="flex items-center gap-4">
                  <LogoPlenne />
                  <span className="slogan hidden xs:inline">Você no controle do seu dinheiro, de verdade.</span>
                </div>
                <QuickNotifications onAddTransaction={handleAddTransaction} />
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
              <section className="flex-1 w-full px-2 sm:px-4 md:px-10 pt-6 pb-10 bg-gradient-to-br from-background/80 to-neutral-light/70 min-h-[calc(100vh-56px)] sm:min-h-[calc(100vh-80px)] transition-padding">
                <div className="max-w-[1320px] mx-auto w-full">
                  {/* Nova Home: cards de overview e abas (dashboard no print) */}
                  {activeTab === "dashboard" && (
                    <div className="space-y-6 animate-fade-in">
                      {/* Linha de saldo/receita/despesa */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          {/* Card Saldo Atual */}
                          <div className="bg-white rounded-xl p-6 shadow hover:scale-105 transition-transform border border-green-50">
                            <div className="font-bold text-xl text-primary mb-1">Saldo Atual</div>
                            <div className="text-3xl font-bold text-green-700">R$ 5.247,89</div>
                          </div>
                        </div>
                        <div>
                          <div className="bg-white rounded-xl p-6 shadow hover:scale-105 transition-transform border border-green-50">
                            <div className="font-bold text-xl text-green-800 mb-1">Receitas</div>
                            <div className="text-3xl font-bold text-green-700">R$ 8.500,00</div>
                          </div>
                        </div>
                        <div>
                          <div className="bg-white rounded-xl p-6 shadow hover:scale-105 transition-transform border border-red-50">
                            <div className="font-bold text-xl text-red-700 mb-1">Despesas</div>
                            <div className="text-3xl font-bold text-red-600">R$ 3.252,11</div>
                          </div>
                        </div>
                      </div>
                      {/* Linha de gráficos */}
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        <div className="col-span-1 xl:col-span-2 bg-white rounded-xl p-6 shadow border">
                          {/* Espaço para chart de Receita x Despesa */}
                          <div className="text-lg font-bold mb-2 text-graphite">Receitas vs Despesas</div>
                          {/* Aqui troque por gráfico real (exemplo placeholder) */}
                          <div className="h-56 flex items-center justify-center text-muted-foreground bg-gray-50 rounded">[ Gráfico de barras aqui ]</div>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow border flex flex-col">
                          <div className="text-lg font-bold mb-2 text-graphite">Distribuição de Gastos</div>
                          <div className="h-56 flex items-center justify-center text-muted-foreground bg-gray-50 rounded">[ Gráfico pizza aqui ]</div>
                        </div>
                      </div>
                      {/* Finanças card dicas/alertas */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FinancialTipsCard />
                        <FinancialAlertsList />
                      </div>
                      {/* Orçamentos Mensais */}
                      <div>
                        <BudgetList />
                      </div>
                    </div>
                  )}

                  {/* As demais abas como Analytics/Education etc permanecem */}
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
                      {/* Exemplo de integração/CTA */}
                      <Card className="mb-8">
                        <CardHeader>
                          <CardTitle>Ative o Assistente Financeiro via WhatsApp</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="mb-2">Comunique-se com o Plenne pelo WhatsApp para <strong>cadastrar transações, consultar saldo, definir metas e tirar dúvidas financeiras via IA</strong>! Exclusivo para assinantes <span className="font-bold text-green-600">Business</span>.</div>
                          <Button asChild>
                            <a href="https://wa.me/5599999999999?text=Olá,+quero+ativar+meu+Assistente+Plenne!" target="_blank" rel="noopener noreferrer">
                              Ativar WhatsApp Financeiro
                            </a>
                          </Button>
                        </CardContent>
                      </Card>
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
