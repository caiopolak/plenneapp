import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  X, ChevronLeft, ChevronRight, BookOpen, Headphones, 
  Play, Pause, Volume2, VolumeX, Settings, Maximize2, Minimize2
} from "lucide-react";
import { Lesson, LessonMaterial } from "@/hooks/useCourseModules";
import { cn } from "@/lib/utils";

interface LessonReadingModeProps {
  lesson: Lesson;
  materials: LessonMaterial[];
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
  onComplete?: () => void;
  isCompleted?: boolean;
}

export function LessonReadingMode({
  lesson,
  materials,
  onClose,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
  onComplete,
  isCompleted
}: LessonReadingModeProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [showSettings, setShowSettings] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const audioUrl = lesson.audio_file_url || lesson.audio_url;

  // Track scroll progress for reading
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight - element.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    setReadingProgress(Math.min(progress, 100));
  };

  // Audio controls
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const seekAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'large': return 'text-lg leading-relaxed';
      case 'xlarge': return 'text-xl leading-loose';
      default: return 'text-base leading-relaxed';
    }
  };

  // Renderizar Markdown melhorado
  const renderMarkdown = (content: string) => {
    let html = content
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-8 mb-4 text-primary border-b border-border pb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-10 mb-4 text-primary">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-10 mb-6 text-primary">$1</h1>')
      // Bold and italic
      .replace(/\*\*\*(.*?)\*\*\*/gim, '<strong class="font-bold text-primary"><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-foreground">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em class="italic text-muted-foreground">$1</em>')
      // Code blocks
      .replace(/```([\s\S]*?)```/gim, '<pre class="bg-muted rounded-lg p-4 my-4 overflow-x-auto border"><code class="text-sm">$1</code></pre>')
      .replace(/`(.*?)`/gim, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
      // Blockquotes
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 my-4 italic text-muted-foreground bg-muted/30 py-2 pr-4 rounded-r">$1</blockquote>')
      // Lists
      .replace(/^\- (.*$)/gim, '<li class="ml-6 my-2 list-disc">$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-6 my-2 list-decimal">$1</li>')
      // Horizontal rules
      .replace(/^---$/gim, '<hr class="my-8 border-border" />')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary/80">$1</a>')
      // Paragraphs
      .replace(/\n\n/gim, '</p><p class="my-4">')
      .replace(/\n/gim, '<br />');

    return (
      <div 
        dangerouslySetInnerHTML={{ __html: `<p class="my-4">${html}</p>` }} 
        className={cn("prose prose-lg max-w-none dark:prose-invert", getFontSizeClass())}
      />
    );
  };

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-background flex flex-col",
      isFullscreen && "bg-background"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b bg-card shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
          <div className="hidden sm:block">
            <h2 className="font-semibold truncate max-w-[300px]">{lesson.title}</h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BookOpen className="w-3 h-3" />
              <span>Modo Leitura</span>
              {audioUrl && (
                <>
                  <span>•</span>
                  <Headphones className="w-3 h-3" />
                  <span>Áudio disponível</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Reading Progress */}
          <Badge variant="outline" className="hidden sm:flex">
            {readingProgress.toFixed(0)}% lido
          </Badge>

          {/* Font Size Toggle */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4" />
            </Button>
            {showSettings && (
              <div className="absolute right-0 top-full mt-2 bg-popover border rounded-lg p-3 shadow-lg z-10 min-w-[180px]">
                <p className="text-xs font-medium text-muted-foreground mb-2">Tamanho do texto</p>
                <div className="flex gap-1">
                  {(['normal', 'large', 'xlarge'] as const).map((size) => (
                    <Button
                      key={size}
                      variant={fontSize === size ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setFontSize(size);
                        setShowSettings(false);
                      }}
                      className="flex-1 text-xs"
                    >
                      {size === 'normal' ? 'A' : size === 'large' ? 'A+' : 'A++'}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Fullscreen Toggle */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="hidden sm:flex"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Reading Progress Bar */}
      <Progress value={readingProgress} className="h-1 rounded-none shrink-0" />

      {/* Content Area */}
      <ScrollArea 
        className="flex-1 overflow-auto"
        onScroll={handleScroll}
        ref={contentRef as any}
      >
        <div className={cn(
          "max-w-3xl mx-auto px-4 sm:px-8 py-8",
          isFullscreen && "max-w-4xl"
        )}>
          {/* Lesson Title */}
          <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-primary">{lesson.title}</h1>
          
          {lesson.description && (
            <p className="text-lg text-muted-foreground mb-8 italic border-l-4 border-primary pl-4">
              {lesson.description}
            </p>
          )}

          {/* Lesson Content */}
          {lesson.content && renderMarkdown(lesson.content)}

          {/* Materials Section */}
          {materials.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Materiais Complementares
              </h3>
              <div className="grid gap-3">
                {materials.map((material) => (
                  <a
                    key={material.id}
                    href={material.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{material.title}</p>
                      {material.description && (
                        <p className="text-sm text-muted-foreground">{material.description}</p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Complete Button */}
          <div className="mt-12 pt-8 border-t text-center">
            <Button 
              size="lg" 
              onClick={onComplete}
              disabled={isCompleted}
              className={isCompleted ? 'bg-success' : ''}
            >
              {isCompleted ? '✓ Aula Concluída' : 'Marcar como Concluída'}
            </Button>
          </div>
        </div>
      </ScrollArea>

      {/* Audio Player Bar */}
      {audioUrl && (
        <div className="border-t bg-card px-4 py-3 shrink-0">
          <audio ref={audioRef} src={audioUrl} preload="metadata" />
          
          <div className="max-w-3xl mx-auto flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={togglePlay}>
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>

            <div className="flex-1 flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-12 text-right">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={seekAudio}
                className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <span className="text-xs text-muted-foreground w-12">
                {formatTime(duration)}
              </span>
            </div>

            <Button variant="ghost" size="icon" onClick={toggleMute}>
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>

            <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
              <Headphones className="w-4 h-4" />
              <span>Áudio Guiado</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="border-t bg-card px-4 py-3 shrink-0">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={onPrevious} 
            disabled={!hasPrevious}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Anterior</span>
          </Button>

          <Button variant="ghost" onClick={onClose}>
            Fechar Leitura
          </Button>

          <Button 
            variant="outline" 
            onClick={onNext} 
            disabled={!hasNext}
            className="gap-2"
          >
            <span className="hidden sm:inline">Próxima</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
