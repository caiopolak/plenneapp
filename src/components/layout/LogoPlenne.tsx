
import React from "react";

/**
 * Logo tipográfico Plenne + símbolo (círculo pleno com folha/crescimento).
 * Repaginado para a identidade "Plenne Neon".
 */
export function LogoPlenne({ showSymbol = true, className = "" }: { showSymbol?: boolean; className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showSymbol && (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="15" fill="var(--primary)" stroke="var(--accent)" strokeWidth="2"/>
          <path d="M16.1105 22.0439C18.6605 20.0439 21.2105 17.5439 21.2105 13.5439C21.2105 9.54392 18.0105 7.04392 16.1105 7.04392C14.2105 7.04392 11.0105 9.54392 11.0105 13.5439C11.0105 17.5439 13.5605 20.0439 16.1105 22.0439Z" fill="var(--accent)"/>
        </svg>
      )}
      <span className="font-display font-bold text-2xl tracking-tight text-white">Plenne</span>
    </div>
  );
}
