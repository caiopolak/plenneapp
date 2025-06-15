import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, TrendingUp, Shield, Brain, ChevronRight } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useAutomaticTips } from "@/hooks/useAutomaticTips";

export function FinancialTips() {
  const tips = useAutomaticTips();
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

  const handleAddTip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Faça login para cadastrar dicas personalizadas.", variant: "destructive" });
      return;
    }
    if (newTip.title.length < 3 || newTip.content.length < 10) {
      toast({ title: "Título ou conteúdo muito curtos.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('financial_tips').insert([{
      creator_id: user.id,
      title: newTip.title,
      content: newTip.content,
      category: newTip.category,
      difficulty_level: newTip.difficulty_level,
      is_public: true
    }]);
    if (!error) {
      toast({ title: "Dica adicionada com sucesso!" });
      setNewTip({ title: '', content: '', category: 'budgeting', difficulty_level: 'beginner' });
      // re-fetch
      setSelectedCategory('all');
      setSelectedLevel('all');
    } else {
      toast({ title: "Erro ao adicionar dica", description: error.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  const getCategoryIcon = (category: string | null | undefined) => {
    switch (category) {
      case 'budgeting': return <BookOpen className="w-5 h-5" />;
      case 'investments': return <TrendingUp className="w-5 h-5" />;
      case 'emergency_fund': return <Shield className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  const getCategoryLabel = (category: string | null | undefined) => {
    switch (category) {
      case 'budgeting': return 'Orçamento';
      case 'investments': return 'Investimentos';
      case 'emergency_fund': return 'Reserva de Emergência';
      default: return 'Geral';
    }
  };

  const getDifficultyColor = (level: string | null | undefined) => {
    switch (level) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyLabel = (level: string | null | undefined) => {
    switch (level) {
      case 'beginner': return 'Iniciante';
      case 'intermediate': return 'Intermediário';
      case 'advanced': return 'Avançado';
      default: return 'Geral';
    }
  };

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

      {/* Formulário para adicionar nova dica */}
      <form className="space-y-2 mb-4" onSubmit={handleAddTip}>
        <div className="flex gap-2 flex-wrap">
          <Input
            className="flex-1"
            placeholder="Título da dica"
            value={newTip.title}
            onChange={e => setNewTip(t => ({ ...t, title: e.target.value }))}
            disabled={submitting}
          />
          <Input
            className="flex-2"
            placeholder="Conteúdo da dica"
            value={newTip.content}
            onChange={e => setNewTip(t => ({ ...t, content: e.target.value }))}
            disabled={submitting}
          />
          <select
            className="border rounded px-2 py-1"
            value={newTip.category}
            onChange={e => setNewTip(t => ({ ...t, category: e.target.value }))}
            disabled={submitting}
          >
            <option value="budgeting">Orçamento</option>
            <option value="investments">Investimentos</option>
            <option value="emergency_fund">Reserva de Emergência</option>
          </select>
          <select
            className="border rounded px-2 py-1"
            value={newTip.difficulty_level}
            onChange={e => setNewTip(t => ({ ...t, difficulty_level: e.target.value }))}
            disabled={submitting}
          >
            <option value="beginner">Iniciante</option>
            <option value="intermediate">Intermediário</option>
            <option value="advanced">Avançado</option>
          </select>
          <Button type="submit" disabled={submitting || !user}>Adicionar</Button>
        </div>
      </form>

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
                  {/* Botão remover apenas se for o criador */}
                  {user?.id === tip.creator_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-800"
                      onClick={async () => {
                        await supabase.from("financial_tips").delete().eq("id", tip.id);
                        setTips(tips => tips.filter(t => t.id !== tip.id));
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
