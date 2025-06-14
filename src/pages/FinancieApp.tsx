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
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { AnalyticsOverview } from "@/components/dashboard/AnalyticsOverview";
import { DashboardQuickActions } from "@/components/dashboard/DashboardQuickActions";

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
                <div className="space-y-8 mb-12 animate-fade-in">
                  {/* Novo card de boas-vindas */}
                  <WelcomeCard 
                    name={profile?.full_name?.split(" ")[0] || "Usuário"}
                    plan={subscription?.plan}
                    onViewReports={() => setActiveTab("analytics")}
                  />
                  
                  {/* Overview Dinâmico */}
                  <AnalyticsOverview />

                  {/* Alinhamento visual com Analytics e Ações */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-7 mt-8">
                    <Card className="col-span-2 bg-[#f5f8ff] border-[--electric]/20 shadow-lg animate-fade-in">
                      <CardHeader>
                        <CardTitle>Análises Visuais</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <FinancialCharts />
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-[--gold]/10 to-[--emerald]/10 border-none shadow-xl animate-fade-in">
                      <CardHeader>
                        <CardTitle>Ações rápidas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <DashboardQuickActions />
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
