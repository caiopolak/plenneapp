
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

export default function FinancieApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { signOut } = useAuth();
  const { profile, subscription } = useProfile();

  const getPlanBadge = () => {
    if (!subscription) return null;
    
    const planColors = {
      free: 'bg-[--primary]',
      pro: 'bg-[--accent] text-[--accent-foreground]',
      business: 'bg-[--secondary]'
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
      <div className="min-h-screen bg-gradient-to-br from-[#E7FAF4] via-[#F8FAFC] to-white font-poppins">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-[--primary]/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center gap-4">
                <LogoPlenne />
                <div className="flex flex-col">
                  <span className="text-xl font-extrabold text-[--primary] tracking-tight leading-tight">
                    Plenne
                  </span>
                  <p className="text-xs text-gray-500 font-inter font-medium tracking-wide">Sua vida financeira, plena.</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                {getPlanBadge()}
                <div className="text-right">
                  <p className="text-base font-semibold text-[--primary]">
                    {profile?.full_name || 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-400 font-inter">{profile?.email}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={signOut}
                  className="text-gray-800 hover:text-[--accent] hover:bg-[--accent]/10"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-[--primary] shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 overflow-x-auto py-4">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-base font-semibold tracking-tight transition-colors ${
                      activeTab === item.id
                        ? 'bg-[--gold] text-[--graphite] shadow'
                        : 'text-white hover:text-[--accent] hover:bg-[--electric]/10'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                    {item.id === 'education' && (
                      <Sparkles className="w-4 h-4 text-[--gold]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {activeTab === 'dashboard' && <FinancialSummary />}
          {activeTab === 'transactions' && <TransactionList />}
          {activeTab === 'goals' && <GoalList />}
          {activeTab === 'investments' && <InvestmentList />}
          {activeTab === 'analytics' && <FinancialCharts />}
          {activeTab === 'education' && <Education />}
          {activeTab === 'subscription' && <SubscriptionPlans />}
        </main>

        {/* Footer */}
        <footer className="bg-[--primary] text-white py-10 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <LogoPlenne showSymbol />
                  <h3 className="text-lg font-bold tracking-tight">Plenne</h3>
                </div>
                <p className="text-white/80 text-sm font-inter">
                  Plataforma completa de gestão financeira, educação e saúde financeira. Autonomia, atitude e liberdade para uma vida plena.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Recursos</h4>
                <ul className="space-y-2 text-sm text-white/80 font-inter">
                  <li>• Controle de Transações</li>
                  <li>• Metas Financeiras</li>
                  <li>• Gestão de Investimentos</li>
                  <li>• Educação & Dicas Financeiras</li>
                  <li>• Assistente IA WhatsApp</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Slogans</h4>
                <ul className="space-y-2 text-sm text-white/80 font-inter">
                  <li>“Sua vida financeira, plena.”</li>
                  <li>“Controle, atitude e liberdade.”</li>
                  <li>“Transforme sua relação com o dinheiro.”</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/20 mt-8 pt-6 text-center">
              <p className="text-white/60 text-sm">
                © 2025 Plenne. Todos os direitos reservados.
                <span className="text-[--gold] font-medium"> Educação, atitude e inteligência financeira sem complicação.</span>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
}
