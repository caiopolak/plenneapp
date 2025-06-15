
import React, { useState } from 'react';
import { AuthBranding } from './AuthBranding';
import { AuthTabs } from './AuthTabs';
import { ResetPasswordForm } from './ResetPasswordForm';
import { CheckCircle, Star, Activity, Users } from "lucide-react";

const PLENNE_BENEFITS = [
  {
    icon: <Activity className="text-green-700" />,
    title: "Automatizado & Inteligente",
    description: "Análise inteligente dos seus hábitos financeiros, dicas em tempo real e alertas personalizados.",
  },
  {
    icon: <Star className="text-primary" />,
    title: "Metas & Objetivos",
    description: "Defina suas metas e acompanhe seu progresso com clareza e motivação.",
  },
  {
    icon: <Users className="text-graphite" />,
    title: "Para todas as Famílias",
    description: "Compartilhe planos e relatórios, organize orçamentos em grupo.",
  },
  {
    icon: <CheckCircle className="text-green-700" />,
    title: "Segurança & Privacidade",
    description: "Dados protegidos com criptografia e privacidade total. Nunca compartilhados.",
  },
];

export function AuthForm() {
  const [forgotPassword, setForgotPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f4f4f4] via-[#eaf6ee] to-white px-2 py-14">
      <div className="flex flex-col-reverse md:flex-row w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border-2 border-[#2f9e44]/15 animate-scale-in relative bg-white/95">
        {/* Branding & Informativo */}
        <div className="w-full md:w-1/2 flex flex-col bg-[#f4f4f4] p-0 md:p-6 md:justify-center">
          <AuthBranding />
          <div className="my-4" />
          <div className="flex flex-col gap-4 md:gap-6 px-4 md:px-1 pb-8">
            <span className="uppercase tracking-widest text-xs text-green-700 font-bold font-inter">
              Por que usar a Plenne?
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {PLENNE_BENEFITS.map(({ icon, title, description }) => (
                <div
                  key={title}
                  className="flex flex-col rounded-lg bg-white px-4 py-3 shadow-card border border-graphite/8 transition hover:scale-105 hover:shadow-lg hover:border-green-700/30"
                >
                  <div className="flex items-center mb-2 gap-2">
                    {icon}
                    <span className="font-bold text-graphite font-poppins">{title}</span>
                  </div>
                  <span className="text-xs text-graphite/70 font-inter">{description}</span>
                </div>
              ))}
            </div>
            <div className="hidden md:block mt-6 text-center">
              <span className="slogan drop-shadow-none text-xl font-display font-semibold text-green-700">
                “Sua vida financeira, <strong>plena</strong>.”
              </span>
              <span className="block text-primary/90 font-inter font-medium text-sm mt-2">
                Venha experimentar a inteligência financeira feita para pessoas e famílias de verdade.
              </span>
            </div>
            <div className="flex flex-col gap-1 text-xs text-graphite/70 text-center mt-3">
              <span>Sem custos ocultos. Não usamos laranja. Segurança em primeiro lugar.</span>
              <span>
                <span className="font-bold font-highlight text-green-700">Plenne</span>: atitude e clareza para você prosperar.
              </span>
            </div>
          </div>
        </div>
        {/* Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center px-5 py-10 bg-white bg-opacity-100">
          <div className="w-full animate-fade-in">
            {forgotPassword ? (
              <ResetPasswordForm onBack={() => setForgotPassword(false)} />
            ) : (
              <AuthTabs onForgot={() => setForgotPassword(true)} />
            )}
            <div className="block md:hidden mt-7 text-center">
              <span className="slogan drop-shadow-none text-lg font-display text-green-700">
                “Sua vida financeira, <strong>plena</strong>.”
              </span>
              <span className="block text-primary/90 font-inter text-xs mt-1">
                Inteligência financeira feita pra você e sua família.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
