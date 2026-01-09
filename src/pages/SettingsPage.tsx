
import React, { useState } from "react";
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

export default function SettingsPage() {
  const { user } = useAuth();
  const profile = useCurrentProfile();
  const { themes, currentTheme, isDarkMode, saveTheme, toggleDarkMode } = useTheme();
  const [showEmail, setShowEmail] = useState(false);

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
          {/* Toggle Modo Escuro - Destaque Principal */}
          <Card className="overflow-hidden">
            <div className={cn(
              "p-6 transition-all duration-300",
              isDarkMode 
                ? "bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900" 
                : "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50"
            )}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "relative p-4 rounded-2xl transition-all duration-500 shadow-lg",
                    isDarkMode 
                      ? "bg-gradient-to-br from-indigo-600 to-purple-700" 
                      : "bg-gradient-to-br from-amber-400 to-orange-500"
                  )}>
                    {isDarkMode ? (
                      <Moon className="h-8 w-8 text-white" />
                    ) : (
                      <Sun className="h-8 w-8 text-white" />
                    )}
                    <Sparkles className={cn(
                      "absolute -top-1 -right-1 h-4 w-4 transition-opacity duration-300",
                      isDarkMode ? "text-purple-300 opacity-100" : "text-amber-300 opacity-100"
                    )} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">
                      Modo {isDarkMode ? 'Escuro' : 'Claro'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isDarkMode 
                        ? 'Interface escura, ideal para ambientes com pouca luz' 
                        : 'Interface clara, ideal para uso durante o dia'}
                    </p>
                  </div>
                </div>
                
                {/* Toggle Button Personalizado */}
                <button
                  onClick={() => toggleDarkMode()}
                  className={cn(
                    "relative w-20 h-10 rounded-full transition-all duration-300 focus:outline-none focus:ring-4",
                    isDarkMode 
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 focus:ring-purple-500/30" 
                      : "bg-gradient-to-r from-amber-400 to-orange-500 focus:ring-amber-500/30"
                  )}
                  aria-label="Alternar modo escuro"
                >
                  <div className={cn(
                    "absolute top-1 w-8 h-8 rounded-full bg-white shadow-md transition-all duration-300 flex items-center justify-center",
                    isDarkMode ? "left-11" : "left-1"
                  )}>
                    {isDarkMode ? (
                      <Moon className="h-4 w-4 text-purple-600" />
                    ) : (
                      <Sun className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                </button>
              </div>
            </div>
          </Card>

          {/* Seleção de Temas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Tema de Cores
              </CardTitle>
              <CardDescription>
                Escolha um esquema de cores que combine com seu estilo. Os temas funcionam tanto no modo claro quanto escuro.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {themes.map((theme) => {
                  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;
                  const isActive = currentTheme === theme.name;
                  return (
                    <button
                      key={theme.name}
                      onClick={() => saveTheme(theme.name)}
                      className={cn(
                        "group relative p-4 rounded-xl border-2 transition-all duration-200 text-left",
                        "hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary/50",
                        isActive 
                          ? "border-primary bg-primary/5 shadow-md" 
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {/* Círculos de cores */}
                      <div className="flex gap-1.5 mb-3">
                        <div
                          className="w-6 h-6 rounded-full shadow-sm ring-1 ring-black/10"
                          style={{ backgroundColor: `hsl(${colors.primary})` }}
                        />
                        <div
                          className="w-6 h-6 rounded-full shadow-sm ring-1 ring-black/10"
                          style={{ backgroundColor: `hsl(${colors.secondary})` }}
                        />
                        <div
                          className="w-6 h-6 rounded-full shadow-sm ring-1 ring-black/10"
                          style={{ backgroundColor: `hsl(${colors.accent})` }}
                        />
                      </div>
                      
                      {/* Nome e descrição */}
                      <div className="space-y-0.5">
                        <span className="text-sm font-semibold block">{theme.label}</span>
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {theme.description}
                        </span>
                      </div>
                      
                      {/* Indicador de selecionado */}
                      {isActive && (
                        <div className="absolute top-2 right-2">
                          <div className="bg-primary text-primary-foreground rounded-full p-1">
                            <CheckCircle className="h-3.5 w-3.5" />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              
              <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Os temas são salvos automaticamente na sua conta
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
