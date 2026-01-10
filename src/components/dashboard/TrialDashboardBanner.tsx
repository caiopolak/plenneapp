import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Crown, Clock, ArrowRight, Sparkles, Gift, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useTrialStatus } from '@/hooks/useTrialStatus';
import { usePlanAccess } from '@/hooks/usePlanAccess';

export function TrialDashboardBanner() {
  const navigate = useNavigate();
  const { isOnTrial, trialDaysRemaining, canStartTrial, startTrial, isStartingTrial } = useTrialStatus();
  const { isFree } = usePlanAccess();

  // Se não está em trial e não pode iniciar, não mostra nada
  if (!isOnTrial && !canStartTrial) return null;

  // Se pode iniciar trial (novo usuário)
  if (canStartTrial && isFree) {
    return (
      <Card className="overflow-hidden border-primary/30 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 py-5">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/20">
              <Gift className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">🎁 Experimente o Plano Pro Grátis!</h3>
                <Badge variant="secondary" className="text-[10px] bg-primary/20 text-primary">
                  7 DIAS
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Desbloqueie relatórios avançados, 50 perguntas IA, temas exclusivos e muito mais.
              </p>
            </div>
          </div>
          
          <Button 
            onClick={async () => {
              await startTrial();
              window.location.reload();
            }}
            disabled={isStartingTrial}
            className="shrink-0 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
          >
            {isStartingTrial ? (
              'Ativando...'
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Ativar Trial Grátis
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Se está em trial ativo
  if (isOnTrial) {
    const isUrgent = trialDaysRemaining <= 2;
    const progressValue = ((7 - trialDaysRemaining) / 7) * 100;

    return (
      <Card className={cn(
        "overflow-hidden",
        isUrgent 
          ? "border-red-500/30 bg-gradient-to-r from-red-500/10 to-orange-500/10" 
          : "border-primary/30 bg-gradient-to-r from-primary/10 to-secondary/10"
      )}>
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className={cn(
                "p-2.5 rounded-xl shrink-0",
                isUrgent ? "bg-red-500/20" : "bg-primary/20"
              )}>
                <Crown className={cn(
                  "h-5 w-5",
                  isUrgent ? "text-red-500" : "text-primary"
                )} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-semibold">
                    {isUrgent ? '⚠️ Seu Trial Pro está acabando!' : '🎉 Trial Pro Ativo'}
                  </span>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-[10px]",
                      isUrgent && "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
                    )}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {trialDaysRemaining} {trialDaysRemaining === 1 ? 'dia' : 'dias'} restantes
                  </Badge>
                </div>
                
                <div className="flex items-center gap-3 mt-2">
                  <Progress 
                    value={progressValue} 
                    className={cn(
                      "h-1.5 flex-1 max-w-xs",
                      isUrgent && "[&>div]:bg-red-500"
                    )} 
                  />
                  <span className="text-xs text-muted-foreground shrink-0">
                    {isUrgent 
                      ? 'Assine para não perder acesso!' 
                      : 'Aproveite todos os recursos Pro'}
                  </span>
                </div>
              </div>
            </div>

            <Button 
              onClick={() => navigate('/app/plans')}
              size="sm"
              className={cn(
                "shrink-0",
                isUrgent 
                  ? "bg-red-500 hover:bg-red-600" 
                  : "bg-gradient-to-r from-primary to-secondary"
              )}
            >
              <Zap className="h-4 w-4 mr-1" />
              {isUrgent ? 'Assinar Agora' : 'Ver Planos'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}