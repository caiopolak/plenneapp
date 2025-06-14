
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FinancialSummary } from '@/components/dashboard/FinancialSummary';
import { TransactionList } from '@/components/transactions/TransactionList';
import { GoalList } from '@/components/goals/GoalList';
import { InvestmentList } from '@/components/investments/InvestmentList';
import { FinancialCharts } from '@/components/analytics/FinancialCharts';
import { SubscriptionPlans } from '@/components/subscription/SubscriptionPlans';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { 
  LogOut,
} from 'lucide-react';
import Education from './Education';
import { LogoPlenne } from '../components/layout/LogoPlenne';
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { WhatsAppIntegration } from "@/components/whatsapp/WhatsAppIntegration"; // <-- FIX: Proper import

export default function FinancieApp() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { signOut } = useAuth();
  const { profile, subscription } = useProfile();

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-gradient-to-b from-[#F8FAFC] via-[#E7FAF4] to-white">
          <AppSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <main className="flex-1 min-h-screen flex flex-col">
            {/* Modern Header */}
            <header className="flex justify-between items-center px-8 py-6 border-b bg-white/80 shadow-sm rounded-t-lg">
              <div className="flex items-center gap-4">
                <LogoPlenne />
                <span className="ml-2 text-lg font-semibold text-[#017F66] hidden sm:inline">Sua vida financeira, plena.</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-base font-semibold text-[--primary]">{profile?.full_name || "Usuário"}</p>
                  <p className="text-xs text-gray-400 font-inter">{profile?.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="text-gray-800 hover:text-[--accent] hover:bg-[--accent]/10"
                  aria-label="Sair"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </header>

            {/* Dashboard Section */}
            <section className="flex-1 p-6 sm:p-8 overflow-y-auto bg-gradient-to-br from-green-50/25 via-blue-50/25 to-white">
              {activeTab === "dashboard" && (
                <div className="space-y-6 mb-10">
                  {/* Welcome Card */}
                  <Card className="bg-gradient-to-r from-[--primary]/80 to-[--secondary]/80 text-white mb-4 shadow-lg">
                    <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 py-6 px-8">
                      <div>
                        <h2 className="text-2xl font-bold">Olá, {profile?.full_name?.split(" ")[0] || "Usuário"}!</h2>
                        <p className="text-white/80 text-base mt-1">Aqui está o resumo da sua vida financeira.</p>
                      </div>
                      <div className="flex gap-3">
                        <Badge className="bg-[--gold] text-[--graphite] text-base rounded-full uppercase">
                          {subscription?.plan || "FREE"}
                        </Badge>
                        <Button variant="secondary" size="sm" className="shadow">
                          Ver Relatórios
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Modern Analytics Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Resumo financeiro</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <FinancialSummary />
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Metas e Desafios</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <GoalList />
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Investimentos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <InvestmentList />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Visual Analytics & Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <Card className="col-span-2 bg-[#f5f8ff] border-[--electric]/20">
                      <CardHeader>
                        <CardTitle>Análises Visuais</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <FinancialCharts />
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-[--gold]/10 to-[--emerald]/10 border-none shadow-sm">
                      <CardHeader>
                        <CardTitle>Ações rápidas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          <li>
                            <Button size="sm" variant="secondary" className="w-full">Nova Transação</Button>
                          </li>
                          <li>
                            <Button size="sm" variant="outline" className="w-full">Nova Meta</Button>
                          </li>
                          <li>
                            <Button size="sm" variant="outline" className="w-full">Novo Investimento</Button>
                          </li>
                          <li>
                            <Button size="sm" className="w-full bg-[--electric]">Acessar Educação Financeira</Button>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === "transactions" && <TransactionList />}
              {activeTab === "goals" && <GoalList />}
              {activeTab === "investments" && <InvestmentList />}
              {activeTab === "analytics" && <FinancialCharts />}
              {activeTab === "education" && <Education />}
              {activeTab === "whatsapp" && <WhatsAppIntegration />}
              {activeTab === "subscription" && <SubscriptionPlans />}
            </section>

            <footer className="bg-[--primary] text-white py-8 mt-10 text-center">
              <span className="text-sm text-white/80">
                © 2025 Plenne. Educação, atitude e inteligência financeira sem complicação.
              </span>
            </footer>
          </main>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
