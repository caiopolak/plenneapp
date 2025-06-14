
import React from "react";

/**
 * Plenne Logo: Círculo azul petróleo com folha (crescimento), fonte moderna.
 */
export function LogoPlenne({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width="38"
        height="38"
        viewBox="0 0 38 38"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <circle cx="19" cy="19" r="18" fill="#003f5c" stroke="#2f9e44" strokeWidth="2"/>
        {/* folha/crescimento */}
        <path d="M19 11c2.5 1.5 7 7 0 16" stroke="#2f9e44" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <ellipse cx="19" cy="11" rx="2.3" ry="2.1" fill="#2f9e44" />
      </svg>
      <span className="font-display font-extrabold text-2xl brand-gradient-text tracking-tight select-none">
        Plenne
      </span>
    </div>
  );
}

