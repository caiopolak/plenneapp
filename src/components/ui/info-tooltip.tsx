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
      <p className="font-medium">📊 Pontuação de Saúde Financeira</p>
      <p className="text-muted-foreground">Um score de 0 a 100 que avalia sua situação financeira com base em:</p>
      <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
        <li><strong>Taxa de poupança</strong> - quanto você guarda por mês</li>
        <li><strong>Progresso das metas</strong> - objetivos alcançados</li>
        <li><strong>Diversificação</strong> - variedade de investimentos</li>
        <li><strong>Controle de gastos</strong> - disciplina no orçamento</li>
      </ul>
      <p className="text-xs text-primary mt-2">💡 Acima de 70 pontos é considerado excelente!</p>
    </div>
  ),
  savingsRate: (
    <div className="space-y-2">
      <p className="font-medium">💰 Taxa de Poupança</p>
      <p className="text-muted-foreground">
        Percentual da sua renda mensal que você consegue guardar após todas as despesas.
      </p>
      <div className="text-xs space-y-1 mt-2">
        <p className="text-green-600">✓ Acima de 20% - Excelente</p>
        <p className="text-yellow-600">○ 10% a 20% - Bom, pode melhorar</p>
        <p className="text-red-600">✗ Abaixo de 10% - Atenção necessária</p>
      </div>
    </div>
  ),
  monthlyBalance: (
    <div className="space-y-2">
      <p className="font-medium">📈 Saldo do Mês</p>
      <p className="text-muted-foreground">
        Diferença entre suas receitas e despesas no mês atual.
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        Um saldo positivo significa que você está gastando menos do que ganha - continue assim!
      </p>
    </div>
  ),
  goalProgress: (
    <div className="space-y-2">
      <p className="font-medium">🎯 Progresso das Metas</p>
      <p className="text-muted-foreground">
        Acompanhe quanto já guardou em relação ao objetivo total. O sistema calcula automaticamente 
        quanto você precisa poupar por dia/mês para atingir cada meta no prazo.
      </p>
    </div>
  ),
  upcomingTransactions: (
    <div className="space-y-2">
      <p className="font-medium">📅 Próximas Transações</p>
      <p className="text-muted-foreground">
        Transações agendadas ou recorrentes previstas para os próximos 7 dias. 
        Planeje-se para não ser pego de surpresa!
      </p>
    </div>
  ),
  projectedBalance: (
    <div className="space-y-2">
      <p className="font-medium">🔮 Saldo Projetado</p>
      <p className="text-muted-foreground">
        Estimativa inteligente do seu saldo nos próximos 30 dias, considerando:
      </p>
      <ul className="list-disc pl-4 space-y-1 text-muted-foreground text-xs">
        <li>Transações agendadas</li>
        <li>Despesas recorrentes</li>
        <li>Padrões históricos de gastos</li>
      </ul>
    </div>
  ),
  investmentReturn: (
    <div className="space-y-2">
      <p className="font-medium">📊 Retorno Esperado</p>
      <p className="text-muted-foreground">
        Projeção de rentabilidade anual baseada no tipo de investimento. 
        Valores são estimativas e podem variar conforme o mercado.
      </p>
    </div>
  ),
  budgetLimit: (
    <div className="space-y-2">
      <p className="font-medium">🎯 Limite de Orçamento</p>
      <p className="text-muted-foreground">
        Valor máximo definido para gastar nesta categoria durante o mês. 
        Você receberá alertas ao atingir 80% do limite.
      </p>
    </div>
  )
};
