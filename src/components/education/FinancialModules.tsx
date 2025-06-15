
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, BookOpen, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Module = {
  id: string;
  title: string;
  description?: string | null;
  level?: string | null;
  category?: string | null;
  content?: string | null;
  published?: boolean | null;
  created_at?: string | null;
};

export function FinancialModules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    level: "beginner",
    category: "",
    content: "",
    published: false
  });

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchModules = async () => {
      setLoading(true);
      let query = supabase
        .from("learning_modules")
        .select("*")
        .order("created_at", { ascending: false })
        .eq("published", true);
      if (user) {
        // Mostra módulos publicados e os criados pelo usuário
        query = query.or(`published.eq.true,created_at.eq.${user.id}`);
      }
      const { data, error } = await query;
      if (!error && data) {
        setModules(data as Module[]);
      } else {
        setModules([]);
      }
      setLoading(false);
    };
    fetchModules();
  }, [user]);

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Faça login para criar aulas.", variant: "destructive" });
      return;
    }
    if (form.title.length < 3 || form.description.length < 10) {
      toast({ title: "Preencha todos os campos obrigatórios.", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("learning_modules").insert([{
      title: form.title,
      description: form.description,
      level: form.level,
      category: form.category,
      content: form.content,
      published: true,
      created_at: new Date().toISOString()
    }]);
    if (!error) {
      toast({ title: "Aula criada!" });
      setForm({ title: "", description: "", level: "beginner", category: "", content: "", published: false });
      setShowForm(false);
      // refetch
      setModules([]);
      setLoading(true);
    } else {
      toast({ title: "Erro ao criar módulo.", description: error.message, variant: "destructive" });
    }
  };

  if (loading) {
    return <div>Carregando aulas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#003f5c] flex items-center gap-2">
            <GraduationCap className="w-6 h-6" />
            Módulos & Aulas
          </h2>
          <p className="text-[#2b2b2b]/70">Aprenda conceitos de finanças pessoais, investimentos e mais</p>
        </div>
        {user && (
          <Button className="bg-[#003f5c] hover:bg-[#003f5c]/90" onClick={() => setShowForm(v => !v)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Aula
          </Button>
        )}
      </div>
      {showForm && (
        <form className="p-4 bg-white rounded-lg shadow space-y-2" onSubmit={handleAddModule}>
          <Input
            placeholder="Título"
            value={form.title}
            onChange={e => setForm(t => ({ ...t, title: e.target.value }))}
          />
          <Input
            placeholder="Descrição"
            value={form.description}
            onChange={e => setForm(t => ({ ...t, description: e.target.value }))}
          />
          <select
            className="border rounded px-2 py-1"
            value={form.level}
            onChange={e => setForm(t => ({ ...t, level: e.target.value }))}
          >
            <option value="beginner">Iniciante</option>
            <option value="intermediate">Intermediário</option>
            <option value="advanced">Avançado</option>
          </select>
          <Input
            placeholder="Categoria"
            value={form.category}
            onChange={e => setForm(t => ({ ...t, category: e.target.value }))}
          />
          <textarea
            className="border rounded px-2 py-1 w-full"
            rows={3}
            placeholder="Conteúdo (markdown, link ou texto livre)"
            value={form.content}
            onChange={e => setForm(t => ({ ...t, content: e.target.value }))}
          />
          <Button type="submit">Salvar</Button>
        </form>
      )}
      {modules.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-[#003f5c]/50 mb-4" />
            <p className="text-[#2b2b2b]/70">Nenhuma aula disponível ainda</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map(module => (
            <Card key={module.id} className="border-l-4 border-l-[#003f5c] hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg text-[#003f5c]">{module.title}</CardTitle>
                <Badge variant="secondary" className="mt-1">
                  {module.level === "beginner"
                    ? "Iniciante"
                    : module.level === "intermediate"
                    ? "Intermediário"
                    : module.level === "advanced"
                    ? "Avançado"
                    : "Nível"}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="mb-2 text-[#2b2b2b]/70">{module.description}</div>
                <div className="text-xs text-[#2b2b2b]/40">
                  Categoria: {module.category || "Geral"}
                </div>
                {module.content && (
                  <div className="text-sm mt-2">
                    <span className="font-semibold">Conteúdo:</span>
                    <div className="whitespace-pre-line">{module.content}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
