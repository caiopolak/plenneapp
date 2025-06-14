
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
import { WhatsAppIntegration } from "@/components/whatsapp/WhatsAppIntegration";
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
          <main className="flex-1 flex flex-col min-h-screen">
            {/* Modern Header */}
            <header className="flex flex-col sm:flex-row justify-between items-center px-2 sm:px-6 py-3 sm:py-4 md:px-8 md:py-6 border-b bg-white/90 shadow-sm rounded-t-lg gap-3 sm:gap-0 z-30">
              <div className="flex items-center gap-3 sm:gap-5">
                <LogoPlenne />
                <span className="ml-1 sm:ml-2 text-base sm:text-lg font-semibold text-[#017F66] hidden xs:inline">Sua vida financeira, plena.</span>
              </div>
              <div className="flex items-center gap-3 sm:gap-6 mt-2 sm:mt-0">
                <div className="text-right">
                  <p className="text-sm sm:text-base font-semibold text-[--primary]">{profile?.full_name || "Usuário"}</p>
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
            <section className="flex-1 w-full px-1 xs:px-2 sm:px-4 md:px-8 pt-1 sm:pt-6 pb-3 sm:pb-8 overflow-y-auto bg-gradient-to-br from-green-50/25 via-blue-50/25 to-white">
              <div className="max-w-[1160px] mx-auto w-full">
              {activeTab === "dashboard" && (
                <div className="space-y-6 sm:space-y-8 mb-10 animate-fade-in">
                  {/* Novo card de boas-vindas */}
                  <div className="mb-2 sm:mb-3">
                    <WelcomeCard 
                      name={profile?.full_name?.split(" ")[0] || "Usuário"}
                      plan={subscription?.plan}
                      onViewReports={() => setActiveTab("analytics")}
                    />
                  </div>
                  
                  {/* Overview Dinâmico */}
                  <AnalyticsOverview />

                  {/* Alinhamento visual com Analytics e Ações */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-7 sm:mt-10">
                    <Card className="col-span-2 bg-[#f5f8ff] border-[--electric]/20 shadow-lg animate-fade-in">
                      <CardHeader>
                        <CardTitle className="text-base sm:text-lg">Análises Visuais</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <FinancialCharts />
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-[--gold]/10 to-[--emerald]/10 border-none shadow-xl animate-fade-in">
                      <CardHeader>
                        <CardTitle className="text-base sm:text-lg">Ações rápidas</CardTitle>
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
              </div>
            </section>

            <footer className="bg-[--primary] text-white py-6 sm:py-8 mt-8 text-center">
              <span className="text-xs sm:text-sm text-white/80">
                © 2025 Plenne. Educação, atitude e inteligência financeira sem complicação.
              </span>
            </footer>
          </main>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}

