
import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 0,00</div>
                <p className="text-xs text-muted-foreground">
                  Sem transações ainda
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receitas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">R$ 0,00</div>
                <p className="text-xs text-muted-foreground">
                  Este mês
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Despesas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">R$ 0,00</div>
                <p className="text-xs text-muted-foreground">
                  Este mês
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Economia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 0,00</div>
                <p className="text-xs text-muted-foreground">
                  Meta mensal
                </p>
              </CardContent>
            </Card>
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
          <Card>
            <CardHeader>
              <CardTitle>Perfil do Usuário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <strong>Nome:</strong> {profile?.full_name || 'Não informado'}
              </div>
              <div>
                <strong>Email:</strong> {profile?.email}
              </div>
              <div>
                <strong>Plano Atual:</strong> {subscription?.plan || 'free'}
              </div>
              <div>
                <strong>Perfil de Risco:</strong> {profile?.risk_profile || 'moderate'}
              </div>
            </CardContent>
          </Card>
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
