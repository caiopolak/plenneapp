import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, BookOpen, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePersonalLearningPaths } from "@/hooks/usePersonalLearningPaths";

export function FinancialModules() {
  const { modules, progress, nextModule } = usePersonalLearningPaths();
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

  // Form de criação continua igual...

  // Exibe progresso do usuário e recomendações
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#003f5c] flex items-center gap-2">
            <GraduationCap className="w-6 h-6" />
            Trilhas de Educação Financeira
          </h2>
          <p className="text-[#2b2b2b]/70">
            Complete módulos temáticos e acompanhe seu progresso.
          </p>
        </div>
        {user && (
          <Button className="bg-[#003f5c] hover:bg-[#003f5c]/90" onClick={() => setShowForm(v => !v)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Aula
          </Button>
        )}
      </div>
      {nextModule && (
        <Card>
          <CardContent className="bg-green-50 border rounded-lg mb-3">
            <div className="font-bold text-[#28853b]">
              Próximo módulo recomendado:&nbsp;
              <span className="underline">{nextModule.title}</span>
            </div>
            <div className="text-xs text-[#003f5c]/70">
              {nextModule.description}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Form para criar novo módulo (igual antes) */}
      {showForm && (
        <form className="p-4 bg-white rounded-lg shadow space-y-2" onSubmit={async (e) => {
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
            // setModules([]);
            // setLoading(true);
          } else {
            toast({ title: "Erro ao criar módulo.", description: error.message, variant: "destructive" });
          }
        }}>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map(module => (
          <Card key={module.id} className="border-l-4 border-l-[#003f5c] hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg text-[#003f5c]">{module.title}</CardTitle>
              <Badge variant={progress[module.id]?.status === "completed" ? "default" : "secondary"}>
                {progress[module.id]?.status === "completed" ? "Concluído" : "Pendente"}
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
    </div>
  );
}
