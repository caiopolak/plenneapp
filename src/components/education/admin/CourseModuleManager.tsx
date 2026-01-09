import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, BookOpen, Play, Trash2, Edit, Upload, FileText, Video, 
  GripVertical, Eye, EyeOff, Clock, Download, ChevronRight, Settings, FileAudio
} from "lucide-react";
import { useCourseModules, CourseModule, Lesson, LessonMaterial } from "@/hooks/useCourseModules";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useToast } from "@/hooks/use-toast";
import { LessonEditor } from "./LessonEditor";

export function CourseModuleManager() {
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { 
    modules, 
    modulesLoading, 
    useLessons, 
    useMaterials,
    createModuleMutation,
    updateModuleMutation,
    deleteModuleMutation,
    createLessonMutation,
    updateLessonMutation,
    deleteLessonMutation,
    createMaterialMutation,
    deleteMaterialMutation,
    uploadFile
  } = useCourseModules();
  const { toast } = useToast();

  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [showLessonEditor, setShowLessonEditor] = useState(false);
  const [uploading, setUploading] = useState(false);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const materialInputRef = useRef<HTMLInputElement>(null);

  const { data: lessons = [] } = useLessons(selectedModule?.id || null);
  const { data: materials = [] } = useMaterials(selectedLesson?.id || null);

  const [moduleForm, setModuleForm] = useState({
    title: "",
    description: "",
    category: "",
    level: "iniciante",
    published: false
  });

  const [lessonForm, setLessonForm] = useState({
    title: "",
    description: "",
    content: "",
    video_url: "",
    duration_minutes: 0,
    is_free: false
  });

  const [materialForm, setMaterialForm] = useState({
    title: "",
    description: "",
    file: null as File | null
  });

  if (adminLoading) {
    return <div className="text-center py-8">Verificando permissões...</div>;
  }

  if (!isAdmin) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-8 text-center">
          <Settings className="w-12 h-12 mx-auto text-destructive/50 mb-4" />
          <p className="text-destructive font-medium">Acesso Restrito</p>
          <p className="text-muted-foreground text-sm mt-2">
            Esta área é exclusiva para administradores do sistema.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleCreateModule = async () => {
    await createModuleMutation.mutateAsync(moduleForm);
    setModuleForm({ title: "", description: "", category: "", level: "iniciante", published: false });
    setShowModuleForm(false);
  };

  const handleUpdateModule = async () => {
    if (!editingModule) return;
    await updateModuleMutation.mutateAsync({ id: editingModule.id, ...moduleForm });
    setEditingModule(null);
    setShowModuleForm(false);
  };

  const handleCreateLesson = async () => {
    if (!selectedModule) return;
    await createLessonMutation.mutateAsync({
      ...lessonForm,
      module_id: selectedModule.id,
      order_index: lessons.length + 1
    });
    setLessonForm({ title: "", description: "", content: "", video_url: "", duration_minutes: 0, is_free: false });
    setShowLessonForm(false);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedLesson) return;

    setUploading(true);
    try {
      const path = `videos/${selectedModule?.id}/${selectedLesson.id}/${file.name}`;
      const url = await uploadFile(file, path);
      
      await updateLessonMutation.mutateAsync({
        id: selectedLesson.id,
        video_file_url: url
      });
      
      toast({ title: "Vídeo enviado com sucesso!" });
    } catch (error: any) {
      toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleMaterialUpload = async () => {
    if (!materialForm.file || !selectedLesson) return;

    setUploading(true);
    try {
      const path = `materials/${selectedModule?.id}/${selectedLesson.id}/${materialForm.file.name}`;
      const url = await uploadFile(materialForm.file, path);
      
      await createMaterialMutation.mutateAsync({
        lesson_id: selectedLesson.id,
        title: materialForm.title || materialForm.file.name,
        description: materialForm.description,
        file_url: url,
        file_type: materialForm.file.type.split('/')[0] || 'document',
        file_size: materialForm.file.size,
        order_index: materials.length
      });
      
      setMaterialForm({ title: "", description: "", file: null });
      setShowMaterialForm(false);
    } catch (error: any) {
      toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const openEditModule = (module: CourseModule) => {
    setEditingModule(module);
    setModuleForm({
      title: module.title,
      description: module.description || "",
      category: module.category || "",
      level: module.level || "iniciante",
      published: module.published || false
    });
    setShowModuleForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Gerenciador de Cursos
            <Badge className="bg-secondary text-secondary-foreground">Admin</Badge>
          </h2>
          <p className="text-muted-foreground">
            Crie e gerencie módulos, aulas e materiais complementares
          </p>
        </div>

        <Dialog open={showModuleForm} onOpenChange={(open) => {
          setShowModuleForm(open);
          if (!open) {
            setEditingModule(null);
            setModuleForm({ title: "", description: "", category: "", level: "iniciante", published: false });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-secondary">
              <Plus className="w-4 h-4 mr-2" />
              Novo Módulo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingModule ? "Editar Módulo" : "Criar Novo Módulo"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Título do Módulo</Label>
                <Input
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Fundamentos de Investimentos"
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva o conteúdo do módulo..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Categoria</Label>
                  <Input
                    value={moduleForm.category}
                    onChange={(e) => setModuleForm(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Investimentos, Orçamento..."
                  />
                </div>
                <div>
                  <Label>Nível</Label>
                  <Select 
                    value={moduleForm.level} 
                    onValueChange={(value) => setModuleForm(prev => ({ ...prev, level: value }))}
                  >
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
              <div className="flex items-center gap-2">
                <Switch
                  checked={moduleForm.published}
                  onCheckedChange={(checked) => setModuleForm(prev => ({ ...prev, published: checked }))}
                />
                <Label>Publicar módulo (visível para alunos)</Label>
              </div>
              <Button 
                onClick={editingModule ? handleUpdateModule : handleCreateModule}
                className="w-full"
                disabled={createModuleMutation.isPending || updateModuleMutation.isPending}
              >
                {editingModule ? "Salvar Alterações" : "Criar Módulo"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Módulos */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Módulos ({modules.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-2">
                {modules.map((module) => (
                  <div
                    key={module.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedModule?.id === module.id 
                        ? 'bg-primary/10 border-primary' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => {
                      setSelectedModule(module);
                      setSelectedLesson(null);
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{module.title}</h4>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          <Badge variant={module.published ? "default" : "secondary"} className="text-xs">
                            {module.published ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                            {module.published ? "Publicado" : "Rascunho"}
                          </Badge>
                          <Badge variant="outline" className="text-xs">{module.level}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModule(module);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteModuleMutation.mutate(module.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {modules.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum módulo criado ainda
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Aulas do Módulo */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Play className="w-5 h-5" />
                Aulas {selectedModule && `- ${selectedModule.title}`}
              </CardTitle>
              {selectedModule && (
                <Dialog open={showLessonForm} onOpenChange={setShowLessonForm}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Aula
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Nova Aula</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Título da Aula</Label>
                          <Input
                            value={lessonForm.title}
                            onChange={(e) => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label>Duração (minutos)</Label>
                          <Input
                            type="number"
                            value={lessonForm.duration_minutes}
                            onChange={(e) => setLessonForm(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 0 }))}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Descrição</Label>
                        <Textarea
                          value={lessonForm.description}
                          onChange={(e) => setLessonForm(prev => ({ ...prev, description: e.target.value }))}
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label>URL do Vídeo (YouTube, Vimeo, etc.)</Label>
                        <Input
                          value={lessonForm.video_url}
                          onChange={(e) => setLessonForm(prev => ({ ...prev, video_url: e.target.value }))}
                          placeholder="https://youtube.com/watch?v=..."
                        />
                      </div>
                      <div>
                        <Label>Conteúdo da Aula (Markdown)</Label>
                        <Textarea
                          value={lessonForm.content}
                          onChange={(e) => setLessonForm(prev => ({ ...prev, content: e.target.value }))}
                          rows={8}
                          placeholder="# Título da aula

Aqui você pode escrever o conteúdo em markdown...

## Subtítulo

- Lista de tópicos
- Outro tópico

**Texto em negrito** e *itálico*"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={lessonForm.is_free}
                          onCheckedChange={(checked) => setLessonForm(prev => ({ ...prev, is_free: checked }))}
                        />
                        <Label>Aula gratuita (disponível para todos)</Label>
                      </div>
                      <Button 
                        onClick={handleCreateLesson}
                        className="w-full"
                        disabled={createLessonMutation.isPending}
                      >
                        Criar Aula
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedModule ? (
              <p className="text-center text-muted-foreground py-12">
                Selecione um módulo para gerenciar suas aulas
              </p>
            ) : lessons.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                Nenhuma aula cadastrada neste módulo
              </p>
            ) : (
              <Tabs defaultValue="list">
                <TabsList className="mb-4">
                  <TabsTrigger value="list">Lista de Aulas</TabsTrigger>
                  {selectedLesson && <TabsTrigger value="materials">Materiais</TabsTrigger>}
                </TabsList>

                <TabsContent value="list">
                  <div className="space-y-2">
                    {lessons.map((lesson, index) => (
                      <div
                        key={lesson.id}
                        className={`p-4 rounded-lg border transition-all ${
                          selectedLesson?.id === lesson.id 
                            ? 'bg-secondary/10 border-secondary' 
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => setSelectedLesson(lesson)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{lesson.title}</h4>
                                {lesson.is_free && <Badge variant="secondary" className="text-xs">Grátis</Badge>}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {lesson.description}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                {lesson.duration_minutes && lesson.duration_minutes > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {lesson.duration_minutes} min
                                  </span>
                                )}
                                {(lesson.video_url || lesson.video_file_url) && (
                                  <span className="flex items-center gap-1">
                                    <Video className="w-3 h-3" />
                                    Vídeo
                                  </span>
                                )}
                                {((lesson as any).audio_url || (lesson as any).audio_file_url) && (
                                  <span className="flex items-center gap-1">
                                    <FileAudio className="w-3 h-3" />
                                    Áudio
                                  </span>
                                )}
                                {lesson.content && (
                                  <span className="flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    Conteúdo
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingLesson(lesson);
                                setShowLessonEditor(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteLessonMutation.mutate(lesson.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="materials">
                  {selectedLesson && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Materiais de: {selectedLesson.title}</h4>
                        <div className="flex gap-2">
                          <input
                            type="file"
                            ref={videoInputRef}
                            className="hidden"
                            accept="video/*"
                            onChange={handleVideoUpload}
                          />
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => videoInputRef.current?.click()}
                            disabled={uploading}
                          >
                            <Video className="w-4 h-4 mr-2" />
                            Upload Vídeo
                          </Button>
                          <Dialog open={showMaterialForm} onOpenChange={setShowMaterialForm}>
                            <DialogTrigger asChild>
                              <Button size="sm">
                                <Upload className="w-4 h-4 mr-2" />
                                Adicionar Material
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Adicionar Material</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Título</Label>
                                  <Input
                                    value={materialForm.title}
                                    onChange={(e) => setMaterialForm(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Nome do material"
                                  />
                                </div>
                                <div>
                                  <Label>Descrição (opcional)</Label>
                                  <Textarea
                                    value={materialForm.description}
                                    onChange={(e) => setMaterialForm(prev => ({ ...prev, description: e.target.value }))}
                                  />
                                </div>
                                <div>
                                  <Label>Arquivo</Label>
                                  <Input
                                    type="file"
                                    onChange={(e) => setMaterialForm(prev => ({ 
                                      ...prev, 
                                      file: e.target.files?.[0] || null 
                                    }))}
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg"
                                  />
                                </div>
                                <Button 
                                  onClick={handleMaterialUpload}
                                  className="w-full"
                                  disabled={uploading || !materialForm.file}
                                >
                                  {uploading ? "Enviando..." : "Adicionar Material"}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>

                      {selectedLesson.video_file_url && (
                        <div className="p-3 rounded-lg border bg-muted/50 flex items-center gap-3">
                          <Video className="w-5 h-5 text-primary" />
                          <span className="flex-1">Vídeo da aula</span>
                          <Button size="sm" variant="outline" asChild>
                            <a href={selectedLesson.video_file_url} target="_blank" rel="noopener noreferrer">
                              Ver vídeo
                            </a>
                          </Button>
                        </div>
                      )}

                      <div className="space-y-2">
                        {materials.map((material) => (
                          <div key={material.id} className="p-3 rounded-lg border flex items-center gap-3">
                            <FileText className="w-5 h-5 text-primary" />
                            <div className="flex-1">
                              <p className="font-medium">{material.title}</p>
                              {material.description && (
                                <p className="text-sm text-muted-foreground">{material.description}</p>
                              )}
                            </div>
                            <Button size="sm" variant="outline" asChild>
                              <a href={material.file_url} target="_blank" rel="noopener noreferrer">
                                <Download className="w-4 h-4" />
                              </a>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-destructive"
                              onClick={() => deleteMaterialMutation.mutate(material.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}

                        {materials.length === 0 && !selectedLesson.video_file_url && (
                          <p className="text-center text-muted-foreground py-8">
                            Nenhum material adicional
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lesson Editor Modal */}
      {showLessonEditor && editingLesson && selectedModule && (
        <LessonEditor
          lesson={editingLesson}
          moduleId={selectedModule.id}
          onClose={() => {
            setShowLessonEditor(false);
            setEditingLesson(null);
          }}
          onSave={() => {
            setShowLessonEditor(false);
            setEditingLesson(null);
          }}
        />
      )}
    </div>
  );
}
