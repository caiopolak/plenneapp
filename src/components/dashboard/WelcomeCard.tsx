
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
    <Card className="bg-gradient-to-r from-[--primary]/90 via-[--electric]/80 to-[--gold]/80 text-white shadow-2xl animate-fade-in border-0 relative overflow-hidden">
      <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6 py-7 px-8">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-1">
            Olá, <span className="text-[--gold]">{name || "Usuário"}</span>!
            <Sparkles className="w-6 h-6 ml-2 text-white/80 animate-pulse"/>
          </h2>
          <p className="text-white/80 text-base mt-2 font-inter">Aqui está o resumo da sua vida financeira plena.</p>
        </div>
        <div className="flex gap-4 items-center">
          <Badge className="bg-[--gold] text-[--graphite] text-base font-extrabold rounded-full uppercase shadow animate-scale-in">
            {plan || "FREE"}
          </Badge>
          <Button
            variant="secondary"
            size="sm"
            className="shadow-md hover:scale-105 transition-transform bg-white text-[--primary] font-bold"
            onClick={onViewReports}
          >
            Ver Relatórios
          </Button>
        </div>
      </CardContent>
      <div className="absolute right-[-32px] top-[-20px] w-44 h-44 bg-[--electric]/30 rounded-full blur-2xl opacity-60 pointer-events-none" />
    </Card>
  );
}
