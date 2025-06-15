import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, TrendingUp, Shield, Brain, ChevronRight } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useAutomaticTips } from "@/hooks/useAutomaticTips";
import { TipForm } from "./TipForm";
import { getCategoryIcon, getCategoryLabel, getDifficultyColor, getDifficultyLabel } from "./tipsUtils";

export function FinancialTips() {
  const { tips, refetch, setTips } = useAutomaticTips();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [newTip, setNewTip] = useState<{ title: string; content: string; category: string; difficulty_level: string }>({
    title: '',
    content: '',
    category: 'budgeting',
    difficulty_level: 'beginner',
  });
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  // Agora filtra dicas automáticas + manuais conforme seleção
  const filteredTips = tips.filter(tip => {
    if (selectedCategory !== 'all' && tip.category !== selectedCategory) return false;
    if (selectedLevel !== 'all' && tip.difficulty_level !== selectedLevel) return false;
    return true;
  });

  const categories = [
    { value: 'all', label: 'Todas' },
    { value: 'budgeting', label: 'Orçamento' },
    { value: 'investments', label: 'Investimentos' },
    { value: 'emergency_fund', label: 'Reserva de Emergência' }
  ];

  const levels = [
    { value: 'all', label: 'Todos' },
    { value: 'beginner', label: 'Iniciante' },
    { value: 'intermediate', label: 'Intermediário' },
    { value: 'advanced', label: 'Avançado' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#003f5c]">Educação Financeira</h2>
          <p className="text-[#2b2b2b]/70">Aprenda com dicas práticas de especialistas</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.value)}
              className={selectedCategory === category.value ? "bg-[#003f5c] hover:bg-[#003f5c]/90" : ""}
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {levels.map((level) => (
          <Badge
            key={level.value}
            variant={selectedLevel === level.value ? "default" : "outline"}
            className={`cursor-pointer ${selectedLevel === level.value ? "bg-[#2f9e44] hover:bg-[#2f9e44]/90" : ""}`}
            onClick={() => setSelectedLevel(level.value)}
          >
            {level.label}
          </Badge>
        ))}
      </div>
      {/* Formulário separado */}
      <TipForm
        newTip={newTip}
        setNewTip={setNewTip}
        submitting={submitting}
        setSubmitting={setSubmitting}
        refetch={refetch}
        setSelectedCategory={setSelectedCategory}
        setSelectedLevel={setSelectedLevel}
      />
      {filteredTips.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Brain className="w-12 h-12 mx-auto text-[#003f5c]/50 mb-4" />
            <p className="text-[#2b2b2b]/70">Nenhuma dica encontrada para os filtros selecionados</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTips.map((tip) => (
            <Card key={tip.id} className="border-l-4 border-l-[#2f9e44] hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(tip.category)}
                    <div>
                      <CardTitle className="text-lg text-[#003f5c]">{tip.title}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {getCategoryLabel(tip.category)}
                      </Badge>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getDifficultyColor(tip.difficulty_level)}`}
                    title={getDifficultyLabel(tip.difficulty_level)} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-[#2b2b2b] leading-relaxed mb-4">{tip.content}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {getDifficultyLabel(tip.difficulty_level)}
                  </Badge>
                  {user?.id && tip.creator_id && user.id === tip.creator_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-800"
                      onClick={async () => {
                        await supabase.from("financial_tips").delete().eq("id", tip.id);
                        refetch();
                        toast({ title: "Dica removida." });
                      }}
                    >
                      Remover
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
