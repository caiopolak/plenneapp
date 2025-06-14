
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Bell,
  Sparkles,
  DollarSign,
  Home
} from 'lucide-react';
import Education from './Education';

export default function FinancieApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { signOut } = useAuth();
  const { profile, subscription } = useProfile();

  const getPlanBadge = () => {
    if (!subscription) return null;
    
    const planColors = {
      free: 'bg-gray-500',
      pro: 'bg-[#f8961e]',
      business: 'bg-[#2f9e44]'
    };

    const planLabels = {
      free: 'Free',
      pro: 'Pro',
      business: 'Business'
    };

    return (
      <Badge className={`${planColors[subscription.plan]} text-white`}>
        <Crown className="w-3 h-3 mr-1" />
        {planLabels[subscription.plan]}
      </Badge>
    );
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'transactions', label: 'Transações', icon: CreditCard },
    { id: 'goals', label: 'Metas', icon: Target },
    { id: 'investments', label: 'Investimentos', icon: TrendingUp },
    { id: 'analytics', label: 'Análises', icon: BarChart3 },
    { id: 'education', label: 'Educação', icon: BookOpen },
    { id: 'subscription', label: 'Planos', icon: Crown },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[#f4f4f4] to-white">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-[#003f5c]/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-[#003f5c] to-[#2f9e44] rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[#003f5c]">FinanciePRO</h1>
                  <p className="text-xs text-[#2b2b2b]/60">Você no controle do seu dinheiro</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {getPlanBadge()}
                <div className="text-right">
                  <p className="text-sm font-medium text-[#003f5c]">
                    {profile?.full_name || 'Usuário'}
                  </p>
                  <p className="text-xs text-[#2b2b2b]/60">{profile?.email}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={signOut}
                  className="text-[#2b2b2b] hover:text-[#d62828] hover:bg-[#d62828]/10"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-[#003f5c] shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 overflow-x-auto py-4">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === item.id
                        ? 'bg-[#2f9e44] text-white shadow-md'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                    {item.id === 'education' && (
                      <Sparkles className="w-3 h-3 text-[#f8961e]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'dashboard' && <FinancialSummary />}
          {activeTab === 'transactions' && <TransactionList />}
          {activeTab === 'goals' && <GoalList />}
          {activeTab === 'investments' && <InvestmentList />}
          {activeTab === 'analytics' && <FinancialCharts />}
          {activeTab === 'education' && <Education />}
          {activeTab === 'subscription' && <SubscriptionPlans />}
        </main>

        {/* Footer */}
        <footer className="bg-[#003f5c] text-white py-8 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#2f9e44] to-[#f8961e] rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold">FinanciePRO</h3>
                </div>
                <p className="text-white/80 text-sm">
                  Sua plataforma completa de gestão financeira e educação para uma vida próspera.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Recursos</h4>
                <ul className="space-y-2 text-sm text-white/80">
                  <li>• Controle de Transações</li>
                  <li>• Metas Financeiras</li>
                  <li>• Gestão de Investimentos</li>
                  <li>• Educação Financeira</li>
                  <li>• Assistente WhatsApp</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Bordões</h4>
                <ul className="space-y-2 text-sm text-white/80">
                  <li>"Organize. Economize. Evolua."</li>
                  <li>"Você no controle do seu dinheiro"</li>
                  <li>"A vida financeira que você merece"</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-white/20 mt-8 pt-6 text-center">
              <p className="text-white/60 text-sm">
                © 2025 FinanciePRO. Todos os direitos reservados. 
                <span className="text-[#2f9e44] font-medium"> Educação financeira prática, no seu ritmo.</span>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
}
