import React, { useState } from 'react';
import { AuthBranding } from './AuthBranding';
import { AuthTabs } from './AuthTabs';
import { ResetPasswordForm } from './ResetPasswordForm';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Target, 
  Users, 
  Shield, 
  TrendingUp,
  PiggyBank,
  BarChart3,
  Bot,
  Gift,
  CheckCircle2
} from "lucide-react";

const PLENNE_FEATURES = [
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Dashboard Completo",
    description: "Visualize receitas, despesas e saldo em tempo real.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: "Metas Financeiras",
    description: "Defina objetivos e acompanhe o progresso visualmente.",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: "Investimentos",
    description: "Gerencie sua carteira e acompanhe rentabilidade.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: <Bot className="w-5 h-5" />,
    title: "Assistente IA",
    description: "Tire dúvidas e receba recomendações personalizadas.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Workspaces",
    description: "Gerencie pessoal, família e empresa separadamente.",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "100% Seguro",
    description: "Dados criptografados e protegidos com Supabase.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
];

const PLAN_HIGHLIGHTS = [
  { text: 'Dashboard completo grátis', icon: CheckCircle2 },
  { text: 'Trial Pro de 7 dias', icon: Gift },
  { text: 'Assistente IA incluído', icon: Bot },
];

export function AuthForm() {
  const [forgotPassword, setForgotPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background px-4 py-8">
      <div className="flex flex-col lg:flex-row w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden border border-border/50 animate-scale-in bg-card">
        
        {/* Lado esquerdo - Branding e Features */}
        <div className="w-full lg:w-1/2 flex flex-col bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-6 lg:p-8">
          <AuthBranding />
          
          {/* Trial Banner */}
          <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <Gift className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Experimente o Pro Grátis!</span>
              <Badge variant="secondary" className="text-[9px] bg-primary/20 text-primary">7 DIAS</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Novos usuários ganham acesso a todos os recursos Pro por 7 dias.
            </p>
          </div>
          
          {/* Features Grid */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
                O que você pode fazer
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PLENNE_FEATURES.map(({ icon, title, description, color, bgColor }) => (
                <div
                  key={title}
                  className="group flex flex-col rounded-xl bg-card/80 backdrop-blur-sm p-4 border border-border/50 transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${bgColor}`}>
                      <span className={color}>{icon}</span>
                    </div>
                    <span className="font-semibold text-sm text-foreground">{title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground leading-relaxed">{description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Plan Highlights */}
          <div className="mt-6 flex flex-wrap gap-2">
            {PLAN_HIGHLIGHTS.map((item, i) => (
              <Badge key={i} variant="outline" className="gap-1 text-[10px] bg-muted/50">
                <item.icon className="w-3 h-3" />
                {item.text}
              </Badge>
            ))}
          </div>

          {/* Footer do lado esquerdo */}
          <div className="mt-auto pt-6 text-center hidden lg:block">
            <p className="text-xs text-muted-foreground">
              Mais de <span className="font-bold text-primary">10.000 usuários</span> já transformaram suas finanças
            </p>
          </div>
        </div>

        {/* Lado direito - Formulário */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-10 lg:px-10 bg-card">
          <div className="w-full max-w-sm mx-auto animate-fade-in">
            {/* Header do formulário */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground font-display">
                {forgotPassword ? 'Recuperar Senha' : 'Bem-vindo ao Plenne!'}
              </h2>
              <p className="text-muted-foreground text-sm mt-2">
                {forgotPassword 
                  ? 'Digite seu email para recuperar o acesso'
                  : 'Acesse sua conta ou crie uma nova para começar a organizar suas finanças'
                }
              </p>
            </div>

            {forgotPassword ? (
              <ResetPasswordForm onBack={() => setForgotPassword(false)} />
            ) : (
              <AuthTabs onForgot={() => setForgotPassword(true)} />
            )}

            {/* Termos e políticas */}
            <div className="mt-8 text-center">
              <p className="text-xs text-muted-foreground">
                Ao continuar, você concorda com nossos{' '}
                <a href="#" className="text-primary hover:underline">Termos de Uso</a>
                {' '}e{' '}
                <a href="#" className="text-primary hover:underline">Política de Privacidade</a>
              </p>
            </div>

            {/* Slogan mobile */}
            <div className="block lg:hidden mt-8 text-center">
              <p className="text-sm font-display text-primary font-semibold">
                "Sua vida financeira, <span className="text-secondary">plena</span>."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}