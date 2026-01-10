import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, Video, FileAudio, Eye, Save, X, Link, 
  FileText, Image, Bold, Italic, List, Quote, Code, Heading
} from "lucide-react";
import { useCourseModules, Lesson } from "@/hooks/useCourseModules";
import { useToast } from "@/hooks/use-toast";
import { renderPreviewMarkdown } from "@/lib/markdownSanitizer";

interface LessonEditorProps {
  lesson: Lesson;
  moduleId: string;
  onClose: () => void;
  onSave: () => void;
}

export function LessonEditor({ lesson, moduleId, onClose, onSave }: LessonEditorProps) {
  const { updateLessonMutation, uploadFile } = useCourseModules();
  const { toast } = useToast();
  
  const [form, setForm] = useState({
    title: lesson.title || "",
    description: lesson.description || "",
    content: lesson.content || "",
    video_url: lesson.video_url || "",
    video_file_url: lesson.video_file_url || "",
    audio_url: (lesson as any).audio_url || "",
    audio_file_url: (lesson as any).audio_file_url || "",
    duration_minutes: lesson.duration_minutes || 0,
    is_free: lesson.is_free || false
  });

  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [audioUploadProgress, setAudioUploadProgress] = useState(0);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Handle video upload
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande", description: "O vídeo deve ter no máximo 100MB", variant: "destructive" });
      return;
    }

    setUploadingVideo(true);
    setVideoUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setVideoUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const path = `videos/${moduleId}/${lesson.id}/${Date.now()}_${file.name}`;
      const url = await uploadFile(file, path);

      clearInterval(progressInterval);
      setVideoUploadProgress(100);

      setForm(prev => ({ ...prev, video_file_url: url }));
      toast({ title: "Vídeo enviado com sucesso!" });
    } catch (error: any) {
      toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
    } finally {
      setUploadingVideo(false);
      setVideoUploadProgress(0);
    }
  };

  // Handle audio upload
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande", description: "O áudio deve ter no máximo 50MB", variant: "destructive" });
      return;
    }

    setUploadingAudio(true);
    setAudioUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setAudioUploadProgress(prev => Math.min(prev + 15, 90));
      }, 150);

      const path = `audios/${moduleId}/${lesson.id}/${Date.now()}_${file.name}`;
      const url = await uploadFile(file, path);

      clearInterval(progressInterval);
      setAudioUploadProgress(100);

      setForm(prev => ({ ...prev, audio_file_url: url }));
      toast({ title: "Áudio enviado com sucesso!" });
    } catch (error: any) {
      toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
    } finally {
      setUploadingAudio(false);
      setAudioUploadProgress(0);
    }
  };

  // Insert markdown formatting
  const insertMarkdown = (prefix: string, suffix: string = "") => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = form.content.substring(start, end);
    const newText = form.content.substring(0, start) + prefix + selectedText + suffix + form.content.substring(end);
    
    setForm(prev => ({ ...prev, content: newText }));

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  // Save lesson
  const handleSave = async () => {
    try {
      await updateLessonMutation.mutateAsync({
        id: lesson.id,
        title: form.title,
        description: form.description,
        content: form.content,
        video_url: form.video_url,
        video_file_url: form.video_file_url,
        duration_minutes: form.duration_minutes,
        is_free: form.is_free
      });
      
      // Update audio separately if needed
      if (form.audio_url || form.audio_file_url) {
        await updateLessonMutation.mutateAsync({
          id: lesson.id,
          audio_url: form.audio_url,
          audio_file_url: form.audio_file_url
        } as any);
      }

      toast({ title: "Aula salva com sucesso!" });
      onSave();
    } catch (error: any) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    }
  };

  // Preview markdown (sanitizado)
  const renderMarkdownPreview = (content: string) => {
    const sanitizedHtml = renderPreviewMarkdown(content);
    return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur overflow-auto">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Editar Aula</h1>
              <p className="text-sm text-muted-foreground">Personalize todo o conteúdo da sua aula</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
              <Eye className="w-4 h-4 mr-2" />
              {previewMode ? "Editar" : "Visualizar"}
            </Button>
            <Button onClick={handleSave} disabled={updateLessonMutation.isPending}>
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>

        <Tabs defaultValue="content" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
            <TabsTrigger value="video">Vídeo</TabsTrigger>
            <TabsTrigger value="audio">Áudio</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label>Título da Aula</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  className="text-lg font-medium"
                />
              </div>

              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  placeholder="Uma breve descrição do que será aprendido..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Conteúdo (Markdown)</Label>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertMarkdown("# ", "")}>
                      <Heading className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertMarkdown("**", "**")}>
                      <Bold className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertMarkdown("*", "*")}>
                      <Italic className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertMarkdown("- ", "")}>
                      <List className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertMarkdown("> ", "")}>
                      <Quote className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertMarkdown("`", "`")}>
                      <Code className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {previewMode ? (
                  <Card className="min-h-[400px] p-6">
                    <div className="prose prose-lg max-w-none dark:prose-invert">
                      {renderMarkdownPreview(form.content)}
                    </div>
                  </Card>
                ) : (
                  <Textarea
                    ref={contentRef}
                    value={form.content}
                    onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
                    rows={20}
                    className="font-mono text-sm"
                    placeholder={`# Título Principal

## Introdução
Escreva uma introdução envolvente para a aula...

## Conceitos Principais

### Conceito 1
Explique o primeiro conceito com **destaque** para pontos importantes.

- Ponto importante 1
- Ponto importante 2
- Ponto importante 3

> Dica: Use citações para destacar insights importantes.

### Conceito 2
Continue explicando outros conceitos...

## Exercício Prático
Inclua exercícios para fixação do conteúdo.

## Conclusão
Resuma os pontos principais aprendidos.`}
                  />
                )}
              </div>
            </div>
          </TabsContent>

          {/* Video Tab */}
          <TabsContent value="video" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload de Vídeo (Recomendado)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  type="file"
                  ref={videoInputRef}
                  className="hidden"
                  accept="video/mp4,video/webm,video/ogg"
                  onChange={handleVideoUpload}
                />

                {form.video_file_url ? (
                  <div className="space-y-3">
                    <div className="aspect-video rounded-lg overflow-hidden border bg-muted">
                      <video src={form.video_file_url} controls className="w-full h-full" />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => videoInputRef.current?.click()}>
                        Trocar Vídeo
                      </Button>
                      <Button variant="destructive" onClick={() => setForm(prev => ({ ...prev, video_file_url: "" }))}>
                        Remover
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => videoInputRef.current?.click()}
                  >
                    <Video className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="font-medium">Clique para fazer upload do vídeo</p>
                    <p className="text-sm text-muted-foreground mt-1">MP4, WebM ou OGG (máx. 100MB)</p>
                  </div>
                )}

                {uploadingVideo && (
                  <div className="space-y-2">
                    <Progress value={videoUploadProgress} />
                    <p className="text-sm text-muted-foreground text-center">Enviando vídeo... {videoUploadProgress}%</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="w-5 h-5" />
                  Ou use um Link de Vídeo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  value={form.video_url}
                  onChange={(e) => setForm(prev => ({ ...prev, video_url: e.target.value }))}
                  placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/..."
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Suporta YouTube, Vimeo e links diretos de vídeo
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audio Tab */}
          <TabsContent value="audio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileAudio className="w-5 h-5" />
                  Áudio / Podcast da Aula
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Adicione um áudio guiado para que os alunos possam ouvir enquanto leem o conteúdo.
                </p>

                <input
                  type="file"
                  ref={audioInputRef}
                  className="hidden"
                  accept="audio/mp3,audio/wav,audio/ogg,audio/m4a"
                  onChange={handleAudioUpload}
                />

                {form.audio_file_url ? (
                  <div className="space-y-3">
                    <div className="p-4 rounded-lg border bg-muted/50">
                      <audio src={form.audio_file_url} controls className="w-full" />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => audioInputRef.current?.click()}>
                        Trocar Áudio
                      </Button>
                      <Button variant="destructive" onClick={() => setForm(prev => ({ ...prev, audio_file_url: "" }))}>
                        Remover
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => audioInputRef.current?.click()}
                  >
                    <FileAudio className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="font-medium">Clique para fazer upload do áudio</p>
                    <p className="text-sm text-muted-foreground mt-1">MP3, WAV, OGG ou M4A (máx. 50MB)</p>
                  </div>
                )}

                {uploadingAudio && (
                  <div className="space-y-2">
                    <Progress value={audioUploadProgress} />
                    <p className="text-sm text-muted-foreground text-center">Enviando áudio... {audioUploadProgress}%</p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <Label>Ou cole um link de áudio externo</Label>
                  <Input
                    value={form.audio_url}
                    onChange={(e) => setForm(prev => ({ ...prev, audio_url: e.target.value }))}
                    placeholder="https://example.com/audio.mp3"
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações da Aula</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Duração estimada (minutos)</Label>
                  <Input
                    type="number"
                    value={form.duration_minutes}
                    onChange={(e) => setForm(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 0 }))}
                    className="w-32 mt-2"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.is_free}
                    onCheckedChange={(checked) => setForm(prev => ({ ...prev, is_free: checked }))}
                  />
                  <div>
                    <Label>Aula Gratuita</Label>
                    <p className="text-sm text-muted-foreground">Disponível para todos os usuários, mesmo sem assinatura</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
