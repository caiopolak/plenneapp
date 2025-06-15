
import React from "react";
import { DollarSign } from "lucide-react";

/**
 * Logo Plenne: Ícone $ + nome Plenne com degradê + slogan, usado na sidebar e áreas de branding.
 */
export function LogoPlenne({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Ícone de dólar estilizado */}
      <span className="bg-gradient-to-tr from-primary via-secondary to-attention rounded-full p-2 flex items-center justify-center shadow transition">
        <DollarSign className="w-7 h-7 text-green-600" />
      </span>
      <span className="font-display font-extrabold text-2xl brand-gradient-text tracking-tight">
        Plenne
      </span>
    </div>
  );
}
