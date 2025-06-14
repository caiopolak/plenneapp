
import React from 'react';
import { PlanCard } from './PlanCard';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 'Grátis',
    description: 'Ideal para começar',
    features: [
      'Até 100 transações por mês',
      'Dashboard básico',
      'Metas financeiras',
      'Suporte por email'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'R$ 29',
    description: 'Para uso pessoal avançado',
    features: [
      'Transações ilimitadas',
      'Análises avançadas',
      'Relatórios em PDF/CSV',
      'Investimentos e simulações',
      'Suporte prioritário'
    ],
    isPopular: true
  },
  {
    id: 'business',
    name: 'Business',
    price: 'R$ 99',
    description: 'Para empresas e famílias',
    features: [
      'Todos os recursos Pro',
      'Múltiplos usuários',
      'Dashboard empresarial',
      'API personalizada',
      'Suporte dedicado'
    ]
  }
];

export function SubscriptionPlans() {
  const { subscription } = useProfile();
  const { toast } = useToast();

  const handleSelectPlan = (planId: string) => {
    if (planId === 'free') {
      toast({
        title: "Plano Free",
        description: "Você já está no plano gratuito!"
      });
      return;
    }

    // Aqui você implementaria a integração com Stripe ou outro provedor de pagamento
    toast({
      title: "Em breve!",
      description: `Integração de pagamento para o plano ${planId} será implementada em breve.`
    });
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          name={plan.name}
          price={plan.price}
          description={plan.description}
          features={plan.features}
          isPopular={plan.isPopular}
          isCurrentPlan={subscription?.plan === plan.id}
          onSelect={() => handleSelectPlan(plan.id)}
        />
      ))}
    </div>
  );
}
