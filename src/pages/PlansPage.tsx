import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Infinity,
  Loader2,
  ExternalLink,
  Star,
  Quote,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlanAccess } from '@/hooks/usePlanAccess';
import { useTrialStatus } from '@/hooks/useTrialStatus';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TrialBanner } from '@/components/subscription/TrialBanner';

// Tabela de comparação de features
const comparisonFeatures = [
  { 
    category: 'Transações', 
    icon: BarChart3,
    features: [
      { name: 'Transações por mês', free: '100', pro: '500', business: 'Ilimitadas' },
      { name: 'Agendamento', free: false, pro: true, business: true },
      { name: 'Recorrência automática', free: false, pro: true, business: true },
      { name: 'Importação CSV', free: true, pro: true, business: true },
    ]
  },
  { 
    category: 'Metas & Investimentos', 
    icon: Target,
    features: [
      { name: 'Metas financeiras', free: '3', pro: '15', business: 'Ilimitadas' },
      { name: 'Investimentos', free: '5', pro: '25', business: 'Ilimitados' },
      { name: 'Análise de rentabilidade', free: false, pro: true, business: true },
      { name: 'Projeções avançadas', free: false, pro: true, business: true },
    ]
  },
  { 
    category: 'Relatórios', 
    icon: FileText,
    features: [
      { name: 'Dashboard básico', free: true, pro: true, business: true },
      { name: 'Exportação PDF', free: false, pro: true, business: true },
      { name: 'Exportação CSV', free: false, pro: true, business: true },
      { name: 'Relatórios consolidados', free: false, pro: true, business: true },
    ]
  },
  { 
    category: 'Assistente IA', 
    icon: Bot,
    features: [
      { name: 'Perguntas por mês', free: '5', pro: '50', business: 'Ilimitadas' },
      { name: 'Análise personalizada', free: false, pro: true, business: true },
      { name: 'Recomendações IA', free: false, pro: true, business: true },
    ]
  },
  { 
    category: 'Workspaces', 
    icon: Users,
    features: [
      { name: 'Workspaces', free: '1', pro: '3', business: '10' },
      { name: 'Membros por workspace', free: '1', pro: '3', business: '10' },
      { name: 'Convites por email', free: false, pro: true, business: true },
    ]
  },
  { 
    category: 'Personalização', 
    icon: Palette,
    features: [
      { name: 'Temas básicos', free: '5', pro: '5', business: '5' },
      { name: 'Temas Pro', free: false, pro: '8', business: '8' },
      { name: 'Temas Premium', free: false, pro: false, business: '7' },
      { name: 'Modo escuro', free: true, pro: true, business: true },
    ]
  },
  { 
    category: 'Suporte', 
    icon: Shield,
    features: [
      { name: 'Email', free: '48h', pro: '24h', business: '12h' },
      { name: 'Chat prioritário', free: false, pro: true, business: true },
      { name: 'WhatsApp dedicado', free: false, pro: false, business: true },
    ]
  },
];

// Depoimentos
const testimonials = [
  {
    name: 'Maria Silva',
    role: 'Empresária',
    plan: 'business',
    avatar: 'MS',
    content: 'O Plenne transformou a gestão financeira da minha empresa. Com os workspaces separados, consigo gerenciar pessoal e empresarial sem confusão.',
    rating: 5
  },
  {
    name: 'João Santos',
    role: 'Desenvolvedor',
    plan: 'pro',
    avatar: 'JS',
    content: 'Uso o plano Pro há 6 meses e já economizei mais de R$2.000 só identificando gastos desnecessários. O assistente IA é incrível!',
    rating: 5
  },
  {
    name: 'Ana Costa',
    role: 'Designer',
    plan: 'pro',
    avatar: 'AC',
    content: 'Finalmente consegui alcançar minhas metas financeiras! Os relatórios em PDF são perfeitos para meu planejamento.',
    rating: 5
  },
  {
    name: 'Carlos Ferreira',
    role: 'Contador',
    plan: 'business',
    avatar: 'CF',
    content: 'Recomendo o Plenne para todos os meus clientes. A organização por workspaces e o suporte dedicado fazem toda diferença.',
    rating: 5
  },
];

