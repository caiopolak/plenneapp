import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  BarChart3, 
  Target, 
  PiggyBank, 
  TrendingUp, 
  Shield, 
  Zap,
  CheckCircle2,
  Star,
  Users,
  GraduationCap,
  MessageCircle,
  Sparkles,
  Moon,
  Sun,
  Loader2,
  Crown,
  Building2,
  HelpCircle,
  Gift
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LogoPlenne } from '@/components/layout/LogoPlenne';
import { useAuth } from '@/contexts/AuthContext';

const features = [
  {
    icon: BarChart3,
    title: 'Controle de Transações',
    description: 'Registre receitas e despesas com categorização automática. Visualize para onde vai seu dinheiro.',
    color: 'text-primary'
  },
  {
    icon: Target,
    title: 'Metas Financeiras',
    description: 'Defina objetivos como viagem, reserva de emergência ou aposentadoria. Acompanhe o progresso com gráficos.',
    color: 'text-secondary'
  },
  {
    icon: TrendingUp,
    title: 'Acompanhamento de Investimentos',
    description: 'Visualize sua carteira completa, acompanhe rentabilidade e evolução patrimonial.',
    color: 'text-[hsl(var(--chart-4))]'
  },
  {
    icon: PiggyBank,
    title: 'Orçamentos por Categoria',
    description: 'Defina limites mensais para cada categoria e receba alertas antes de estourar.',
    color: 'text-accent'
  },
  {
    icon: GraduationCap,
    title: 'Educação Financeira',
    description: 'Aprenda com módulos interativos, desafios semanais e dicas personalizadas baseadas no seu perfil.',
    color: 'text-secondary'
  },
  {
    icon: MessageCircle,
    title: 'Assistente IA',
    description: 'Tire dúvidas financeiras, peça análises e receba recomendações do nosso assistente com Gemini.',
    color: 'text-primary'
  }
];

const plans = [
  {
    name: 'Free',
    price: 'R$ 0',
    period: '',
    description: 'Perfeito para começar sua organização financeira',
    icon: Sparkles,
    features: [
      '100 transações por mês',
      '3 metas financeiras',
      '5 investimentos',
      '5 perguntas IA/mês',
      '5 temas básicos',
      'Dashboard completo'
    ],
    cta: 'Começar Grátis',
    popular: false,
    gradient: 'from-muted/50 to-muted/30'
  },
  {
    name: 'Pro',
    price: 'R$ 19,90',
    period: '/mês',
    description: 'Para quem leva as finanças a sério',
    icon: Crown,
    features: [
      '500 transações por mês',
      '15 metas financeiras',
      '25 investimentos',
      '50 perguntas IA/mês',
      '+ 8 temas Pro exclusivos',
      'Exportação PDF/CSV',
      'Agendamento de transações',
      'Suporte prioritário (24h)'
    ],
    cta: 'Experimentar 7 dias grátis',
    popular: true,
    gradient: 'from-primary/20 to-secondary/20'
  },
  {
    name: 'Business',
    price: 'R$ 49,90',
    period: '/mês',
    description: 'Para famílias e pequenas empresas',
    icon: Building2,
    features: [
      'Transações ilimitadas',
      'Metas e investimentos ilimitados',
      'Perguntas IA ilimitadas',
      '+ 7 temas Premium exclusivos',
      'Até 10 workspaces',
      'Até 10 membros por workspace',
      'Relatórios consolidados',
      'Suporte dedicado WhatsApp'
    ],
    cta: 'Assinar Business',
    popular: false,
    gradient: 'from-amber-500/20 to-yellow-500/20'
  }
];

