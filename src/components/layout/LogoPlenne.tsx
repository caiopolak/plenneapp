
import React from "react";

/**
 * Logo Plenne: Ícone personalizado + nome Plenne com degradê + slogan, usado na sidebar e áreas de branding.
 */
export function LogoPlenne({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Logo personalizado */}
      <div
        className="rounded-full p-1 flex items-center justify-center shadow transition w-9 h-9 sm:w-10 sm:h-10"
        aria-label="Logo Plenne"
        role="img"
      >
        <img 
          src="/lovable-uploads/8ba11abe-a1cc-4724-9bd0-f9736d45ca65.png" 
          alt="Plenne Logo" 
          className="w-full h-full object-contain"
        />
      </div>
      <span className="font-display font-extrabold text-2xl brand-gradient-text tracking-tight">
        Plenne
      </span>
    </div>
  );
}
