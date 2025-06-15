
import React from "react";
import { LogoPlenne } from "@/components/layout/LogoPlenne";
export function AuthBranding() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-br from-[--primary]/90 via-[--electric]/25 to-[--gold]/30 px-10 py-12 relative">
      <div className="absolute top-4 left-4">
        <LogoPlenne className="scale-105" />
      </div>
      <div className="flex-1 flex items-center justify-center w-full z-10">
        <svg viewBox="0 0 172 130" fill="none" className="w-48 h-48">
          <ellipse cx="90" cy="112" rx="70" ry="18" fill="#f5b94250"/>
          <rect x="101" y="70" width="45" height="27" rx="7" fill="#0057FF"/>
          <rect x="36" y="80" width="63" height="16" rx="5" fill="#017F6680"/>
          <rect x="60" y="42" width="60" height="30" rx="7" fill="#F5B942cc"/>
          <rect x="68" y="21" width="36" height="19" rx="5" fill="#fff"/>
          <rect x="102" y="30" width="19" height="9" rx="2" fill="#0057FF"/>
          <ellipse cx="146" cy="59" rx="9" ry="9" fill="#fff" opacity="0.18"/>
        </svg>
      </div>
      <div className="relative text-center z-10 mt-8">
        <span className="font-poppins text-xl font-bold text-white drop-shadow-sm">Sua vida financeira, plena.</span>
        <p className="text-sm mt-2 text-[#fff9]/90 font-inter">Tecnologia, atitude e inteligência <br /><span className="font-bold text-[--gold]">Pra você!</span></p>
      </div>
    </div>
  );
}
