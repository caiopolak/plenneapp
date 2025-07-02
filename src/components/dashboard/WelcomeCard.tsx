
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface WelcomeCardProps {
  name: string | undefined;
  plan: string | undefined;
  onViewReports?: () => void;
}

export function WelcomeCard({ name, plan, onViewReports }: WelcomeCardProps) {
  return (
    <Card className="bg-gradient-to-tr from-white via-[#f8fffe] to-[#eaf6ee] border-none shadow-[0_4px_24px_0_rgba(0,63,92,0.13)] animate-fade-in relative overflow-hidden">
      <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6 py-7 px-8">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-1 font-display text-[#003f5c]">
            Olá, <span className="text-[#2f9e44]">{name || "Usuário"}</span>!
            <Sparkles className="w-6 h-6 ml-2 text-[#f8961e] animate-pulse"/>
          </h2>
          <p className="text-[#2b2b2b]/70 text-base mt-2 font-text">Aqui está o resumo da sua vida financeira plena.</p>
        </div>
        <div className="flex gap-4 items-center">
          <Badge className="bg-[#f8961e] text-white text-base font-extrabold rounded-full uppercase shadow animate-scale-in font-highlight">
            {plan || "FREE"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            className="shadow-md hover:scale-105 transition-transform bg-white text-[#003f5c] border-[#003f5c] hover:bg-[#003f5c] hover:text-white font-bold"
            onClick={onViewReports}
          >
            Ver Relatórios
          </Button>
        </div>
      </CardContent>
      <div className="absolute right-[-32px] top-[-20px] w-44 h-44 bg-[#2f9e44]/20 rounded-full blur-2xl opacity-60 pointer-events-none" />
    </Card>
  );
}
