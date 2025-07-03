import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Play, BookOpen, Clock, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Module {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  published: boolean;
  created_at: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  video_url: string;
  content: string;
  duration_minutes: number;
  order_index: number;
  is_free: boolean;
  module_id: string;
}

export function EducationModulesManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [moduleForm, setModuleForm] = useState({
    title: "",
    description: "",
    category: "",
    level: "iniciante"
  });
  const [lessonForm, setLessonForm] = useState({
    title: "",
    description: "",
    video_url: "",
    content: "",
    duration_minutes: 0,
    is_free: false
  });

  // Buscar módulos
  const { data: modules = [] } = useQuery({
    queryKey: ['education-modules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_modules')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Module[];
    }
  });

  // Buscar aulas de um módulo
  const { data: lessons = [] } = useQuery({
    queryKey: ['education-lessons', selectedModule?.id],
    queryFn: async () => {
      if (!selectedModule) return [];
      
      const { data, error } = await supabase
        .from('education_lessons')
        .select('*')
        .eq('module_id', selectedModule.id)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data as Lesson[];
    },
    enabled: !!selectedModule
  });

  // Criar módulo
  const createModuleMutation = useMutation({
    mutationFn: async (data: typeof moduleForm) => {
      const { error } = await supabase
        .from('learning_modules')
        .insert([{
          ...data,
          published: false
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education-modules'] });
      setShowModuleForm(false);
      setModuleForm({ title: "", description: "", category: "", level: "iniciante" });
      toast({ title: "Módulo criado com sucesso!" });
    }
  });

  // Criar aula
  const createLessonMutation = useMutation({
    mutationFn: async (data: typeof lessonForm) => {
      const { error } = await supabase
        .from('education_lessons')
        .insert([{
          ...data,
          module_id: selectedModule?.id,
          order_index: lessons.length + 1
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education-lessons', selectedModule?.id] });
      setShowLessonForm(false);
      setLessonForm({ title: "", description: "", video_url: "", content: "", duration_minutes: 0, is_free: false });
      toast({ title: "Aula criada com sucesso!" });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#003f5c]">Módulos Educacionais</h2>
          <p className="text-muted-foreground">Gerencie cursos e aulas</p>
        </div>
        <Dialog open={showModuleForm} onOpenChange={setShowModuleForm}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-[#003f5c] to-[#2f9e44]">
              <Plus className="w-4 h-4 mr-2" />
              Novo Módulo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Módulo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Input
                    id="category"
                    value={moduleForm.category}
                    onChange={(e) => setModuleForm(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Ex: Investimentos, Orçamento..."
                  />
                </div>
                <div>
                  <Label htmlFor="level">Nível</Label>
                  <Select value={moduleForm.level} onValueChange={(value) => setModuleForm(prev => ({ ...prev, level: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iniciante">Iniciante</SelectItem>
                      <SelectItem value="intermediario">Intermediário</SelectItem>
                      <SelectItem value="avancado">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => createModuleMutation.mutate(moduleForm)}
                  disabled={createModuleMutation.isPending}
                  className="flex-1"
                >
                  {createModuleMutation.isPending ? "Criando..." : "Criar Módulo"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Lista de Módulos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Módulos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {modules.map((module) => (
              <div
                key={module.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedModule?.id === module.id ? 'bg-[#eaf6ee] border-[#2f9e44]' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedModule(module)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-[#003f5c]">{module.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={module.published ? "default" : "secondary"}>
                        {module.published ? "Publicado" : "Rascunho"}
                      </Badge>
                      <Badge variant="outline">{module.level}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Aulas do Módulo Selecionado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Aulas
                {selectedModule && <span className="text-sm text-muted-foreground">- {selectedModule.title}</span>}
              </div>
              {selectedModule && (
                <Dialog open={showLessonForm} onOpenChange={setShowLessonForm}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Aula
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Nova Aula - {selectedModule.title}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="lesson-title">Título da Aula</Label>
                          <Input
                            id="lesson-title"
                            value={lessonForm.title}
                            onChange={(e) => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="duration">Duração (minutos)</Label>
                          <Input
                            id="duration"
                            type="number"
                            value={lessonForm.duration_minutes}
                            onChange={(e) => setLessonForm(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 0 }))}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="lesson-description">Descrição</Label>
                        <Textarea
                          id="lesson-description"
                          value={lessonForm.description}
                          onChange={(e) => setLessonForm(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="video-url">URL do Vídeo</Label>
                        <Input
                          id="video-url"
                          value={lessonForm.video_url}
                          onChange={(e) => setLessonForm(prev => ({ ...prev, video_url: e.target.value }))}
                          placeholder="https://youtube.com/watch?v=..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="content">Conteúdo da Aula (HTML/Markdown)</Label>
                        <Textarea
                          id="content"
                          value={lessonForm.content}
                          onChange={(e) => setLessonForm(prev => ({ ...prev, content: e.target.value }))}
                          rows={6}
                          placeholder="Digite o conteúdo da aula..."
                        />
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button 
                          onClick={() => createLessonMutation.mutate(lessonForm)}
                          disabled={createLessonMutation.isPending}
                          className="flex-1"
                        >
                          {createLessonMutation.isPending ? "Criando..." : "Criar Aula"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedModule ? (
              <p className="text-muted-foreground text-center py-8">
                Selecione um módulo para ver as aulas
              </p>
            ) : lessons.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma aula cadastrada neste módulo
              </p>
            ) : (
              <div className="space-y-3">
                {lessons.map((lesson, index) => (
                  <div key={lesson.id} className="p-3 rounded-lg border hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#003f5c]">#{index + 1}</span>
                          <h5 className="font-medium">{lesson.title}</h5>
                          {lesson.is_free && <Badge variant="secondary">Grátis</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{lesson.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {lesson.duration_minutes} min
                          </div>
                          {lesson.video_url && (
                            <div className="flex items-center gap-1">
                              <Play className="w-3 h-3" />
                              Vídeo
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}