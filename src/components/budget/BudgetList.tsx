
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Budget = {
  id: string;
  user_id: string;
  category: string;
  limit: number;
};

const defaultCategories = [
  "Alimentação", "Transporte", "Moradia", "Saúde", "Educação", 
  "Lazer", "Compras", "Contas", "Outros"
];

export function BudgetList() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [category, setCategory] = useState<string>('');
  const [limit, setLimit] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchBudgets = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id);
    if (!error && data) setBudgets(data as Budget[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchBudgets();
  }, [user]);

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !category || !limit) return;
    setLoading(true);
    const { error } = await supabase
      .from('budgets')
      .insert({ user_id: user.id, category, limit: Number(limit) });
    if (!error) toast({ title: "Orçamento definido!", description: "Novo limite cadastrado." });
    fetchBudgets();
    setLoading(false);
    setCategory('');
    setLimit('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-primary">Orçamentos Mensais</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddBudget} className="flex gap-2 mb-4 flex-wrap">
          <Input list="budget-cats" value={category} onChange={e => setCategory(e.target.value)} placeholder="Categoria" required />
          <datalist id="budget-cats">
            {defaultCategories.map((c) => <option key={c} value={c} />)}
          </datalist>
          <Input type="number" min="0" step="0.01" value={limit} onChange={e => setLimit(e.target.value)} placeholder="Limite R$" required />
          <Button type="submit" disabled={loading}>Adicionar</Button>
        </form>
        <div className="space-y-2">
          {budgets.length === 0 && <span className="text-sm text-muted-foreground">Nenhum limite cadastrado.</span>}
          {budgets.map(bgt => (
            <div key={bgt.id} className="flex items-center gap-2 py-1 border-b">
              <Badge>{bgt.category}</Badge>
              <span className="flex-1">{`Limite R$ ${bgt.limit.toFixed(2)}`}</span>
              {/* Futuramente, ações de editar/deletar */}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