const testimonials = [
  {
    name: 'Maria Silva',
    role: 'Empreendedora',
    content: 'O Plenne transformou a gestão do meu negócio. Com workspaces separados, finalmente organizei pessoal e empresa!',
    avatar: '👩‍💼',
    plan: 'Business'
  },
  {
    name: 'João Santos',
    role: 'Desenvolvedor',
    content: 'A interface é incrível e o assistente IA me ajuda a tomar decisões melhores. Já economizei R$2.000 em 6 meses!',
    avatar: '👨‍💻',
    plan: 'Pro'
  },
  {
    name: 'Ana Costa',
    role: 'Professora',
    content: 'Os módulos de educação financeira são excelentes! Uso com minha família e todos aprendemos juntos.',
    avatar: '👩‍🏫',
    plan: 'Pro'
  }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  useEffect(() => {
    if (!loading && user) {
      setIsRedirecting(true);
      const timer = setTimeout(() => {
        navigate('/app');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, loading, navigate]);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  if (isRedirecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
        <LogoPlenne />
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-lg">Entrando no Plenne...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <LogoPlenne />
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Funcionalidades
            </a>
            <a href="#plans" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Planos
            </a>
            <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Depoimentos
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="outline" onClick={() => navigate('/app')} className="hidden sm:flex">
              Entrar
            </Button>
            <Button onClick={() => navigate('/app')} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
              Começar Grátis
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto text-center relative z-10">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm bg-primary/10 text-primary border-primary/30">
            <Gift className="w-3.5 h-3.5 mr-1" />
            Trial Pro Grátis de 7 Dias
          </Badge>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            Suas finanças
            <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              simplificadas
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Controle transações, alcance metas, acompanhe investimentos e aprenda educação financeira. 
            Tudo em uma plataforma inteligente com assistente IA integrado.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              onClick={() => navigate('/app')}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg px-8 h-14 rounded-xl shadow-lg"
            >
              Começar Grátis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-lg px-8 h-14 rounded-xl"
            >
              Ver Funcionalidades
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-xl mx-auto mt-16">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-foreground">10k+</p>
              <p className="text-sm text-muted-foreground">Usuários Ativos</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-foreground">R$50M+</p>
              <p className="text-sm text-muted-foreground">Gerenciados</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-foreground">4.9</p>
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" /> Avaliação
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Funcionalidades</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Tudo que você precisa para
              <span className="text-primary"> organizar suas finanças</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ferramentas poderosas e intuitivas para você assumir o controle da sua vida financeira
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Features */}
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4 p-6 rounded-xl bg-card border border-border">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">100% Seguro</h3>
                <p className="text-sm text-muted-foreground">Dados criptografados com Supabase. Sua privacidade é nossa prioridade.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 rounded-xl bg-card border border-border">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Rápido e Responsivo</h3>
                <p className="text-sm text-muted-foreground">Funciona perfeitamente em celular, tablet ou computador.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 rounded-xl bg-card border border-border">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Workspaces Colaborativos</h3>
                <p className="text-sm text-muted-foreground">Gerencie finanças pessoais, familiares e empresariais separadamente.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Planos</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Escolha o plano ideal para você
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comece grátis e evolua conforme suas necessidades. Teste o Pro por 7 dias sem compromisso!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, index) => {
              const PlanIcon = plan.icon;
              return (
                <Card 
                  key={index} 
                  className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                    plan.popular ? 'border-primary shadow-lg scale-105 z-10' : 'border-border hover:-translate-y-1'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg">
                      Mais Popular
                    </div>
                  )}
                  <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-50`} />
                  <CardHeader className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <PlanIcon className={`w-5 h-5 ${plan.popular ? 'text-primary' : plan.name === 'Business' ? 'text-amber-500' : 'text-muted-foreground'}`} />
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                    </div>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <CardDescription className="mt-2">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className={`w-4 h-4 shrink-0 ${plan.popular ? 'text-primary' : plan.name === 'Business' ? 'text-amber-500' : 'text-secondary'}`} />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full ${
                        plan.popular ? 'bg-gradient-to-r from-primary to-secondary hover:opacity-90' : 
                        plan.name === 'Business' ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:opacity-90' : ''
                      }`}
                      variant={plan.popular || plan.name === 'Business' ? 'default' : 'outline'}
                      onClick={() => navigate('/app')}
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Depoimentos</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              O que nossos usuários dizem
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {testimonial.plan}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-primary/20 overflow-hidden">
            <CardContent className="flex flex-col md:flex-row items-center justify-between gap-8 py-12 px-8">
              <div className="text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Pronto para transformar suas finanças?
                </h2>
                <p className="text-muted-foreground">
                  Comece gratuitamente e experimente o Pro por 7 dias sem compromisso.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/app')}
                  className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Começar Agora
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-muted/50 border-t border-border">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <LogoPlenne />
            <nav className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">Funcionalidades</a>
              <a href="#plans" className="hover:text-foreground transition-colors">Planos</a>
              <Button variant="ghost" size="sm" onClick={() => navigate('/app')} className="gap-1">
                <HelpCircle className="h-4 w-4" />
                FAQ
              </Button>
            </nav>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Plenne. Todos os direitos reservados.</p>
            <p className="mt-2 text-xs">Sua vida financeira, plena.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}