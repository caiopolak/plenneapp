import React from 'react';
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
  Sun
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LogoPlenne } from '@/components/layout/LogoPlenne';

const features = [
  {
    icon: BarChart3,
    title: 'Transações Inteligentes',
    description: 'Controle receitas e despesas com categorização automática e insights em tempo real.',
    color: 'text-primary'
  },
  {
    icon: Target,
    title: 'Metas Financeiras',
    description: 'Defina objetivos, acompanhe o progresso e celebre cada conquista com confetes!',
    color: 'text-secondary'
  },
  {
    icon: TrendingUp,
    title: 'Investimentos',
    description: 'Visualize sua carteira completa com gráficos de evolução e rentabilidade.',
    color: 'text-[hsl(var(--chart-4))]'
  },
  {
    icon: PiggyBank,
    title: 'Orçamentos',
    description: 'Defina limites por categoria e receba alertas antes de estourar.',
    color: 'text-accent'
  },
  {
    icon: GraduationCap,
    title: 'Educação Financeira',
    description: 'Aprenda com módulos interativos, desafios e dicas personalizadas.',
    color: 'text-secondary'
  },
  {
    icon: MessageCircle,
    title: 'Assistente IA',
    description: 'Tire dúvidas financeiras com nosso assistente inteligente 24/7.',
    color: 'text-primary'
  }
];

const plans = [
  {
    name: 'Free',
    price: 'R$ 0',
    period: '/mês',
    description: 'Perfeito para começar sua jornada financeira',
    features: [
      '100 transações/mês',
      '3 metas financeiras',
      '5 investimentos',
      'Dashboard básico',
      'Temas básicos',
      'Suporte por email'
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
    features: [
      'Transações ilimitadas',
      'Metas ilimitadas',
      'Investimentos ilimitados',
      'Relatórios avançados',
      'Assistente IA ilimitado',
      'Temas Pro exclusivos',
      'Exportação PDF',
      'Suporte prioritário'
    ],
    cta: 'Assinar Pro',
    popular: true,
    gradient: 'from-primary/20 to-secondary/20'
  },
  {
    name: 'Business',
    price: 'R$ 49,90',
    period: '/mês',
    description: 'Para famílias e pequenas empresas',
    features: [
      'Tudo do Pro',
      'Workspaces ilimitados',
      'Até 10 membros',
      'Temas Business exclusivos',
      'Relatórios consolidados',
      'API de integração',
      'Suporte dedicado',
      'Treinamento personalizado'
    ],
    cta: 'Assinar Business',
    popular: false,
    gradient: 'from-[hsl(var(--chart-4))]/20 to-[hsl(var(--chart-5))]/20'
  }
];

const testimonials = [
  {
    name: 'Maria Silva',
    role: 'Empreendedora',
    content: 'Finalmente consegui organizar minhas finanças pessoais e do negócio. O Plenne mudou minha vida!',
    avatar: '👩‍💼'
  },
  {
    name: 'João Santos',
    role: 'Desenvolvedor',
    content: 'A interface é incrível e o assistente IA me ajuda a tomar decisões melhores sobre investimentos.',
    avatar: '👨‍💻'
  },
  {
    name: 'Ana Costa',
    role: 'Professora',
    content: 'Os módulos de educação financeira são excelentes. Recomendo para toda a família!',
    avatar: '👩‍🏫'
  }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoPlenne />
          </div>
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
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/app')}
              className="hidden sm:flex"
            >
              Entrar
            </Button>
            <Button 
              onClick={() => navigate('/app')}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              Começar Grátis
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto text-center relative z-10">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm bg-secondary/10 text-secondary border-secondary/30">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Novo: Assistente IA com Gemini
          </Badge>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            Suas finanças
            <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              simplificadas
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Controle transações, alcance metas, acompanhe investimentos e aprenda educação financeira. 
            Tudo em uma plataforma inteligente e intuitiva.
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
              Ferramentas poderosas e intuitivas para você tomar o controle da sua vida financeira
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur-sm"
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
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
                <p className="text-sm text-muted-foreground">Dados criptografados e protegidos com as melhores práticas de segurança.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 rounded-xl bg-card border border-border">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Rápido e Leve</h3>
                <p className="text-sm text-muted-foreground">Interface otimizada para performance em qualquer dispositivo.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 rounded-xl bg-card border border-border">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Workspaces</h3>
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
              Comece grátis e evolua conforme suas necessidades
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  plan.popular 
                    ? 'border-primary shadow-lg scale-105 z-10' 
                    : 'border-border hover:-translate-y-1'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg">
                    Mais Popular
                  </div>
                )}
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-50`} />
                <CardHeader className="relative z-10">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
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
                        <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-primary to-secondary hover:opacity-90' 
                        : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => navigate('/app')}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
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
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
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
          <Card className="max-w-4xl mx-auto overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-90" />
            <CardContent className="relative z-10 p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Comece a transformar suas finanças hoje
              </h2>
              <p className="text-white/80 max-w-xl mx-auto mb-8">
                Junte-se a milhares de pessoas que já estão no controle de suas finanças com o Plenne
              </p>
              <Button 
                size="lg" 
                onClick={() => navigate('/app')}
                className="bg-white text-primary hover:bg-white/90 text-lg px-8 h-14 rounded-xl shadow-lg"
              >
                Criar Conta Grátis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border bg-card">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <LogoPlenne />
              <span className="text-sm text-muted-foreground">
                © 2024 Plenne. Todos os direitos reservados.
              </span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Termos de Uso
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacidade
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contato
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
