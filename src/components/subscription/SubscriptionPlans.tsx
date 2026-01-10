import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { 
  Check, 
  X, 
  Crown, 
  Building2, 
  Sparkles, 
  TrendingUp,
  Target,
  BarChart3,
  FileText,
  Users,
  Bot,
  Palette,
  Shield,
  Zap,
  GraduationCap,
  Clock,
  Infinity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { InfoTooltip } from '@/components/ui/info-tooltip';

// Definição detalhada das features por plano
const planFeatures = {
  transactions: {
    label: 'Transações',
    icon: BarChart3,
    free: '100/mês',
    pro: '500/mês',
    business: 'Ilimitadas',
    tooltip: 'Quantidade de transações que você pode registrar por mês. Inclui receitas e despesas.'
  },
  goals: {
    label: 'Metas Financeiras',
    icon: Target,
    free: '3 metas',
    pro: '15 metas',
    business: 'Ilimitadas',
    tooltip: 'Objetivos financeiros que você pode criar e acompanhar simultaneamente.'
  },
  investments: {
    label: 'Investimentos',
    icon: TrendingUp,
    free: '5 ativos',
    pro: '25 ativos',
    business: 'Ilimitados',
    tooltip: 'Quantidade de investimentos que você pode registrar e monitorar.'
  },
  workspaces: {
    label: 'Workspaces',
    icon: Users,
    free: '1 pessoal',
    pro: '3 workspaces',
    business: '10 workspaces',
    tooltip: 'Espaços separados para gerenciar finanças pessoais, familiares ou empresariais.'
  },
  scheduling: {
    label: 'Agendamento',
    icon: Clock,
    free: false,
    pro: true,
    business: true,
    tooltip: 'Agende transações futuras e crie transações recorrentes automáticas.'
  },
  reports: {
    label: 'Relatórios PDF/CSV',
    icon: FileText,
    free: false,
    pro: true,
    business: true,
    tooltip: 'Exporte relatórios completos em PDF e dados em CSV para análise externa.'
  },
  aiAssistant: {
    label: 'Assistente IA',
    icon: Bot,
    free: '5 perguntas/mês',
    pro: '50 perguntas/mês',
    business: 'Ilimitado',
    tooltip: 'Tire dúvidas financeiras com nosso assistente inteligente powered by Gemini.'
  },
  themes: {
    label: 'Temas',
    icon: Palette,
    free: '5 básicos',
    pro: '+ 8 Pro',
    business: '+ 7 Premium',
    tooltip: 'Personalize a aparência do app com temas exclusivos.'
  },
  education: {
    label: 'Educação Financeira',
    icon: GraduationCap,
    free: 'Módulos básicos',
    pro: 'Todos os módulos',
    business: 'Premium + Mentoria',
    tooltip: 'Acesso a conteúdo educacional, desafios e dicas personalizadas.'
  },
  alerts: {
    label: 'Alertas Inteligentes',
    icon: Zap,
    free: 'Básicos',
    pro: 'Avançados',
    business: 'Personalizados',
    tooltip: 'Receba alertas sobre orçamentos, metas, gastos excessivos e oportunidades.'
  },
  support: {
    label: 'Suporte',
    icon: Shield,
    free: 'Email (48h)',
    pro: 'Prioritário (24h)',
    business: 'Dedicado + WhatsApp',
    tooltip: 'Tempo de resposta e canais de atendimento disponíveis.'
  },
  members: {
    label: 'Membros por Workspace',
    icon: Users,
    free: '1',
    pro: '3',
    business: '10',
    tooltip: 'Quantidade de pessoas que podem acessar cada workspace.'
  }
};

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 'R$ 0',
    period: '',
    description: 'Perfeito para começar sua jornada financeira',
    icon: Sparkles,
    gradient: 'from-muted/50 to-muted/30',
    borderColor: 'border-border',
    popular: false,
    cta: 'Plano Atual',
    highlights: [
      'Dashboard completo',
      'Controle básico de gastos',
      'Primeiros passos com metas',
      'Educação financeira básica'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'R$ 19,90',
    period: '/mês',
    description: 'Para quem leva as finanças a sério',
    icon: Crown,
    gradient: 'from-primary/20 to-secondary/20',
    borderColor: 'border-primary',
    popular: true,
    cta: 'Assinar Pro',
    highlights: [
      'Tudo do Free +',
      'Relatórios em PDF/CSV',
      'Agendamento de transações',
      'Assistente IA expandido',
      'Temas Pro exclusivos'
    ]
  },
  {
    id: 'business',
    name: 'Business',
    price: 'R$ 49,90',
    period: '/mês',
    description: 'Para famílias e pequenas empresas',
    icon: Building2,
    gradient: 'from-amber-500/20 to-yellow-500/20',
    borderColor: 'border-amber-500',
    popular: false,
    cta: 'Assinar Business',
    highlights: [
      'Tudo do Pro +',
      'Transações ilimitadas',
      'Até 10 membros por workspace',
      'Assistente IA ilimitado',
      'Suporte dedicado + WhatsApp',
      'Temas Premium exclusivos'
    ]
  }
];

function FeatureValue({ value, planId }: { value: string | boolean; planId: string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="h-4 w-4 text-green-500" />
    ) : (
      <X className="h-4 w-4 text-muted-foreground/50" />
    );
  }
  
  return (
    <span className={cn(
      "text-sm font-medium",
      planId === 'business' && "text-amber-600 dark:text-amber-400",
      planId === 'pro' && "text-primary",
      planId === 'free' && "text-muted-foreground"
    )}>
      {value === 'Ilimitadas' || value === 'Ilimitados' || value === 'Ilimitado' ? (
        <span className="flex items-center gap-1">
          <Infinity className="h-4 w-4" />
          <span>Ilimitado</span>
        </span>
      ) : value}
    </span>
  );
}

