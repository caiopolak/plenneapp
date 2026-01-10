import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Bot, Infinity, Crown, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAssistantUsage } from '@/hooks/useAssistantUsage';

interface AssistantUsageCounterProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export function AssistantUsageCounter({ variant = 'compact', className }: AssistantUsageCounterProps) {
  const navigate = useNavigate();
  const { usage, isLoading } = useAssistantUsage();

  if (isLoading) return null;

  const isUnlimited = usage.maxCount === -1;
  const percentage = isUnlimited ? 100 : (usage.currentCount / usage.maxCount) * 100;
  const isNearLimit = !isUnlimited && usage.remaining <= 2;
  const isAtLimit = !isUnlimited && usage.remaining === 0;

  if (variant === 'compact') {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          "gap-1 px-2 py-0.5",
          isAtLimit && "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400",
          isNearLimit && !isAtLimit && "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400",
          !isNearLimit && !isAtLimit && "bg-muted",
          className
        )}
      >
        <Bot className="h-3 w-3" />
        {isUnlimited ? (
          <>
            <Infinity className="h-3 w-3" />
            <span className="text-[10px]">Ilimitado</span>
          </>
        ) : (
          <span className="text-[10px] font-mono">
            {usage.currentCount}/{usage.maxCount}
          </span>
        )}
      </Badge>
    );
  }

  return (
    <div className={cn("space-y-2 p-3 rounded-lg border bg-card", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Perguntas do Assistente IA</span>
        </div>
        <Badge 
          variant="outline" 
          className={cn(
            "text-[10px]",
            usage.plan === 'business' && "bg-amber-500/10 border-amber-500/30 text-amber-600",
            usage.plan === 'pro' && "bg-primary/10 border-primary/30 text-primary"
          )}
        >
          {usage.plan.toUpperCase()}
        </Badge>
      </div>

      {isUnlimited ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Infinity className="h-4 w-4 text-amber-500" />
          <span>Perguntas ilimitadas</span>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-xs">
            <span className={cn(
              isAtLimit && "text-red-600 dark:text-red-400 font-medium",
              isNearLimit && !isAtLimit && "text-amber-600 dark:text-amber-400"
            )}>
              {usage.currentCount} de {usage.maxCount} usadas
            </span>
            <span className="text-muted-foreground">
              {usage.remaining} restantes
            </span>
          </div>
          
          <Progress 
            value={percentage} 
            className={cn(
              "h-1.5",
              isAtLimit && "[&>div]:bg-red-500",
              isNearLimit && !isAtLimit && "[&>div]:bg-amber-500"
            )} 
          />

          {(isAtLimit || isNearLimit) && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-2 text-xs"
              onClick={() => navigate('/app/plans')}
            >
              <Crown className="h-3 w-3 mr-1" />
              {isAtLimit ? 'Fazer Upgrade para mais perguntas' : 'Considere fazer upgrade'}
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </>
      )}
    </div>
  );
}