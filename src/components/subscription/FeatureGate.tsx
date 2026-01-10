import React from 'react';
import { usePlanAccess, PlanType, PLAN_FEATURES } from '@/hooks/usePlanAccess';
import { UpgradeCTA } from './UpgradeCTA';
import { cn } from '@/lib/utils';

interface FeatureGateProps {
  /** Key da feature definida em PLAN_FEATURES ou plano mínimo requerido */
  feature?: string;
  requiredPlan?: PlanType;
  /** Conteúdo a ser exibido se tem acesso */
  children: React.ReactNode;
  /** Variante do CTA quando bloqueado */
  ctaVariant?: 'card' | 'inline' | 'modal';
  /** Se true, mostra conteúdo com blur ao invés do CTA */
  showBlurred?: boolean;
  /** Classe extra para o container */
  className?: string;
  /** Título customizado para o CTA */
  customTitle?: string;
  /** Descrição customizada para o CTA */
  customDescription?: string;
  /** Se true, não renderiza nada quando bloqueado */
  hideWhenBlocked?: boolean;
}

export function FeatureGate({
  feature,
  requiredPlan,
  children,
  ctaVariant = 'card',
  showBlurred = false,
  className,
  customTitle,
  customDescription,
  hideWhenBlocked = false
}: FeatureGateProps) {
  const { canUseFeature, hasAccess, getFeatureInfo } = usePlanAccess();
  
  // Determinar se tem acesso
  let hasPermission = true;
  let featureInfo = feature ? getFeatureInfo(feature) : null;
  let planRequired: PlanType = requiredPlan || featureInfo?.requiredPlan || 'pro';
  
  if (feature) {
    hasPermission = canUseFeature(feature);
  } else if (requiredPlan) {
    hasPermission = hasAccess(requiredPlan);
  }
  
  // Se tem acesso, renderiza children normalmente
  if (hasPermission) {
    return <>{children}</>;
  }
  
  // Se não deve mostrar nada quando bloqueado
  if (hideWhenBlocked) {
    return null;
  }
  
  // Determinar título e descrição
  const title = customTitle || featureInfo?.name || 'Recurso Premium';
  const description = customDescription || featureInfo?.description || 
    `Esta funcionalidade está disponível a partir do plano ${planRequired === 'pro' ? 'Pro' : 'Business'}.`;
  
  // Se deve mostrar conteúdo com blur
  if (showBlurred) {
    return (
      <div className={cn("relative overflow-hidden rounded-lg", className)}>
        {/* Conteúdo borrado */}
        <div className="blur-sm select-none pointer-events-none opacity-60">
          {children}
        </div>
        
        {/* Overlay com CTA */}
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
          <UpgradeCTA
            feature={title}
            description={description}
            requiredPlan={planRequired === 'business' ? 'business' : 'pro'}
            variant="modal"
          />
        </div>
      </div>
    );
  }
  
  // Renderiza CTA diretamente
  return (
    <div className={className}>
      <UpgradeCTA
        feature={title}
        description={description}
        requiredPlan={planRequired === 'business' ? 'business' : 'pro'}
        variant={ctaVariant}
      />
    </div>
  );
}
