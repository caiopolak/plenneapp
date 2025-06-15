
import React, { useState } from 'react';
import { AuthBranding } from './AuthBranding';
import { AuthTabs } from './AuthTabs';
import { ResetPasswordForm } from './ResetPasswordForm';
import { CheckCircle, Star, Activity, Users } from "lucide-react";

const PLENNE_BENEFITS = [
  {
    icon: <Activity className="text-[--electric]" />,
    title: "Automatizado & Inteligente",
    description: "Analise inteligente dos seus hábitos financeiros, com dicas em tempo real e alertas personalizados.",
  },
  {
    icon: <Star className="text-[--gold]" />,
    title: "Metas & Sonhos",
    description: "Defina objetivos financeiros e acompanhe seu progresso de forma visual e motivadora.",
  },
  {
    icon: <Users className="text-[--primary]" />,
    title: "Para todas as Famílias",
    description: "Compartilhe planos e relatórios, organize grupos de orçamento familiar e muito mais.",
  },
  {
    icon: <CheckCircle className="text-[--secondary]" />,
    title: "Segurança & Privacidade",
    description: "Seus dados protegidos com criptografia de ponta, auditados e nunca compartilhados.",
  },
];

export function AuthForm() {
  const [forgotPassword, setForgotPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#017F66]/95 via-[#0057FF]/55 to-[#fff9] px-1 py-7 select-none">
      <div className="flex flex-col-reverse md:flex-row w-full max-w-4xl bg-white/90 rounded-3xl shadow-2xl overflow-hidden border-2 border-[--primary]/20 animate-scale-in relative">
        {/* Informação sobre a Plenne e banners */}
        <div className="w-full md:w-1/2 flex flex-col gap-2 p-6 bg-gradient-to-br from-[--primary]/90 via-[--electric]/15 to-[--gold]/20 md:justify-center">
          <AuthBranding />
          <div className="my-8" />
          <div className="flex flex-col gap-4">
            <span className="uppercase tracking-widest text-xs text-[--electric] font-bold font-inter">
              Por que usar a Plenne?
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PLENNE_BENEFITS.map(({ icon, title, description }) => (
                <div
                  key={title}
                  className="flex flex-col rounded-xl bg-white/90 px-4 py-3 shadow-card border border-[--primary]/10 transition hover:scale-105 hover:shadow-accent hover:border-[--electric]/30"
                >
                  <div className="flex items-center mb-2 gap-2">
                    {icon}
                    <span className="font-bold text-[--primary] font-poppins">{title}</span>
                  </div>
                  <span className="text-xs text-[--primary]/80 font-inter">{description}</span>
                </div>
              ))}
            </div>
            <div className=" hidden md:block mt-10 text-center">
              <span className="slogan drop-shadow text-xl">
                “Sua vida financeira,<strong> plena</strong>.”
              </span>
              <span className="block text-[#fff9]/90 font-inter font-semibold text-sm mt-1">
                Experimente uma nova era em inteligência financeira pessoal.
              </span>
            </div>
          </div>
        </div>
        {/* Formulário - tela destacada */}
        <div className="w-full md:w-1/2 flex items-center justify-center px-5 py-8 bg-white bg-opacity-95">
          <div className="w-full animate-fade-in">
            {forgotPassword ? (
              <ResetPasswordForm onBack={() => setForgotPassword(false)} />
            ) : (
              <AuthTabs onForgot={() => setForgotPassword(true)} />
            )}
            <div className="block md:hidden mt-6 text-center">
              <span className="slogan drop-shadow text-lg">
                “Sua vida financeira, <strong>plena</strong>.”
              </span>
              <span className="block text-[--primary]/90 font-inter text-xs mt-1">
                Experimente uma nova era em inteligência financeira pessoal.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

