import { ReactNode } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfoTooltipProps {
  content: ReactNode;
  children?: ReactNode;
  icon?: 'help' | 'info';
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  iconClassName?: string;
}

export function InfoTooltip({ 
  content, 
  children,
  icon = 'help',
  side = 'top',
  className,
  iconClassName
}: InfoTooltipProps) {
  const IconComponent = icon === 'help' ? HelpCircle : Info;

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        {children || (
          <button 
            type="button"
            className={cn(
              "inline-flex items-center justify-center",
              "text-muted-foreground hover:text-foreground transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full",
              className
            )}
          >
            <IconComponent className={cn("w-4 h-4", iconClassName)} />
          </button>
        )}
      </TooltipTrigger>
      <TooltipContent 
        side={side} 
        className="max-w-xs text-sm"
        sideOffset={8}
      >
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

// Pre-built tooltips for common cards
export const tooltips = {
  financialHealth: (
    <div className="space-y-2">
      <p className="font-medium">Pontuação de Saúde Financeira</p>
      <p>Calculada com base em:</p>
      <ul className="list-disc pl-4 space-y-1">
        <li>Taxa de poupança mensal</li>
        <li>Progresso das metas</li>
        <li>Diversificação de investimentos</li>
        <li>Controle de gastos</li>
      </ul>
    </div>
  ),
  savingsRate: (
    <div className="space-y-1">
      <p className="font-medium">Taxa de Poupança</p>
      <p>Percentual da sua renda que você consegue guardar. O ideal é poupar pelo menos 20% da renda mensal.</p>
    </div>
  ),
  monthlyBalance: (
    <div className="space-y-1">
      <p className="font-medium">Saldo do Mês</p>
      <p>Diferença entre suas receitas e despesas no mês atual. Um saldo positivo indica que você está gastando menos do que ganha.</p>
    </div>
  ),
  goalProgress: (
    <div className="space-y-1">
      <p className="font-medium">Progresso das Metas</p>
      <p>Mostra quanto você já guardou em relação ao objetivo total de cada meta financeira.</p>
    </div>
  ),
  upcomingTransactions: (
    <div className="space-y-1">
      <p className="font-medium">Próximas Transações</p>
      <p>Transações agendadas ou recorrentes previstas para os próximos 7 dias.</p>
    </div>
  ),
  projectedBalance: (
    <div className="space-y-1">
      <p className="font-medium">Saldo Projetado</p>
      <p>Estimativa do seu saldo nos próximos 30 dias, considerando transações agendadas e padrões de gastos.</p>
    </div>
  ),
  investmentReturn: (
    <div className="space-y-1">
      <p className="font-medium">Retorno Esperado</p>
      <p>Projeção de rentabilidade anual baseada no tipo de investimento e histórico de mercado.</p>
    </div>
  ),
  budgetLimit: (
    <div className="space-y-1">
      <p className="font-medium">Limite de Orçamento</p>
      <p>Valor máximo que você definiu para gastar nesta categoria durante o mês.</p>
    </div>
  )
};
