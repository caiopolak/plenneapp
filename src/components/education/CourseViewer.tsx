import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, Play, Lock, CheckCircle, Clock, FileText, 
  Download, ChevronLeft, ChevronRight, Video
} from "lucide-react";
import { useCourseModules, CourseModule, Lesson } from "@/hooks/useCourseModules";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function CourseViewer() {
  const { user } = useAuth();
  const { modules, modulesLoading, useLessons, useMaterials, userProgress, updateProgressMutation } = useCourseModules();
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);

  const { data: lessons = [] } = useLessons(selectedModule?.id || null);
  const { data: materials = [] } = useMaterials(selectedLesson?.id || null);

  // Buscar plano do usuário
  const { data: userPlan } = useQuery({
    queryKey: ['user-plan', user?.id],
    queryFn: async () => {
      if (!user) return 'free';
      const { data } = await supabase
        .from('subscriptions')
        .select('plan')
        .eq('user_id', user.id)
        .single();
      return data?.plan || 'free';
    },
    enabled: !!user
  });

  // Filtrar apenas módulos publicados
  const publishedModules = modules.filter(m => m.published);

  // Calcular progresso do módulo
  const getModuleProgress = (moduleId: string) => {
    const moduleLessons = lessons.filter(l => l.module_id === moduleId);
    if (moduleLessons.length === 0) return 0;
    
    const completed = moduleLessons.filter(l => userProgress[l.id]?.completed).length;
    return (completed / moduleLessons.length) * 100;
  };

  // Verificar se aula está disponível
  const isLessonAvailable = (lesson: Lesson) => {
    if (lesson.is_free) return true;
    if (userPlan === 'pro' || userPlan === 'business') return true;
    return false;
  };

  // Marcar aula como concluída
  const markAsCompleted = async () => {
    if (!selectedLesson) return;
    await updateProgressMutation.mutateAsync({
      lessonId: selectedLesson.id,
      completed: true
    });
  };

  // Navegação entre aulas
  const currentLessonIndex = lessons.findIndex(l => l.id === selectedLesson?.id);
  const hasPrevious = currentLessonIndex > 0;
  const hasNext = currentLessonIndex < lessons.length - 1;

  const goToPrevious = () => {
    if (hasPrevious) {
      setSelectedLesson(lessons[currentLessonIndex - 1]);
    }
  };

  const goToNext = () => {
    if (hasNext) {
      setSelectedLesson(lessons[currentLessonIndex + 1]);
    }
  };

  // Renderizar conteúdo Markdown simples
  const renderMarkdown = (content: string) => {
    // Conversão básica de Markdown para HTML
    let html = content
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/^\- (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/\n/gim, '<br />');
    
    return <div dangerouslySetInnerHTML={{ __html: html }} className="prose prose-sm max-w-none" />;
  };

  // Renderizar player de vídeo
  const renderVideoPlayer = (url: string) => {
    // Detectar tipo de URL
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be') 
        ? url.split('/').pop() 
        : new URLSearchParams(new URL(url).search).get('v');
      return (
        <iframe
          className="w-full aspect-video rounded-lg"
          src={`https://www.youtube.com/embed/${videoId}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    } else if (url.includes('vimeo.com')) {
      const videoId = url.split('/').pop();
      return (
        <iframe
          className="w-full aspect-video rounded-lg"
          src={`https://player.vimeo.com/video/${videoId}`}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      );
    } else {
      // Vídeo direto (MP4, etc)
      return (
        <video 
          className="w-full aspect-video rounded-lg" 
          controls
          src={url}
        />
      );
    }
  };

  if (modulesLoading) {
    return <div className="text-center py-8">Carregando cursos...</div>;
  }

  // Visualização de aula
  if (showPlayer && selectedLesson) {
    const isCompleted = userProgress[selectedLesson.id]?.completed;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setShowPlayer(false)}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Voltar ao módulo
          </Button>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{selectedLesson.title}</h2>
            <p className="text-muted-foreground text-sm">{selectedModule?.title}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Player de vídeo */}
            {(selectedLesson.video_url || selectedLesson.video_file_url) && (
              <div className="rounded-lg overflow-hidden border">
                {renderVideoPlayer(selectedLesson.video_file_url || selectedLesson.video_url || '')}
              </div>
            )}

            {/* Conteúdo da aula */}
            {selectedLesson.content && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Conteúdo da Aula
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderMarkdown(selectedLesson.content)}
                </CardContent>
              </Card>
            )}

            {/* Materiais complementares */}
            {materials.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Materiais Complementares
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {materials.map((material) => (
                      <a
                        key={material.id}
                        href={material.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
                      >
                        <FileText className="w-5 h-5 text-primary" />
                        <div className="flex-1">
                          <p className="font-medium">{material.title}</p>
                          {material.description && (
                            <p className="text-sm text-muted-foreground">{material.description}</p>
                          )}
                        </div>
                        <Download className="w-4 h-4 text-muted-foreground" />
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar com lista de aulas */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Aulas do Módulo</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {lessons.map((lesson, index) => {
                    const isAvailable = isLessonAvailable(lesson);
                    const isActive = selectedLesson?.id === lesson.id;
                    const lessonCompleted = userProgress[lesson.id]?.completed;

                    return (
                      <div
                        key={lesson.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          isActive ? 'bg-primary/10 border-primary' : 
                          isAvailable ? 'hover:bg-muted' : 'opacity-60'
                        }`}
                        onClick={() => isAvailable && setSelectedLesson(lesson)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            lessonCompleted ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'
                          }`}>
                            {lessonCompleted ? <CheckCircle className="w-4 h-4" /> : index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate text-sm">{lesson.title}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {lesson.duration_minutes && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {lesson.duration_minutes}m
                                </span>
                              )}
                              {!isAvailable && <Lock className="w-3 h-3" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Navegação e conclusão */}
        <div className="flex items-center justify-between border-t pt-4">
          <Button variant="outline" onClick={goToPrevious} disabled={!hasPrevious}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Aula Anterior
          </Button>

          <Button 
            onClick={markAsCompleted}
            disabled={isCompleted || updateProgressMutation.isPending}
            className={isCompleted ? 'bg-success' : ''}
          >
            {isCompleted ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Concluída
              </>
            ) : (
              'Marcar como Concluída'
            )}
          </Button>

          <Button variant="outline" onClick={goToNext} disabled={!hasNext}>
            Próxima Aula
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // Lista de aulas do módulo
  if (selectedModule) {
    const moduleProgress = getModuleProgress(selectedModule.id);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setSelectedModule(null)}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Voltar aos Módulos
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{selectedModule.title}</CardTitle>
                <p className="text-muted-foreground mt-2">{selectedModule.description}</p>
                <div className="flex gap-2 mt-3">
                  <Badge variant="outline">{selectedModule.level}</Badge>
                  <Badge variant="outline">{selectedModule.category}</Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span>Progresso do módulo</span>
                <span>{moduleProgress.toFixed(0)}%</span>
              </div>
              <Progress value={moduleProgress} className="h-2" />
            </div>

            <div className="space-y-3">
              {lessons.map((lesson, index) => {
                const isAvailable = isLessonAvailable(lesson);
                const isCompleted = userProgress[lesson.id]?.completed;

                return (
                  <div
                    key={lesson.id}
                    className={`p-4 rounded-lg border transition-all ${
                      isAvailable ? 'hover:bg-muted cursor-pointer' : 'opacity-60'
                    }`}
                    onClick={() => {
                      if (isAvailable) {
                        setSelectedLesson(lesson);
                        setShowPlayer(true);
                      }
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        isCompleted ? 'bg-success text-success-foreground' : 'bg-primary/10 text-primary'
                      }`}>
                        {isCompleted ? <CheckCircle className="w-5 h-5" /> : index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{lesson.title}</h4>
                          {lesson.is_free && <Badge variant="secondary" className="text-xs">Grátis</Badge>}
                          {!isAvailable && <Lock className="w-4 h-4 text-muted-foreground" />}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{lesson.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          {lesson.duration_minutes && lesson.duration_minutes > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {lesson.duration_minutes} minutos
                            </span>
                          )}
                          {(lesson.video_url || lesson.video_file_url) && (
                            <span className="flex items-center gap-1">
                              <Video className="w-3 h-3" />
                              Vídeo
                            </span>
                          )}
                        </div>
                      </div>
                      {isAvailable && (
                        <Button variant="ghost" size="sm">
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}

              {lessons.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma aula disponível neste módulo ainda
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Lista de módulos
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          Cursos de Educação Financeira
        </h2>
        <p className="text-muted-foreground">
          Aprenda a gerenciar suas finanças com nossos cursos completos
        </p>
      </div>

      {publishedModules.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Nenhum curso disponível ainda</p>
            <p className="text-sm text-muted-foreground/70 mt-2">
              Novos cursos serão adicionados em breve!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedModules.map((module) => (
            <Card 
              key={module.id} 
              className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
              onClick={() => setSelectedModule(module)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant="outline">{module.level}</Badge>
                </div>
                <CardTitle className="mt-4">{module.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm line-clamp-3">
                  {module.description}
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <Badge variant="secondary">{module.category}</Badge>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  Ver Curso
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
