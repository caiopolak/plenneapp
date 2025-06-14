
import React from "react";

/**
 * Logo tipográfico Plenne + símbolo (círculo pleno com folha/crescimento).
 * Simples, responsivo, preparado para ajustes.
 */
export function LogoPlenne({ showSymbol = true, className = "" }: { showSymbol?: boolean; className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showSymbol && (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="15" fill="#017F66" stroke="#F5B942" strokeWidth="2"/>
          <path d="M16 22c3-2.8 6-5.5 6-9A6 6 0 1016 22z" fill="#F5B942"/>
        </svg>
      )}
      <span className="font-poppins font-bold text-2xl tracking-tight text-[#017F66]">Plenne</span>
    </div>
  );
}
