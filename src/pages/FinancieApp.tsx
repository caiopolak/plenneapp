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
  BarChart3, 
  Target, 
  TrendingUp, 
  CreditCard, 
  Crown, 
  LogOut,
  BookOpen,
  Sparkles,
  DollarSign,
  Home
} from 'lucide-react';
import Education from './Education';
import { LogoPlenne } from '../components/layout/LogoPlenne';
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

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
            <header className="flex justify-between items-center px-8 py-6 border-b bg-white/80 shadow-sm">
              <div className="flex items-center gap-4">
                <LogoPlenne />
                <span className="ml-2 text-md font-semibold text-[#017F66]">Sua vida financeira, plena.</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-base font-semibold text-[--primary]">
                    {profile?.full_name || "Usuário"}
                  </p>
                  <p className="text-xs text-gray-400 font-inter">
                    {profile?.email}
                  </p>
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
            <section className="flex-1 p-6 sm:p-8 overflow-y-auto">
              {activeTab === "dashboard" && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
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
