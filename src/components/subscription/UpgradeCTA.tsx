import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Building2, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface UpgradeCTAProps {
  feature: string;
  description?: string;
  requiredPlan: 'pro' | 'business';
  variant?: 'card' | 'inline' | 'modal';
  className?: string;
}

export function UpgradeCTA({ 
  feature, 
  description, 
  requiredPlan, 
  variant = 'card',
  className 
}: UpgradeCTAProps) {
  const navigate = useNavigate();
  
  const planConfig = {
    pro: {
      name: 'Pro',
      price: 'R$ 19,90',
      icon: Crown,
      gradient: 'from-primary/20 to-secondary/20',
      borderColor: 'border-primary/50',
      textColor: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    business: {
      name: 'Business',
      price: 'R$ 49,90',
      icon: Building2,
      gradient: 'from-amber-500/20 to-yellow-500/20',
      borderColor: 'border-amber-500/50',
      textColor: 'text-amber-500',
      bgColor: 'bg-amber-500/10'
    }
  };

  const config = planConfig[requiredPlan];
  const Icon = config.icon;

  if (variant === 'inline') {
    return (
      <div className={cn(
        "flex items-center gap-3 p-3 rounded-lg",
        config.bgColor,
        config.borderColor,
        "border",
        className
      )}>
        <div className={cn("p-1.5 rounded-md", config.bgColor)}>
          <Lock className={cn("h-4 w-4", config.textColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{feature}</p>
          <p className="text-xs text-muted-foreground">
            Disponível no plano {config.name}
          </p>
        </div>
        <Button 
          size="sm" 
          variant="outline"
          className={cn("shrink-0", config.borderColor)}
          onClick={() => navigate('/app/subscription')}
        >
          <Icon className="h-3.5 w-3.5 mr-1" />
          Ver planos
        </Button>
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <div className={cn("text-center py-8 px-4", className)}>
        <div className={cn(
          "inline-flex p-4 rounded-full mb-4",
          config.bgColor
        )}>
          <Lock className={cn("h-8 w-8", config.textColor)} />
        </div>
        
        <h3 className="text-xl font-bold mb-2">{feature}</h3>
        
        {description && (
          <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
            {description}
          </p>
        )}

        <Badge 
          variant="outline" 
          className={cn("mb-4", config.borderColor, config.textColor)}
        >
          <Icon className="h-3 w-3 mr-1" />
          Exclusivo {config.name} - {config.price}/mês
        </Badge>

        <div className="flex flex-col gap-2 max-w-xs mx-auto">
          <Button 
            className={cn(
              requiredPlan === 'pro' && "bg-gradient-to-r from-primary to-secondary",
              requiredPlan === 'business' && "bg-gradient-to-r from-amber-500 to-yellow-500 text-white"
            )}
            onClick={() => navigate('/app/subscription')}
          >
            Fazer Upgrade
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
          <p className="text-xs text-muted-foreground">
            Garantia de 7 dias • Cancele quando quiser
          </p>
        </div>
      </div>
    );
  }

  // Default: card variant
  return (
    <Card className={cn(
      "overflow-hidden",
      config.borderColor,
      "border-2 border-dashed",
      className
    )}>
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-30",
        config.gradient
      )} />
      
      <CardContent className="relative z-10 p-6">
        <div className="flex items-start gap-4">
          <div className={cn(
            "p-3 rounded-xl shrink-0",
            config.bgColor
          )}>
            <Lock className={cn("h-6 w-6", config.textColor)} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">{feature}</h3>
              <Badge 
                variant="outline" 
                className={cn("text-[10px] shrink-0", config.borderColor, config.textColor)}
              >
                <Icon className="h-2.5 w-2.5 mr-0.5" />
                {config.name}
              </Badge>
            </div>
            
            {description ? (
              <p className="text-sm text-muted-foreground mb-4">
                {description}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mb-4">
                Esta funcionalidade está disponível a partir do plano {config.name} 
                por apenas <strong className={config.textColor}>{config.price}/mês</strong>.
              </p>
            )}

            <div className="flex items-center gap-3">
              <Button 
                size="sm"
                className={cn(
                  requiredPlan === 'pro' && "bg-gradient-to-r from-primary to-secondary hover:opacity-90",
                  requiredPlan === 'business' && "bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:opacity-90"
                )}
                onClick={() => navigate('/app/subscription')}
              >
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                Ver benefícios
              </Button>
              <span className="text-xs text-muted-foreground">
                7 dias de garantia
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Hook para verificar se usuário tem acesso a uma feature
export function useFeatureAccess(requiredPlan: 'pro' | 'business', currentPlan?: string) {
  const plan = currentPlan || 'free';
  
  if (requiredPlan === 'pro') {
    return plan === 'pro' || plan === 'business';
  }
  
  if (requiredPlan === 'business') {
    return plan === 'business';
  }
  
  return true;
}