// Planos
const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 'R$ 0',
    period: '',
    description: 'Perfeito para começar',
    icon: Sparkles,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    borderColor: 'border-border',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'R$ 19,90',
    period: '/mês',
    description: 'Para quem leva a sério',
    icon: Crown,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary',
    popular: true
  },
  {
    id: 'business',
    name: 'Business',
    price: 'R$ 49,90',
    period: '/mês',
    description: 'Para famílias e empresas',
    icon: Building2,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500',
  },
];

function FeatureCell({ value, planId }: { value: string | boolean; planId: string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="h-5 w-5 text-green-500 mx-auto" />
    ) : (
      <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />
    );
  }
  
  const isUnlimited = value.includes('Ilimitad');
  
  return (
    <span className={cn(
      "text-sm font-medium text-center",
      isUnlimited && planId === 'business' && "text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1"
    )}>
      {isUnlimited ? (
        <>
          <Infinity className="h-4 w-4" />
          <span>Ilimitado</span>
        </>
      ) : value}
    </span>
  );
}

export default function PlansPage() {
  const { currentPlan, isFree, isPro, isBusiness } = usePlanAccess();
  const { isOnTrial, trialDaysRemaining, canStartTrial, startTrial } = useTrialStatus();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [startingTrial, setStartingTrial] = useState(false);

  const handleStartTrial = async () => {
    setStartingTrial(true);
    try {
      const success = await startTrial();
      if (success) {
        toast({
          title: "🎉 Trial Pro Ativado!",
          description: "Você tem 7 dias para explorar todos os recursos Pro gratuitamente!"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Não foi possível ativar o trial",
          description: "Você já utilizou seu trial gratuito anteriormente."
        });
      }
    } finally {
      setStartingTrial(false);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    if (planId === currentPlan) return;
    if (planId === 'free') return;

    setLoadingPlan(planId);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: planId }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Checkout aberto!",
          description: "Complete sua assinatura na nova aba."
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível iniciar o checkout."
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Trial Banner */}
      {isOnTrial && <TrialBanner daysRemaining={trialDaysRemaining} />}

      {/* Header */}
      <div className="text-center space-y-4">
        <Badge variant="outline" className="text-xs px-3 py-1">
          Escolha o plano ideal para você
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight brand-gradient-text">
          Planos & Preços
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Comece gratuitamente e evolua conforme suas necessidades financeiras crescem.
        </p>
        
        {/* CTA Trial */}
        {canStartTrial && isFree && (
          <div className="pt-4">
            <Button 
              size="lg"
              onClick={handleStartTrial}
              disabled={startingTrial}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              {startingTrial ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Crown className="h-4 w-4 mr-2" />
              )}
              Experimentar Pro Grátis por 7 Dias
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>

      {/* Plans Cards */}
      <div className="grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id;
          const isLoading = loadingPlan === plan.id;
          const PlanIcon = plan.icon;
          
          return (
            <Card 
              key={plan.id}
              className={cn(
                "relative overflow-hidden transition-all duration-300 hover:shadow-xl",
                plan.popular && "scale-105 z-10 ring-2 ring-primary",
                isCurrentPlan && !plan.popular && "ring-2 ring-green-500",
                plan.borderColor
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                  Mais Popular
                </div>
              )}
              
              {isCurrentPlan && (
                <div className="absolute top-0 left-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-br-lg flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  {isOnTrial ? 'Trial Ativo' : 'Seu Plano'}
                </div>
              )}

              <CardHeader className="pb-4 pt-8">
                <div className={cn("p-3 rounded-xl w-fit mb-4", plan.bgColor)}>
                  <PlanIcon className={cn("h-6 w-6", plan.color)} />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                
                <div className="flex items-baseline gap-1 pt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground">{plan.period}</span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <Button
                  className={cn(
                    "w-full",
                    plan.id === 'pro' && "bg-gradient-to-r from-primary to-secondary",
                    plan.id === 'business' && "bg-gradient-to-r from-amber-500 to-yellow-500 text-white"
                  )}
                  variant={plan.id === 'free' ? 'outline' : 'default'}
                  disabled={isCurrentPlan || isLoading}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isCurrentPlan ? (
                    isOnTrial ? `Trial (${trialDaysRemaining} dias)` : 'Plano Atual'
                  ) : plan.id === 'free' ? (
                    'Plano Gratuito'
                  ) : (
                    <>
                      Assinar {plan.name}
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Comparison Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl">Comparação Detalhada</CardTitle>
          <CardDescription>
            Veja todas as funcionalidades disponíveis em cada plano
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium text-muted-foreground w-1/4">Recurso</th>
                  <th className="text-center p-4 font-medium w-1/4">
                    <div className="flex flex-col items-center gap-1">
                      <Sparkles className="h-5 w-5 text-muted-foreground" />
                      <span>Free</span>
                    </div>
                  </th>
                  <th className="text-center p-4 font-medium w-1/4 bg-primary/5">
                    <div className="flex flex-col items-center gap-1">
                      <Crown className="h-5 w-5 text-primary" />
                      <span className="text-primary">Pro</span>
                    </div>
                  </th>
                  <th className="text-center p-4 font-medium w-1/4">
                    <div className="flex flex-col items-center gap-1">
                      <Building2 className="h-5 w-5 text-amber-500" />
                      <span className="text-amber-600 dark:text-amber-400">Business</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((category) => (
                  <React.Fragment key={category.category}>
                    <tr className="bg-muted/30">
                      <td colSpan={4} className="p-3">
                        <div className="flex items-center gap-2 font-semibold">
                          <category.icon className="h-4 w-4 text-primary" />
                          {category.category}
                        </div>
                      </td>
                    </tr>
                    {category.features.map((feature) => (
                      <tr key={feature.name} className="border-b hover:bg-muted/20">
                        <td className="p-3 text-sm">{feature.name}</td>
                        <td className="p-3 text-center">
                          <FeatureCell value={feature.free} planId="free" />
                        </td>
                        <td className="p-3 text-center bg-primary/5">
                          <FeatureCell value={feature.pro} planId="pro" />
                        </td>
                        <td className="p-3 text-center">
                          <FeatureCell value={feature.business} planId="business" />
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Testimonials */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">O que nossos usuários dizem</h2>
          <p className="text-muted-foreground">Histórias reais de quem transformou suas finanças</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {testimonials.map((testimonial, i) => (
            <Card key={i} className="relative">
              <CardContent className="pt-6">
                <Quote className="h-8 w-8 text-primary/20 absolute top-4 right-4" />
                
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm",
                    testimonial.plan === 'business' ? "bg-amber-500" : "bg-primary"
                  )}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground italic">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center gap-0.5 mt-3">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <Badge 
                  variant="outline" 
                  className={cn(
                    "mt-3 text-[10px]",
                    testimonial.plan === 'business' 
                      ? "border-amber-500/30 text-amber-600 dark:text-amber-400" 
                      : "border-primary/30 text-primary"
                  )}
                >
                  Plano {testimonial.plan === 'business' ? 'Business' : 'Pro'}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ CTA */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 py-6">
          <div>
            <h3 className="text-lg font-semibold">Ainda tem dúvidas?</h3>
            <p className="text-sm text-muted-foreground">
              Nossa equipe está pronta para ajudar você a escolher o melhor plano.
            </p>
          </div>
          <Button variant="outline" className="shrink-0">
            Falar com Suporte
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}