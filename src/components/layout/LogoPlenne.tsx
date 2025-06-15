
import React from "react";

/**
 * Logo Plenne: Ícone 📊 + nome Plenne com degradê + slogan, usado na sidebar e áreas de branding.
 */
export function LogoPlenne({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Emoji gráfico (📊) estilizado */}
      <span
        className="bg-gradient-to-tr from-primary via-secondary to-attention rounded-full p-2 flex items-center justify-center shadow transition text-[1.7rem] sm:text-2xl w-9 h-9 sm:w-10 sm:h-10"
        aria-label="Logo gráfico de barras"
        role="img"
      >
        📊
      </span>
      <span className="font-display font-extrabold text-2xl brand-gradient-text tracking-tight">
        Plenne
      </span>
    </div>
  );
}
