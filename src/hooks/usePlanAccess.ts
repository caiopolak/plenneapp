import { useSubscriptionLimits, PlanLimits } from './useSubscriptionLimits';

export type PlanType = 'free' | 'pro' | 'business';

export interface PlanFeature {
  name: string;
  description: string;
  requiredPlan: PlanType;
}

// Definição centralizada das features por plano
export const PLAN_FEATURES: Record<string, PlanFeature> = {
  scheduling: {
    name: 'Agendamento de Transações',
    description: 'Agende transações futuras e crie transações recorrentes automáticas.',
    requiredPlan: 'pro'
  },
  recurring: {
    name: 'Transações Recorrentes',
    description: 'Configure transações que se repetem automaticamente (mensal, semanal, etc).',
    requiredPlan: 'pro'
  },
  advancedReports: {
    name: 'Relatórios Avançados',
    description: 'Exporte relatórios completos em PDF e CSV com análises detalhadas.',
    requiredPlan: 'pro'
  },
  advancedAlerts: {
    name: 'Alertas Inteligentes',
    description: 'Receba alertas automáticos sobre orçamentos, metas e gastos excessivos.',
    requiredPlan: 'pro'
  },
  aiAssistantPro: {
    name: 'Assistente IA Expandido',
    description: 'Até 50 perguntas por mês ao assistente financeiro com IA.',
    requiredPlan: 'pro'
  },
  aiAssistantUnlimited: {
    name: 'Assistente IA Ilimitado',
    description: 'Perguntas ilimitadas ao assistente financeiro com IA.',
    requiredPlan: 'business'
  },
  whatsappIntegration: {
    name: 'Integração WhatsApp',
    description: 'Gerencie suas finanças diretamente pelo WhatsApp com comandos e IA.',
    requiredPlan: 'business'
  },
  proThemes: {
    name: 'Temas Pro',
    description: 'Acesso a 8 temas vibrantes e exclusivos para personalizar seu app.',
    requiredPlan: 'pro'
  },
  businessThemes: {
    name: 'Temas Premium',
    description: 'Temas de luxo exclusivos: Ouro Imperial, Ametista, Obsidiana e mais.',
    requiredPlan: 'business'
  },
  multipleWorkspaces: {
    name: 'Múltiplos Workspaces',
    description: 'Gerencie finanças pessoais, familiares e empresariais separadamente.',
    requiredPlan: 'pro'
  },
  advancedEducation: {
    name: 'Educação Financeira Completa',
    description: 'Acesso a todos os módulos e conteúdos educacionais.',
    requiredPlan: 'pro'
  },
  dedicatedSupport: {
    name: 'Suporte Dedicado',
    description: 'Atendimento prioritário em até 24h com canal WhatsApp exclusivo.',
    requiredPlan: 'business'
  }
};

// Hook para verificar acesso a features
export function usePlanAccess() {
  const { limits, isLoading } = useSubscriptionLimits();
  
  const currentPlan: PlanType = (limits?.plan as PlanType) || 'free';
  
  // Verificar se o plano atual tem acesso a uma feature
  const hasAccess = (requiredPlan: PlanType): boolean => {
    if (requiredPlan === 'free') return true;
    if (requiredPlan === 'pro') return currentPlan === 'pro' || currentPlan === 'business';
    if (requiredPlan === 'business') return currentPlan === 'business';
    return false;
  };
  
  // Verificar acesso a uma feature específica
  const canUseFeature = (featureKey: string): boolean => {
    const feature = PLAN_FEATURES[featureKey];
    if (!feature) return true; // Se feature não definida, permitir
    return hasAccess(feature.requiredPlan);
  };
  
  // Obter o plano mínimo necessário para uma feature
  const getRequiredPlan = (featureKey: string): PlanType => {
    return PLAN_FEATURES[featureKey]?.requiredPlan || 'free';
  };
  
  // Obter informações da feature
  const getFeatureInfo = (featureKey: string): PlanFeature | null => {
    return PLAN_FEATURES[featureKey] || null;
  };
  
  // Verificar se é plano gratuito
  const isFree = currentPlan === 'free';
  const isPro = currentPlan === 'pro';
  const isBusiness = currentPlan === 'business';
  const isPremium = isPro || isBusiness;
  
  return {
    currentPlan,
    limits,
    isLoading,
    hasAccess,
    canUseFeature,
    getRequiredPlan,
    getFeatureInfo,
    isFree,
    isPro,
    isBusiness,
    isPremium
  };
}
