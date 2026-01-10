import React, { ReactNode } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle, Info, Lightbulb, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureTooltipProps {
  title: string;
  description: string;
  tips?: string[];
  children?: ReactNode;
  icon?: 'help' | 'info' | 'lightbulb' | 'sparkles';
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function FeatureTooltip({ 
  title,
  description,
  tips,
  children,
  icon = 'help',
  side = 'top',
  className
}: FeatureTooltipProps) {
  const icons = {
    help: HelpCircle,
    info: Info,
    lightbulb: Lightbulb,
    sparkles: Sparkles
  };

  const IconComponent = icons[icon];

  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>
        {children || (
          <button 
            type="button"
            className={cn(
              "inline-flex items-center justify-center",
              "text-muted-foreground/60 hover:text-muted-foreground transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full",
              "hover:bg-muted/50 p-0.5",
              className
            )}
            aria-label={`Ajuda: ${title}`}
          >
            <IconComponent className="w-4 h-4" />
          </button>
        )}
      </TooltipTrigger>
      <TooltipContent 
        side={side} 
        className="max-w-xs p-3 z-50"
        sideOffset={8}
      >
        <div className="space-y-2">
          <p className="font-semibold text-foreground flex items-center gap-1.5">
            <IconComponent className="w-3.5 h-3.5 text-primary" />
            {title}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
          {tips && tips.length > 0 && (
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs font-medium text-primary mb-1 flex items-center gap-1">
                <Lightbulb className="w-3 h-3" />
                Dicas:
              </p>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-primary">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

// Biblioteca de tooltips pré-definidos para funcionalidades do app
export const featureTooltips = {
  // Dashboard
  dashboard: {
    title: 'Dashboard',
    description: 'Visão geral completa das suas finanças com resumos, gráficos e indicadores importantes.',
    tips: [
      'Clique nos cards para ver detalhes',
      'Use as abas para alternar entre visões',
      'O saldo é atualizado em tempo real'
    ]
  },
  financialHealth: {
    title: 'Saúde Financeira',
    description: 'Score de 0 a 100 que avalia sua situação financeira com base em poupança, metas e gastos.',
    tips: [
      'Acima de 70 é considerado excelente',
      'Melhore guardando mais e gastando menos',
      'Complete suas metas para aumentar o score'
    ]
  },
  savingsRate: {
    title: 'Taxa de Poupança',
    description: 'Percentual da sua renda que você consegue guardar após todas as despesas.',
    tips: [
      'Ideal: acima de 20% da renda',
      'Bom: entre 10% e 20%',
      'Atenção: abaixo de 10%'
    ]
  },
  projectedBalance: {
    title: 'Saldo Projetado',
    description: 'Estimativa do seu saldo nos próximos 30 dias considerando transações agendadas e padrões de gastos.',
    tips: [
      'Baseado em transações recorrentes',
      'Considera seu histórico de gastos',
      'Atualizado automaticamente'
    ]
  },

  // Transações
  transactions: {
    title: 'Transações',
    description: 'Registre todas as suas receitas e despesas para ter controle total dos seus gastos.',
    tips: [
      'Categorize para melhor análise',
      'Use descrições claras',
      'Registre assim que a transação ocorrer'
    ]
  },
  recurringTransactions: {
    title: 'Transações Recorrentes',
    description: 'Configure transações que se repetem automaticamente (salário, aluguel, assinaturas).',
    tips: [
      'Escolha a frequência: diária, semanal ou mensal',
      'Defina uma data de término opcional',
      'Disponível nos planos Pro e Business'
    ]
  },
  scheduledTransactions: {
    title: 'Agendamento',
    description: 'Agende transações futuras para se planejar com antecedência.',
    tips: [
      'Ideal para contas a pagar',
      'Receba lembretes antes do vencimento',
      'Disponível nos planos Pro e Business'
    ]
  },

  // Metas
  goals: {
    title: 'Metas Financeiras',
    description: 'Defina objetivos financeiros e acompanhe seu progresso até alcançá-los.',
    tips: [
      'Seja específico no valor e prazo',
      'Divida metas grandes em menores',
      'Comemore cada conquista!'
    ]
  },
  goalDeposit: {
    title: 'Adicionar Valor',
    description: 'Registre depósitos na sua meta para acompanhar o progresso.',
    tips: [
      'Deposite regularmente para criar hábito',
      'Defina um valor fixo mensal',
      'Veja o histórico de depósitos'
    ]
  },

  // Investimentos
  investments: {
    title: 'Investimentos',
    description: 'Cadastre seus investimentos e acompanhe a evolução do seu patrimônio.',
    tips: [
      'Diversifique sua carteira',
      'Atualize os valores periodicamente',
      'Acompanhe a rentabilidade esperada'
    ]
  },
  expectedReturn: {
    title: 'Retorno Esperado',
    description: 'Projeção de rentabilidade anual baseada no tipo de investimento.',
    tips: [
      'Valores são estimativas',
      'Rentabilidade passada não garante futura',
      'Considere o risco de cada ativo'
    ]
  },

  // Orçamentos
  budgets: {
    title: 'Orçamentos',
    description: 'Defina limites de gastos por categoria para controlar melhor suas despesas.',
    tips: [
      'Baseie-se nos gastos dos últimos meses',
      'Comece com as maiores categorias',
      'Receba alertas ao atingir 80%'
    ]
  },
  budgetAlert: {
    title: 'Alerta de Orçamento',
    description: 'Você será notificado quando atingir 80% do limite definido para uma categoria.',
    tips: [
      'Ajuste os limites se necessário',
      'Revise gastos supérfluos',
      'Planeje melhor o próximo mês'
    ]
  },

  // Relatórios
  reports: {
    title: 'Relatórios',
    description: 'Gere relatórios detalhados em PDF ou exporte dados em CSV para análise.',
    tips: [
      'Escolha o período desejado',
      'Filtre por categorias',
      'Disponível nos planos Pro e Business'
    ]
  },

  // Assistente IA
  aiAssistant: {
    title: 'Assistente IA',
    description: 'Tire dúvidas sobre finanças pessoais com nosso assistente inteligente.',
    tips: [
      'Faça perguntas claras e específicas',
      'Peça dicas de economia',
      'Pergunte sobre investimentos'
    ]
  },

  // Alertas
  alerts: {
    title: 'Alertas Inteligentes',
    description: 'Receba notificações importantes sobre suas finanças automaticamente.',
    tips: [
      'Alertas de orçamento estourado',
      'Lembretes de metas próximas',
      'Dicas personalizadas'
    ]
  },

  // Workspaces
  workspaces: {
    title: 'Workspaces',
    description: 'Gerencie finanças separadas para você, sua família ou empresa.',
    tips: [
      'Cada workspace é independente',
      'Convide membros para colaborar',
      'Limite de membros varia por plano'
    ]
  },

  // Educação
  education: {
    title: 'Educação Financeira',
    description: 'Aprenda sobre finanças pessoais com módulos interativos e desafios.',
    tips: [
      'Complete módulos para ganhar badges',
      'Participe dos desafios semanais',
      'Aplique as dicas no dia a dia'
    ]
  },

  // Temas
  themes: {
    title: 'Temas',
    description: 'Personalize a aparência do app com diferentes paletas de cores.',
    tips: [
      'Temas Pro e Business são exclusivos',
      'Passe o mouse para pré-visualizar',
      'Funciona no modo claro e escuro'
    ]
  }
};

// Componente wrapper para adicionar tooltip a qualquer elemento
interface WithFeatureTooltipProps {
  feature: keyof typeof featureTooltips;
  children: ReactNode;
  showIcon?: boolean;
  iconPosition?: 'before' | 'after';
}

export function WithFeatureTooltip({ 
  feature, 
  children, 
  showIcon = true,
  iconPosition = 'after'
}: WithFeatureTooltipProps) {
  const tooltip = featureTooltips[feature];
  
  if (!tooltip) return <>{children}</>;

  return (
    <div className="inline-flex items-center gap-1">
      {showIcon && iconPosition === 'before' && (
        <FeatureTooltip {...tooltip} />
      )}
      {children}
      {showIcon && iconPosition === 'after' && (
        <FeatureTooltip {...tooltip} />
      )}
    </div>
  );
}
