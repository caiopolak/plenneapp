
import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Palette, 
  Bell, 
  Info,
  Calendar,
  GitBranch,
  User,
  CheckCircle,
  Moon,
  Sun,
  Eye,
  EyeOff,
  Package,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { toast } from "sonner";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { Label } from "@/components/ui/label";
import { 
  APP_VERSION, 
  getEnvironment, 
  getEnvironmentLabel, 
  formatBuildDate 
} from "@/config/appVersion";
import { cn } from "@/lib/utils";

// Função para aplicar preview temporário
const applyPreviewTheme = (colors: Record<string, string>, isDark: boolean) => {
  const root = document.documentElement;
  Object.entries(colors).forEach(([key, value]) => {
    if (key === 'primary') root.style.setProperty('--primary', value);
    if (key === 'secondary') root.style.setProperty('--secondary', value);
    if (key === 'accent') root.style.setProperty('--accent', value);
  });
};

export default function SettingsPage() {
  const { user } = useAuth();
  const profile = useCurrentProfile();
  const { themes, currentTheme, isDarkMode, saveTheme, toggleDarkMode, applyTheme } = useTheme();
  const [showEmail, setShowEmail] = useState(false);
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);
  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const environment = getEnvironment();
  const environmentLabel = getEnvironmentLabel();

  // Ocultar email mantendo primeira letra e domínio visíveis
  const maskEmail = (email: string) => {
    const [localPart, domain] = email.split("@");
    if (!domain) return "***@***";
    const maskedLocal = localPart.charAt(0) + "•".repeat(Math.max(localPart.length - 1, 3));
    return `${maskedLocal}@${domain}`;
  };

  // Nome do usuário ou fallback
  const userName = profile?.full_name || user?.user_metadata?.full_name || "Usuário";
  const userEmail = user?.email || "";

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight brand-gradient-text">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie suas preferências e configurações do aplicativo.
        </p>
      </div>

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Aparência</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span className="hidden sm:inline">Sistema</span>
          </TabsTrigger>
        </TabsList>

        {/* Aba de Aparência */}
        <TabsContent value="appearance" className="mt-6 space-y-6">
        {/* Toggle Modo Escuro - Design Unificado */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {/* Seletor único de modo */}
              <div className="p-1.5 bg-muted/50">
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => isDarkMode && toggleDarkMode()}
                    className={cn(
                      "flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-300",
                      !isDarkMode 
                        ? "bg-card text-foreground shadow-md" 
                        : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    )}
                  >
                    <Sun className={cn(
                      "h-5 w-5 transition-transform duration-300",
                      !isDarkMode && "text-amber-500"
                    )} />
                    <span>Modo Claro</span>
                  </button>
                  
                  <button
                    onClick={() => !isDarkMode && toggleDarkMode()}
                    className={cn(
                      "flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-300",
                      isDarkMode 
                        ? "bg-card text-foreground shadow-md" 
                        : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    )}
                  >
                    <Moon className={cn(
                      "h-5 w-5 transition-transform duration-300",
                      isDarkMode && "text-primary"
                    )} />
                    <span>Modo Escuro</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seleção de Temas com Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Tema de Cores
              </CardTitle>
              <CardDescription>
                Passe o mouse sobre um tema para pré-visualizar. Clique para aplicar permanentemente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {themes.map((theme) => {
                  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;
                  const isActive = currentTheme === theme.name;
                  const isHovered = hoveredTheme === theme.name;
                  
                  return (
                    <button
                      key={theme.name}
                      onClick={() => {
                        saveTheme(theme.name);
                        setHoveredTheme(null);
                      }}
                      onMouseEnter={() => {
                        // Limpar timeout anterior
                        if (previewTimeoutRef.current) {
                          clearTimeout(previewTimeoutRef.current);
                        }
                        // Delay pequeno para evitar flickering
                        previewTimeoutRef.current = setTimeout(() => {
                          setHoveredTheme(theme.name);
                          applyPreviewTheme(colors, isDarkMode);
                        }, 100);
                      }}
                      onMouseLeave={() => {
                        if (previewTimeoutRef.current) {
                          clearTimeout(previewTimeoutRef.current);
                        }
                        setHoveredTheme(null);
                        // Restaurar tema atual
                        applyTheme(currentTheme);
                      }}
                      className={cn(
                        "group relative p-4 rounded-xl border-2 transition-all duration-300 text-left",
                        "hover:shadow-xl hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-primary/50",
                        isActive 
                          ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20" 
                          : isHovered
                            ? "border-primary/60 bg-primary/5 shadow-lg"
                            : "border-border hover:border-primary/50"
                      )}
                    >
                      {/* Círculos de cores com animação */}
                      <div className="flex gap-1.5 mb-3">
                        <div
                          className={cn(
                            "w-7 h-7 rounded-full shadow-sm ring-1 ring-black/10 transition-transform duration-300",
                            (isHovered || isActive) && "scale-110"
                          )}
                          style={{ backgroundColor: `hsl(${colors.primary})` }}
                        />
                        <div
                          className={cn(
                            "w-7 h-7 rounded-full shadow-sm ring-1 ring-black/10 transition-transform duration-300 delay-75",
                            (isHovered || isActive) && "scale-110"
                          )}
                          style={{ backgroundColor: `hsl(${colors.secondary})` }}
                        />
                        <div
                          className={cn(
                            "w-7 h-7 rounded-full shadow-sm ring-1 ring-black/10 transition-transform duration-300 delay-150",
                            (isHovered || isActive) && "scale-110"
                          )}
                          style={{ backgroundColor: `hsl(${colors.accent})` }}
                        />
                      </div>
                      
                      {/* Nome e descrição */}
                      <div className="space-y-0.5">
                        <span className="text-sm font-semibold block">{theme.label}</span>
                        <span className="text-xs text-muted-foreground line-clamp-2">
                          {theme.description}
                        </span>
                      </div>
                      
                      {/* Indicador de selecionado */}
                      {isActive && (
                        <div className="absolute top-2 right-2">
                          <div className="bg-primary text-primary-foreground rounded-full p-1 animate-scale-in">
                            <CheckCircle className="h-4 w-4" />
                          </div>
                        </div>
                      )}
                      
                      {/* Preview badge */}
                      {isHovered && !isActive && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 animate-fade-in">
                            Preview
                          </Badge>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              
              <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                {themes.length} temas disponíveis • Salvos automaticamente na sua conta
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Notificações */}
        <TabsContent value="notifications" className="mt-6">
          <NotificationSettings />
        </TabsContent>

        {/* Aba do Sistema */}
        <TabsContent value="system" className="mt-6 space-y-6">
          {/* Cards de informações */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="overflow-hidden">
              <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-primary text-primary-foreground">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Versão</p>
                    <p className="text-2xl font-bold font-mono">v{APP_VERSION.version}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Build: <span className="font-mono">{APP_VERSION.buildId}</span>
                </p>
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="p-4 bg-gradient-to-br from-secondary/10 to-secondary/5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-secondary text-secondary-foreground">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Última Atualização</p>
                    <p className="text-xl font-bold">{formatBuildDate()}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <Badge 
                    variant={environment === 'production' ? 'default' : 'secondary'}
                    className={cn(
                      "text-xs",
                      environment === 'development' && 'bg-warning/20 text-warning border-warning/30',
                      environment === 'staging' && 'bg-primary/20 text-primary border-primary/30'
                    )}
                  >
                    {environmentLabel}
                  </Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* Informações do usuário */}
          {user && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Informações da Conta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{userName}</p>
                      <p className="text-sm text-muted-foreground">
                        {showEmail ? userEmail : maskEmail(userEmail)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEmail(!showEmail)}
                    className="gap-2"
                  >
                    {showEmail ? (
                      <>
                        <EyeOff className="h-4 w-4" />
                        Ocultar
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        Mostrar
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notas da versão */}
          {APP_VERSION.releaseNotes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-primary" />
                  Novidades da Versão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm">{APP_VERSION.releaseNotes}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sobre */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold brand-gradient-text">Plenne</h3>
                <p className="text-sm text-muted-foreground italic">
                  "Sua vida financeira, plena."
                </p>
                <Separator className="my-4" />
                <p className="text-xs text-muted-foreground">
                  © 2025 Plenne - Todos os direitos reservados.<br />
                  Desenvolvido com 💚 por um desenvolvedor apaixonado.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
