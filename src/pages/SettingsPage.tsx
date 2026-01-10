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
  Sparkles,
  Crown,
  Building2,
  Lock
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
import { DefaultTheme } from "@/hooks/useThemes";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

// Função para aplicar preview temporário
const applyPreviewTheme = (colors: Record<string, string>, isDark: boolean) => {
  const root = document.documentElement;
  Object.entries(colors).forEach(([key, value]) => {
    if (key === 'primary') root.style.setProperty('--primary', value);
    if (key === 'secondary') root.style.setProperty('--secondary', value);
    if (key === 'accent') root.style.setProperty('--accent', value);
  });
};

// Badge do plano
const PlanBadge = ({ plan }: { plan: 'free' | 'pro' | 'business' }) => {
  if (plan === 'free') return null;
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "text-[9px] px-1.5 py-0 font-bold uppercase tracking-wide",
        plan === 'pro' && "bg-gradient-to-r from-primary/20 to-secondary/20 border-primary/40 text-primary",
        plan === 'business' && "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/40 text-amber-600 dark:text-amber-400"
      )}
    >
      {plan === 'pro' && <Crown className="h-2.5 w-2.5 mr-0.5" />}
      {plan === 'business' && <Building2 className="h-2.5 w-2.5 mr-0.5" />}
      {plan}
    </Badge>
  );
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

  const navigate = useNavigate();

  // Integrado com hook de subscription real
  const { data: subscription } = useQuery({
    queryKey: ['user-subscription', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('subscriptions')
        .select('plan')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user
  });
  
  const userPlan = (subscription?.plan || 'free') as 'free' | 'pro' | 'business';

  // Verificar se tema está disponível para o plano
  const isThemeAvailable = (theme: DefaultTheme) => {
    if (theme.plan === 'free') return true;
    if (theme.plan === 'pro') return userPlan === 'pro' || userPlan === 'business';
    if (theme.plan === 'business') return userPlan === 'business';
    return false;
  };

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

  // Agrupar temas por plano
  const freeThemes = themes.filter(t => t.plan === 'free');
  const proThemes = themes.filter(t => t.plan === 'pro');
  const businessThemes = themes.filter(t => t.plan === 'business');

  const renderThemeCard = (theme: DefaultTheme) => {
    const colors = isDarkMode ? theme.colors.dark : theme.colors.light;
    const isActive = currentTheme === theme.name;
    const isHovered = hoveredTheme === theme.name;
    const available = isThemeAvailable(theme);
    
    return (
      <button
        key={theme.name}
        disabled={!available}
        onClick={() => {
          if (available) {
            saveTheme(theme.name);
            setHoveredTheme(null);
          }
        }}
        onMouseEnter={() => {
          // Preview funciona para todos os temas, mesmo bloqueados
          if (previewTimeoutRef.current) {
            clearTimeout(previewTimeoutRef.current);
          }
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
          applyTheme(currentTheme);
        }}
        className={cn(
          "group relative p-3 rounded-xl border-2 transition-all duration-300 text-left",
          "hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary/50",
          !available && "cursor-not-allowed",
          isActive 
            ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20" 
            : isHovered
              ? "border-primary/60 bg-primary/5 shadow-lg"
              : "border-border hover:border-primary/50"
        )}
      >
        {/* Lock para temas indisponíveis - apenas indicador visual, não bloqueia hover */}
        {!available && (
          <div className="absolute top-1 left-1 z-10">
            <div className="p-1 rounded-full bg-background/80 backdrop-blur-sm">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>
        )}
        
        {/* Círculos de cores */}
        <div className="flex gap-1 mb-2">
          <div
            className={cn(
              "w-6 h-6 rounded-full shadow-sm ring-1 ring-black/10 transition-transform duration-300",
              (isHovered || isActive) && available && "scale-110"
            )}
            style={{ backgroundColor: `hsl(${colors.primary})` }}
          />
          <div
            className={cn(
              "w-6 h-6 rounded-full shadow-sm ring-1 ring-black/10 transition-transform duration-300 delay-75",
              (isHovered || isActive) && available && "scale-110"
            )}
            style={{ backgroundColor: `hsl(${colors.secondary})` }}
          />
          <div
            className={cn(
              "w-6 h-6 rounded-full shadow-sm ring-1 ring-black/10 transition-transform duration-300 delay-150",
              (isHovered || isActive) && available && "scale-110"
            )}
            style={{ backgroundColor: `hsl(${colors.accent})` }}
          />
        </div>
        
        {/* Nome e badges */}
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-sm font-semibold truncate">{theme.label}</span>
          <PlanBadge plan={theme.plan} />
        </div>
        
        {/* Descrição */}
        <span className="text-[11px] text-muted-foreground line-clamp-2 leading-tight">
          {theme.description}
        </span>
        
        {/* Indicador de selecionado */}
        {isActive && (
          <div className="absolute top-2 right-2">
            <div className="bg-primary text-primary-foreground rounded-full p-0.5 animate-scale-in">
              <CheckCircle className="h-3.5 w-3.5" />
            </div>
          </div>
        )}
        
        {/* Preview badge */}
        {isHovered && !isActive && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-[9px] px-1 py-0 animate-fade-in">
              {available ? 'Preview' : 'Bloqueado'}
            </Badge>
          </div>
        )}
      </button>
    );
  };

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
            <Badge variant="secondary" className="ml-1 text-[9px] px-1 py-0 h-4 bg-secondary/20 text-secondary border-secondary/30">
              Novo
            </Badge>
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

          {/* Temas Gratuitos */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="h-5 w-5 text-primary" />
                Temas Básicos
              </CardTitle>
              <CardDescription className="text-xs">
                Disponíveis para todos os planos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {freeThemes.map(renderThemeCard)}
              </div>
            </CardContent>
          </Card>

          {/* Temas Pro */}
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Crown className="h-5 w-5 text-primary" />
                    Temas Pro
                    <Badge variant="outline" className="ml-1 text-[10px] bg-primary/10 border-primary/30">
                      8 temas
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Paletas exclusivas para assinantes Pro e Business
                  </CardDescription>
                </div>
                {userPlan === 'free' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-primary/50 text-primary hover:bg-primary/10"
                    onClick={() => navigate('/app/subscription')}
                  >
                    <Crown className="h-3.5 w-3.5 mr-1.5" />
                    Upgrade
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {proThemes.map(renderThemeCard)}
              </div>
            </CardContent>
          </Card>

          {/* Temas Business */}
          <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building2 className="h-5 w-5 text-amber-500" />
                    Temas Business
                    <Badge variant="outline" className="ml-1 text-[10px] bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400">
                      Premium
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Paletas exclusivas de alto impacto visual
                  </CardDescription>
                </div>
                {userPlan !== 'business' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-amber-500/50 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                    onClick={() => navigate('/app/subscription')}
                  >
                    <Building2 className="h-3.5 w-3.5 mr-1.5" />
                    Business
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {businessThemes.map(renderThemeCard)}
              </div>
            </CardContent>
          </Card>
          
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            {themes.length} temas disponíveis • Passe o mouse para pré-visualizar
          </p>
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
