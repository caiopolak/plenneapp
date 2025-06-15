
import React from "react";

/**
 * Logo Plenne: ícone de folha com gradiente + nome Plenne com degradê, usado na sidebar e áreas de branding.
 */
export function LogoPlenne({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Ícone de folha/financeiro estilizado */}
      <span className="bg-gradient-to-tr from-primary via-secondary to-attention rounded-full p-2 flex items-center justify-center shadow transition">
        <svg width="26" height="26" viewBox="0 0 30 30" fill="none" aria-hidden>
          <circle cx="15" cy="15" r="13" fill="url(#circle-gradient)" />
          <path d="M15 9c3 2 7 8 0 15" stroke="#38b000" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <ellipse cx="15" cy="9" rx="2.1" ry="1.7" fill="#38b000" />
          <defs>
            <linearGradient id="circle-gradient" x1="0" y1="0" x2="30" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#003f5c" />
              <stop offset="1" stopColor="#2196f3" />
            </linearGradient>
          </defs>
        </svg>
      </span>
      <span className="font-display font-extrabold text-2xl brand-gradient-text tracking-tight">
        Plenne
      </span>
    </div>
  );
}
