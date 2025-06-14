
// Lista e gerenciamento dos orçamentos mensais por categoria

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";

type Budget = {
  id: string;
  user_id: string;
  workspace_id: string | null;
  category: string;
  year: number;
  month: number;
  amount_limit: number;
};

const defaultCategories = [
  "Alimentação", "Transporte", "Moradia", "Saúde", "Educação",
  "Lazer", "Compras", "Contas", "Outros"
];

export function BudgetList() {
  const { user } = useAuth();
  const { current: workspace } = useWorkspace();
  const { toast } = useToast();

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [category, setCategory] = useState<string>('');
  const [limit, setLimit] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editLimit, setEditLimit] = useState('');

  const fetchBudgets = async () => {
    if (!user || !workspace) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .eq('workspace_id', workspace.id)
      .eq('year', year)
      .eq('month', month)
      .order('category', { ascending: true });
    if (!error && data) setBudgets(data as Budget[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchBudgets();
    // eslint-disable-next-line
  }, [user?.id, workspace?.id, year, month]);

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !workspace || !category || !limit) return;
    setLoading(true);

    // Se já existe orçamento para categoria selecionada, fazer update
    const exist = budgets.find(
      b => b.category === category
    );
    if (exist) {
      const { error } = await supabase
        .from('budgets')
        .update({ amount_limit: Number(limit), updated_at: new Date().toISOString() })
        .eq('id', exist.id);
      if (!error)
        toast({ title: "Orçamento atualizado!", description: "Limite alterado." });
      else
        toast({ variant: "destructive", title: "Erro", description: error.message });
    } else {
      const { error } = await supabase
        .from('budgets')
        .insert({
          user_id: user.id,
          workspace_id: workspace.id,
          category,
          year,
          month,
          amount_limit: Number(limit),
        });
      if (!error)
        toast({ title: "Orçamento definido!", description: "Novo limite cadastrado." });
      else
        toast({ variant: "destructive", title: "Erro", description: error.message });
    }
    setCategory('');
    setLimit('');
    setLoading(false);
    fetchBudgets();
  };

  const handleEditBudget = async (id: string) => {
    if (!editLimit.trim()) return;
    setLoading(true);
    const { error } = await supabase
      .from('budgets')
      .update({ amount_limit: Number(editLimit), updated_at: new Date().toISOString() })
      .eq('id', id);
    if (!error)
      toast({ title: "Orçamento atualizado!" });
    else
      toast({ variant: "destructive", title: "Erro", description: error.message });
    setEditId(null);
    setEditLimit('');
    setLoading(false);
    fetchBudgets();
  };

  const handleDeleteBudget = async (id: string) => {
    setLoading(true);
    const { error } = await supabase.from('budgets').delete().eq('id', id);
    if (!error)
      toast({ title: "Orçamento excluído!" });
    else
      toast({ variant: "destructive", title: "Erro", description: error.message });
    setLoading(false);
    fetchBudgets();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-primary">Orçamentos Mensais</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <select
            className="border rounded-md px-2 py-1"
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} - {new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            className="border rounded-md px-2 py-1"
            value={year}
            onChange={e => setYear(Number(e.target.value))}
          >
            {[2023, 2024, 2025, 2026].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <form onSubmit={handleAddBudget} className="flex gap-2 mb-4 flex-wrap">
          <Input list="budget-cats" value={category} onChange={e => setCategory(e.target.value)} placeholder="Categoria" required disabled={loading} />
          <datalist id="budget-cats">
            {defaultCategories.map((c) => <option key={c} value={c} />)}
          </datalist>
          <Input type="number" min="0" step="0.01" value={limit} onChange={e => setLimit(e.target.value)} placeholder="Limite R$" required disabled={loading} />
          <Button type="submit" disabled={loading || !category || !limit}>Adicionar</Button>
        </form>
        <div className="space-y-2">
          {budgets.length === 0 && <span className="text-sm text-muted-foreground">Nenhum limite cadastrado para este mês/ano.</span>}
          {budgets.map(bgt => (
            <div key={bgt.id} className="flex items-center gap-2 py-1 border-b min-h-[40px]">
              <Badge>{bgt.category}</Badge>
              {editId === bgt.id ? (
                <>
                  <Input
                    className="w-24"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editLimit}
                    onChange={e => setEditLimit(e.target.value)}
                    required
                  />
                  <Button size="sm" onClick={() => handleEditBudget(bgt.id)} disabled={loading}>Salvar</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditId(null)} disabled={loading}>Cancelar</Button>
                </>
              ) : (
                <>
                  <span className="flex-1">{`Limite R$ ${bgt.amount_limit.toFixed(2)}`}</span>
                  <Button size="sm" variant="ghost" onClick={() => { setEditId(bgt.id); setEditLimit(bgt.amount_limit.toString()); }}>Editar</Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDeleteBudget(bgt.id)} disabled={loading}>Excluir</Button>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

