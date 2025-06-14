
import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { FinancialSummary } from '@/components/dashboard/FinancialSummary';
import { TransactionList } from '@/components/transactions/TransactionList';
import { GoalList } from '@/components/goals/GoalList';
import { InvestmentList } from '@/components/investments/InvestmentList';
import { FinancialCharts } from '@/components/analytics/FinancialCharts';
import { SubscriptionPlans } from '@/components/subscription/SubscriptionPlans';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export function FinancieApp() {
  const [currentSection, setCurrentSection] = useState('dashboard');
  const { profile, subscription, loading } = useProfile();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const renderContent = () => {
    switch (currentSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">Visão geral das suas finanças</p>
            </div>
            <FinancialSummary />
          </div>
        );
        
      case 'transactions':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Transações</h1>
              <p className="text-gray-600 mt-2">Gerencie suas receitas e despesas</p>
            </div>
            <TransactionList />
          </div>
        );
        
      case 'goals':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Metas Financeiras</h1>
              <p className="text-gray-600 mt-2">Acompanhe o progresso dos seus objetivos</p>
            </div>
            <GoalList />
          </div>
        );
        
      case 'investments':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Investimentos</h1>
              <p className="text-gray-600 mt-2">Gerencie sua carteira de investimentos</p>
            </div>
            <InvestmentList />
          </div>
        );
        
      case 'reports':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Relatórios e Análises</h1>
              <p className="text-gray-600 mt-2">Visualize gráficos e tendências financeiras</p>
            </div>
            <FinancialCharts />
          </div>
        );
        
      case 'subscription':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Planos de Assinatura</h2>
              <p className="text-muted-foreground">
                Escolha o plano que melhor se adapta às suas necessidades
              </p>
            </div>
            <SubscriptionPlans />
          </div>
        );
        
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Perfil do Usuário</h1>
              <p className="text-gray-600 mt-2">Gerencie suas informações pessoais</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <strong>Nome:</strong> {profile?.full_name || 'Não informado'}
                  </div>
                  <div>
                    <strong>Email:</strong> {profile?.email}
                  </div>
                  <div>
                    <strong>Telefone:</strong> {profile?.phone || 'Não informado'}
                  </div>
                  <div>
                    <strong>Moeda:</strong> {profile?.currency || 'BRL'}
                  </div>
                  <div>
                    <strong>Plano Atual:</strong> {subscription?.plan || 'free'}
                  </div>
                  <div>
                    <strong>Perfil de Risco:</strong> {profile?.risk_profile || 'moderate'}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Notificação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Notificações por Email</span>
                    <span className="text-green-600">Ativado</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Notificações Push</span>
                    <span className="text-green-600">Ativado</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
              <p className="text-gray-600 mt-2">Personalize sua experiência no FinanciePRO</p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Preferências</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Tema</h3>
                  <p className="text-sm text-muted-foreground">Claro (padrão)</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Moeda</h3>
                  <p className="text-sm text-muted-foreground">Real Brasileiro (R$)</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Perfil de Risco</h3>
                  <p className="text-sm text-muted-foreground">
                    {profile?.risk_profile === 'conservative' && 'Conservador'}
                    {profile?.risk_profile === 'moderate' && 'Moderado'}
                    {profile?.risk_profile === 'aggressive' && 'Arrojado'}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Dicas Financeiras</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">💡 Dica de Hoje</h4>
                  <p className="text-sm text-blue-600">
                    Você sabia? Guardar 10% da sua renda por mês pode mudar sua vida em 1 ano.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">🎯 Desafio da Semana</h4>
                  <p className="text-sm text-green-600">
                    Passe 7 dias sem gastar com delivery. Consegue? Registre suas economias!
                  </p>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-800 mb-2">⚠️ Alerta Inteligente</h4>
                  <p className="text-sm text-orange-600">
                    Use o orçamento mensal para evitar surpresas no final do mês.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>{currentSection}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Esta seção está em desenvolvimento. Em breve teremos todas as funcionalidades implementadas!</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={setCurrentSection} currentSection={currentSection} />
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
}
