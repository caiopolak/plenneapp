import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface TrialBannerProps {
  daysRemaining: number;
  compact?: boolean;
}

export function TrialBanner({ daysRemaining, compact = false }: TrialBannerProps) {
  const navigate = useNavigate();
  const isUrgent = daysRemaining <= 2;

  if (compact) {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          "gap-1.5 px-2 py-1 cursor-pointer transition-all hover:scale-105",
          isUrgent 
            ? "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400" 
            : "bg-primary/10 border-primary/30 text-primary"
        )}
        onClick={() => navigate('/app/plans')}
      >
        <Crown className="h-3 w-3" />
        <span className="text-xs font-medium">
          Trial Pro: {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'}
        </span>
      </Badge>
    );
  }

  return (
    <Card className={cn(
      "overflow-hidden",
      isUrgent 
        ? "border-red-500/30 bg-gradient-to-r from-red-500/10 to-orange-500/10" 
        : "border-primary/30 bg-gradient-to-r from-primary/10 to-secondary/10"
    )}>
      <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            isUrgent ? "bg-red-500/20" : "bg-primary/20"
          )}>
            <Crown className={cn(
              "h-5 w-5",
              isUrgent ? "text-red-500" : "text-primary"
            )} />
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {isUrgent ? '⚠️ Seu trial Pro está acabando!' : '🎉 Você está no Trial Pro!'}
              </span>
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs",
                  isUrgent && "bg-red-500/20 text-red-600 dark:text-red-400"
                )}
              >
                <Clock className="h-3 w-3 mr-1" />
                {daysRemaining} {daysRemaining === 1 ? 'dia restante' : 'dias restantes'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {isUrgent 
                ? 'Assine agora para não perder acesso aos recursos Pro!' 
                : 'Aproveite todos os recursos Pro gratuitamente durante o trial.'}
            </p>
          </div>
        </div>

        <Button 
          onClick={() => navigate('/app/plans')}
          className={cn(
            "shrink-0",
            isUrgent 
              ? "bg-red-500 hover:bg-red-600" 
              : "bg-gradient-to-r from-primary to-secondary"
          )}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {isUrgent ? 'Assinar Agora' : 'Ver Planos'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}