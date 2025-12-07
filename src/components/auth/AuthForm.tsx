import React, { useState } from 'react';
import { AuthBranding } from './AuthBranding';
import { AuthTabs } from './AuthTabs';
import { ResetPasswordForm } from './ResetPasswordForm';
import { 
  Sparkles, 
  Target, 
  Users, 
  Shield, 
  TrendingUp,
  PiggyBank,
  BarChart3
} from "lucide-react";

const PLENNE_FEATURES = [
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Dashboard Inteligente",
    description: "Visualize suas finanças com gráficos e análises em tempo real.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: "Metas & Projeções",
    description: "Defina objetivos e acompanhe o progresso com projeções inteligentes.",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: "Investimentos",
    description: "Gerencie sua carteira e analise a rentabilidade dos seus ativos.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: <PiggyBank className="w-5 h-5" />,
    title: "Orçamentos",
    description: "Controle seus gastos por categoria e evite surpresas no final do mês.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Workspaces Familiares",
    description: "Compartilhe planos e gerencie finanças em família ou equipe.",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Segurança Total",
    description: "Dados criptografados e protegidos. Sua privacidade é prioridade.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
];

export function AuthForm() {
  const [forgotPassword, setForgotPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background px-4 py-8">
      <div className="flex flex-col lg:flex-row w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden border border-border/50 animate-scale-in bg-card">
        
        {/* Lado esquerdo - Branding e Features */}
        <div className="w-full lg:w-1/2 flex flex-col bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-6 lg:p-8">
          <AuthBranding />
          
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
                {forgotPassword ? 'Recuperar Senha' : 'Bem-vindo de volta!'}
              </h2>
              <p className="text-muted-foreground text-sm mt-2">
                {forgotPassword 
                  ? 'Digite seu email para recuperar o acesso'
                  : 'Acesse sua conta ou crie uma nova para começar'
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
