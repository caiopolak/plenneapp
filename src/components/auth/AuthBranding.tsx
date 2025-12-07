import React from "react";
import { LogoPlenne } from "@/components/layout/LogoPlenne";
import { TrendingUp, Shield, Sparkles } from "lucide-react";

export function AuthBranding() {
  return (
    <div className="flex flex-col items-center justify-center w-full pt-8 pb-6 px-4">
      <div className="relative">
        <LogoPlenne className="scale-125 drop-shadow-lg" />
        <div className="absolute -top-2 -right-2">
          <Sparkles className="w-5 h-5 text-accent animate-pulse" />
        </div>
      </div>
      
      <h1 className="font-display text-3xl md:text-4xl font-extrabold text-foreground mt-6 mb-2 text-center">
        Plenne
      </h1>
      
      <p className="text-primary font-bold text-lg font-display">
        Sua vida financeira, <span className="text-secondary">plena.</span>
      </p>
      
      <p className="text-sm md:text-base mt-4 text-muted-foreground text-center max-w-sm leading-relaxed">
        A plataforma inteligente para você alcançar seus objetivos financeiros com clareza e tranquilidade.
      </p>

      {/* Stats rápidas */}
      <div className="flex items-center gap-6 mt-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-xs">+10k usuários</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Shield className="w-4 h-4 text-secondary" />
          <span className="text-xs">100% seguro</span>
        </div>
      </div>
    </div>
  );
}
