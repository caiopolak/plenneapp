import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit2, Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";

type Category = {
  id: string;
  name: string;
  type: string;
};

const DEFAULT_CATEGORIES: Record<string, string[]> = {
  income: [
    'Salário', 'Freelance', 'Investimentos', 'Venda', 'Outros'
  ],
  expense: [
    'Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 
    'Lazer', 'Compras', 'Contas', 'Outros'
  ]
};

export function CategoryManager({ type, value, onChange }: { type: string; value?: string; onChange?: (cat: string) => void }) {
  const { user } = useAuth();
  const { current } = useWorkspace();
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [newCat, setNewCat] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    if (!user || !current) return;
    const { data, error } = await supabase
      .from("transaction_categories")
      .select("*")
      .eq("user_id", user.id)
      .eq("workspace_id", current.id)
      .eq("type", type)
      .order("created_at", { ascending: true });
    if (!error && data) setCategories(data);
  };

  useEffect(() => { fetchCategories(); /* eslint-disable-next-line */ }, [user, current, type]);

  const addCategory = async () => {
    if (!user || !current || !newCat.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("transaction_categories").insert({
      user_id: user.id, workspace_id: current.id, name: newCat.trim(), type,
    });
    setLoading(false);
    if (error) toast({ variant: "destructive", title: "Erro", description: "Não foi possível criar categoria." });
    else { setNewCat(""); fetchCategories(); toast({ title: "Categoria criada!" }); }
  };

  const updateCategory = async () => {
    if (!editId || !editName.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("transaction_categories").update({ name: editName }).eq("id", editId);
    setLoading(false);
    setEditId(null);
    if (error) toast({ variant: "destructive", title: "Erro", description: "Falha ao editar categoria" });
    else { fetchCategories(); toast({ title: "Categoria editada!" }); }
  };

  const deleteCategory = async (cid: string) => {
    setLoading(true);
    const { error } = await supabase.from("transaction_categories").delete().eq("id", cid);
    setLoading(false);
    if (error) toast({ variant: "destructive", title: "Erro", description: "Falha ao deletar categoria" });
    else { fetchCategories(); toast({ title: "Categoria excluída!" }); }
  };

  // Estado para indicar seleção personalizada vs padrão
  // Aqui não é necessário campo extra: basta exibir as duas listas separadamente, user pode clicar qualquer
  return (
    <div>
      <div className="flex gap-2 items-end mb-1">
        <Input
          placeholder="Nova categoria"
          value={newCat}
          onChange={e => setNewCat(e.target.value)}
          disabled={loading}
          className="w-36"
        />
        <Button onClick={addCategory} size="sm" disabled={loading || !newCat.trim()}>
          <Plus className="w-4 h-4 mr-1" /> Adicionar
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">Gerenciar</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gerenciar categorias ({type === "income" ? "Receita" : "Despesa"})</DialogTitle>
            </DialogHeader>
            {categories.length === 0 && <div className="text-muted-foreground py-2">Nenhuma categoria ainda.</div>}
            <ul>
              {categories.map(cat => (
                <li key={cat.id} className="flex items-center gap-2 py-1">
                  {editId === cat.id ? (
                    <>
                      <Input className="w-36" value={editName} onChange={e => setEditName(e.target.value)} />
                      <Button onClick={updateCategory} size="sm">Salvar</Button>
                      <Button onClick={() => setEditId(null)} size="sm" variant="ghost">Cancelar</Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1">{cat.name}</span>
                      <Button size="sm" variant="ghost" onClick={() => { setEditId(cat.id); setEditName(cat.name); }}>
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteCategory(cat.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </DialogContent>
        </Dialog>
      </div>
      {/* Selecionar categoria (bem separado Padrão X Personalizada, seleção única) */}
      <div className="flex flex-wrap gap-2 mt-2">
        {DEFAULT_CATEGORIES[type].length > 0 && (
          <>
            <span className="w-full text-xs mt-1 text-primary/70">Padrão</span>
            {DEFAULT_CATEGORIES[type].map(cat => (
              <Button
                key={`default-${cat}`}
                variant={value === cat ? "default" : "outline"}
                size="sm"
                onClick={() => onChange?.(cat)}
                className="rounded-full"
                type="button"
              >
                {cat}
              </Button>
            ))}
          </>
        )}
        {categories.length > 0 && (
          <>
            <span className="w-full text-xs mt-1 text-secondary/70">Personalizadas</span>
            {categories.map(cat => (
              <Button
                key={cat.id}
                variant={value === cat.name ? "default" : "outline"}
                size="sm"
                onClick={() => onChange?.(cat.name)}
                className="rounded-full"
                type="button"
              >
                {cat.name}
              </Button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
