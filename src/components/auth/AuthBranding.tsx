
import React from "react";
import { LogoPlenne } from "@/components/layout/LogoPlenne";

export function AuthBranding() {
  return (
    <div className="flex flex-col items-center justify-center w-full pt-8 pb-4">
      <LogoPlenne className="scale-110 drop-shadow-none" />
      <span className="font-poppins text-[2rem] md:text-3xl font-extrabold text-graphite mt-4 mb-1">
        Plenne Finance
      </span>
      <p className="mt-0.5 text-green-700 font-bold text-base font-inter">
        Sua vida financeira, <span className="font-highlight text-primary">plena.</span>
      </p>
      <p className="text-sm md:text-base mt-2 text-graphite/80 font-inter max-w-xs">
        Alcance independência e clareza financeira.<br />
        Controle seus sonhos e realize seus objetivos com a Plenne.
      </p>
    </div>
  );
}