export function SubscriptionPlans() {
  const { subscription } = useProfile();
  const { toast } = useToast();
  const currentPlan = subscription?.plan || 'free';

  const handleSelectPlan = (planId: string) => {
    if (planId === currentPlan) {
      toast({
        title: "Plano Atual",
        description: "Você já está neste plano!"
      });
      return;
    }

    if (planId === 'free') {
      toast({
        title: "Downgrade",
        description: "Para fazer downgrade, entre em contato com nosso suporte."
      });
      return;
    }

    // TODO: Integração com Stripe
    toast({
      title: "Em breve!",
      description: `Integração de pagamento para o plano ${planId} será implementada em breve.`
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight brand-gradient-text">
          Escolha seu Plano
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Comece gratuitamente e evolua conforme suas necessidades. Todos os planos incluem 
          acesso ao dashboard completo e controle financeiro básico.
        </p>
      </div>

      {/* Cards de Planos */}
      <div className="grid lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id;
          const PlanIcon = plan.icon;
          
          return (
            <Card 
              key={plan.id}
              className={cn(
                "relative overflow-hidden transition-all duration-300 hover:shadow-xl",
                plan.popular && "scale-105 z-10",
                isCurrentPlan && "ring-2 ring-primary",
                plan.borderColor
              )}
            >
              {/* Background Gradient */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-50",
                plan.gradient
              )} />
              
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                  Mais Popular
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentPlan && (
                <div className="absolute top-0 left-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-br-lg flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Seu Plano
                </div>
              )}

              <CardHeader className="relative z-10 pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn(
                    "p-2.5 rounded-xl",
                    plan.id === 'free' && "bg-muted",
                    plan.id === 'pro' && "bg-primary/10",
                    plan.id === 'business' && "bg-amber-500/10"
                  )}>
                    <PlanIcon className={cn(
                      "h-6 w-6",
                      plan.id === 'free' && "text-muted-foreground",
                      plan.id === 'pro' && "text-primary",
                      plan.id === 'business' && "text-amber-500"
                    )} />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription className="text-xs">{plan.description}</CardDescription>
                  </div>
                </div>
                
                <div className="flex items-baseline gap-1 mt-4">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="relative z-10 space-y-4">
                {/* Highlights */}
                <div className="space-y-2">
                  {plan.highlights.map((highlight, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className={cn(
                        "h-4 w-4 shrink-0",
                        plan.id === 'business' && "text-amber-500",
                        plan.id === 'pro' && "text-primary",
                        plan.id === 'free' && "text-green-500"
                      )} />
                      <span className="text-sm text-foreground">{highlight}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button
                  className={cn(
                    "w-full mt-4",
                    plan.id === 'pro' && "bg-gradient-to-r from-primary to-secondary hover:opacity-90",
                    plan.id === 'business' && "bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:opacity-90"
                  )}
                  variant={plan.id === 'free' ? 'outline' : 'default'}
                  disabled={isCurrentPlan}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {isCurrentPlan ? 'Plano Atual' : plan.cta}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabela de Comparação Detalhada */}
      <Card className="mt-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Comparativo Detalhado
          </CardTitle>
          <CardDescription>
            Veja todas as funcionalidades disponíveis em cada plano
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Funcionalidade</th>
                  <th className="text-center py-3 px-4 font-medium">
                    <span className="text-muted-foreground">Free</span>
                  </th>
                  <th className="text-center py-3 px-4 font-medium">
                    <span className="text-primary flex items-center justify-center gap-1">
                      <Crown className="h-4 w-4" /> Pro
                    </span>
                  </th>
                  <th className="text-center py-3 px-4 font-medium">
                    <span className="text-amber-500 flex items-center justify-center gap-1">
                      <Building2 className="h-4 w-4" /> Business
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(planFeatures).map(([key, feature]) => {
                  const Icon = feature.icon;
                  return (
                    <tr key={key} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{feature.label}</span>
                          <InfoTooltip 
                            content={feature.tooltip}
                            iconClassName="h-3.5 w-3.5"
                          />
                        </div>
                      </td>
                      <td className="text-center py-3 px-4">
                        <FeatureValue value={feature.free} planId="free" />
                      </td>
                      <td className="text-center py-3 px-4 bg-primary/5">
                        <FeatureValue value={feature.pro} planId="pro" />
                      </td>
                      <td className="text-center py-3 px-4 bg-amber-500/5">
                        <FeatureValue value={feature.business} planId="business" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FAQ / Notas */}
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">💡 Por que assinar o Pro?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>O plano <strong className="text-primary">Pro</strong> é ideal para quem quer:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Agendar transações e criar recorrências automáticas</li>
              <li>Exportar relatórios profissionais em PDF</li>
              <li>Conversar mais com o Assistente IA</li>
              <li>Personalizar com temas exclusivos</li>
              <li>Ter suporte prioritário em 24h</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-amber-500" />
              Por que o Business é especial?
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>O plano <strong className="text-amber-500">Business</strong> oferece:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Transações ilimitadas</strong> - Sem preocupação com limites</li>
              <li><strong>Até 10 membros</strong> - Perfeito para famílias e empresas</li>
              <li><strong>Assistente IA ilimitado</strong> - Tire todas as suas dúvidas</li>
              <li><strong>Suporte via WhatsApp</strong> - Atendimento humanizado</li>
              <li><strong>Relatórios consolidados</strong> - Visão completa multi-workspace</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Garantia */}
      <div className="text-center py-8 border-t">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Shield className="h-5 w-5 text-green-500" />
          <span className="text-sm">
            <strong>Garantia de 7 dias</strong> - Cancele quando quiser, sem burocracia
          </span>
        </div>
      </div>
    </div>
  );
}
