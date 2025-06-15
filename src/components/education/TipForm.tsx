
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getCategoryIcon, getCategoryLabel, getDifficultyColor, getDifficultyLabel } from "./tipsUtils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type NewTip = {
  title: string;
  content: string;
  category: string;
  difficulty_level: string;
};
type Props = {
  newTip: NewTip;
  setNewTip: React.Dispatch<React.SetStateAction<NewTip>>;
  submitting: boolean;
  setSubmitting: (v: boolean) => void;
  refetch: () => void;
  setSelectedCategory: (v: string) => void;
  setSelectedLevel: (v: string) => void;
};
export function TipForm({
  newTip,
  setNewTip,
  submitting,
  setSubmitting,
  refetch,
  setSelectedCategory,
  setSelectedLevel,
}: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
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
      setSelectedCategory('all');
      setSelectedLevel('all');
      refetch(); // recarrega dicas automáticas+manuais
    } else {
      toast({ title: "Erro ao adicionar dica", description: error.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  return (
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
  );
}
