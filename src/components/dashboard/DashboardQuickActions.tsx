
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Star, TrendingUp, BookOpen } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function DashboardQuickActions() {
  return (
    <ul className="space-y-3">
      <li>
        <Button 
          size="sm" 
          variant="secondary" 
          className="w-full flex gap-2 hover:scale-105 transition-transform"
          onClick={() => toast({ title: "Criar nova transação", description: "Funcionalidade em breve!" })}
        >
          <Plus /> Nova Transação
        </Button>
      </li>
      <li>
        <Button 
          size="sm" 
          variant="outline" 
          className="w-full flex gap-2 hover:scale-105 transition-transform"
          onClick={() => toast({ title: "Criar nova meta", description: "Funcionalidade em breve!" })}
        >
          <Star /> Nova Meta
        </Button>
      </li>
      <li>
        <Button 
          size="sm"
          variant="outline"
          className="w-full flex gap-2 hover:scale-105 transition-transform"
          onClick={() => toast({ title: "Novo investimento", description: "Funcionalidade em breve!" })}
        >
          <TrendingUp /> Novo Investimento
        </Button>
      </li>
      <li>
        <Button 
          size="sm"
          className="w-full flex gap-2 bg-[--electric] hover:bg-[--primary] text-white font-bold hover:scale-105 transition-transform"
          onClick={() => toast({ title: "Educação financeira", description: "Acessando módulo de educação..." })}
        >
          <BookOpen /> Educação Financeira
        </Button>
      </li>
    </ul>
  );
}
