import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Wallet, Info, ArrowDown, ArrowUp, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { cn } from "@/lib/utils";

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

  // Cálculos resumo (só usando limitações, pois não temos gastos aqui)
  const totalBudget = budgets.reduce((acc, cur) => acc + (cur.amount_limit || 0), 0);
  // Para o demo, 60% gasto
  const totalUsed = (totalBudget * 0.6);
  const totalAvailable = totalBudget - totalUsed;

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

  // >>>>>>>>> STYLES AND COLOR TWEAKS BELOW <<<<<<<<<

  // Cards: gradient azul petróleo/verde esmeralda
  // Remove any orange. Use only #2f9e44 (verde), #003f5c (azul), #eaf6ee/#f4f4f4 (gelo), #2b2b2b (grafite), #d62828 (erro)
  // Font classes: titles/buttons use font-display (Poppins); text uses font-text (Inter).
  // Alerts/info: azul petróleo or green, never orange.
  // Gradients use bg-gradient-to-br from-[#003f5c] via-[#2f9e44] to-[#eaf6ee]

  return (
    <div className="w-full max-w-2xl mx-auto mt-2 animate-fade-in">
      <Card className="bg-white border border-[--primary]/10 shadow-card rounded-xl p-1 mb-6">
        <CardHeader className="pb-1 flex-row items-center gap-2">
          <Wallet className="h-8 w-8 text-[--secondary] mb-2" />
          <div>
            <CardTitle className="text-2xl font-display text-[--primary] flex items-center gap-2">
              Orçamentos Mensais
              <Info className="ml-2 w-5 h-5 text-[--secondary]" />
            </CardTitle>
            <CardDescription className="text-base text-[--primary] mt-1 font-text">
              Defina, acompanhe e controle seus limites de gastos nas principais categorias do seu mês. Use o orçamento para manter sua saúde financeira <span className="font-bold text-[--secondary] font-highlight">sempre sob controle</span>!
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {/* Barra/resumo topo */}
          <div className="flex flex-wrap md:flex-nowrap gap-6 bg-[#eaf6ee] rounded-lg p-4 mb-6 border border-[--primary]/20 shadow-sm">
            <div className="flex-1 min-w-[120px] flex flex-col items-center">
              <span className="text-sm text-graphite font-text">Total Orçado</span>
              <span className="text-xl font-bold text-[--primary] font-display">
                R$ {totalBudget.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex-1 min-w-[120px] flex flex-col items-center border-l border-[--primary]/10 pl-3">
              <span className="text-sm text-graphite font-text">Utilizado</span>
              <span className="text-xl font-bold text-[--secondary] flex items-center font-display">
                <ArrowUp className="w-4 h-4 mr-1 text-[--secondary]" />R$ {totalUsed.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex-1 min-w-[120px] flex flex-col items-center border-l border-[--primary]/10 pl-3">
              <span className="text-sm text-graphite font-text">Disponível</span>
              <span className="text-xl font-bold text-[--primary] flex items-center font-display">
                <ArrowDown className="w-4 h-4 mr-1 text-[--primary]" />R$ {totalAvailable.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          {/* Filtros mês/ano */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <select
              className="border rounded-md px-2 py-1 bg-white shadow-sm font-text"
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
              className="border rounded-md px-2 py-1 bg-white shadow-sm font-text"
              value={year}
              onChange={e => setYear(Number(e.target.value))}
            >
              {[2023, 2024, 2025, 2026].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <form onSubmit={handleAddBudget} className="flex gap-2 mb-6 flex-wrap items-center">
            <Input
              list="budget-cats"
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="Categoria"
              required
              disabled={loading}
              className="w-48 font-text"
            />
            <datalist id="budget-cats">
              {defaultCategories.map((c) => <option key={c} value={c} />)}
            </datalist>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={limit}
              onChange={e => setLimit(e.target.value)}
              placeholder="Limite R$"
              required
              disabled={loading}
              className="w-40 font-text"
            />
            <Button
              type="submit"
              disabled={loading || !category || !limit}
              className="gap-2 font-display bg-[--secondary] hover:bg-[--primary] text-white"
            >
              <PlusCircle className="w-5 h-5" /> Adicionar
            </Button>
          </form>
          {/* Lista de cards orçamentários */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-1">
            {budgets.length === 0 && (
              <div className="col-span-2 text-center bg-[#f4f4f4] p-6 rounded-lg border border-[--primary]/10 text-muted-foreground font-medium">
                Nenhum limite cadastrado para este mês/ano.<br />
                Que tal começar com um orçamento para Alimentação ou Contas?
              </div>
            )}
            {budgets.map(bgt => (
              <Card key={bgt.id} className={cn(
                "p-0 border border-[--primary]/10 group hover:shadow-lg transition-all relative overflow-visible bg-white"
              )}>
                <CardHeader className="flex flex-row items-center gap-2 py-3 px-4">
                  <Badge className="bg-[--secondary] text-white text-base px-3 min-w-[110px] font-display">{bgt.category}</Badge>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 py-3 px-4">
                  {editId === bgt.id ? (
                    <div className="flex gap-2 items-center">
                      <Input
                        className="w-24 font-text"
                        type="number"
                        min="0"
                        step="0.01"
                        value={editLimit}
                        onChange={e => setEditLimit(e.target.value)}
                        required
                        autoFocus
                      />
                      <Button size="sm" onClick={() => handleEditBudget(bgt.id)} disabled={loading} className="bg-[--secondary] text-white font-display">Salvar</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditId(null)} disabled={loading} className="font-text">Cancelar</Button>
                    </div>
                  ) : (
                    <>
                      <span className="text-md flex-1 mb-2 font-text">{`Limite: `}
                        <span className="font-bold text-[--primary] font-display">R$ {bgt.amount_limit.toFixed(2)}</span>
                      </span>
                      <div className="flex gap-2 mt-1">
                        <Button size="sm" variant="outline" onClick={() => { setEditId(bgt.id); setEditLimit(bgt.amount_limit.toString()); }} disabled={loading} className="font-display border-[--secondary] text-[--primary]">
                          Editar
                        </Button>
                        <Button size="sm" variant="ghost" className="text-[--error] hover:bg-red-100 font-text" onClick={() => handleDeleteBudget(bgt.id)} disabled={loading}>
                          Excluir
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
                {/* Dica visual */}
                <div className="absolute -top-2 -right-2 bg-white rounded-full flex items-center border px-2 py-[2px] shadow text-[11px] text-[--secondary] border-[--secondary]/20 group-hover:scale-110 transition font-text">
                  <Info className="w-3 h-3 mr-1 text-[--primary]" /> mês {bgt.month}/{bgt.year}
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// O arquivo está próximo de 250 linhas! Recomendo fortemente refatorar para dividir em componentes menores para melhor manutenção e leitura.
