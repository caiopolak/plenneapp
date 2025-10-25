
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Palette, 
  Bell, 
  Shield, 
  Info,
  Calendar,
  GitBranch,
  User,
  CheckCircle,
  Moon,
  Sun
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface AppVersion {
  version: string;
  buildDate: string;
  lastUpdate: string;
  environment: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { themes, currentTheme, isDarkMode, saveTheme, toggleDarkMode } = useTheme();
  const [appVersion, setAppVersion] = useState<AppVersion>({
    version: "2.1.4",
    buildDate: new Date().toISOString().split('T')[0],
    lastUpdate: new Date().toLocaleString('pt-BR'),
    environment: "production"
  });

  // Simular atualização da versão baseada em mudanças do projeto
  useEffect(() => {
    const updateVersion = () => {
      setAppVersion(prev => ({
        ...prev,
        lastUpdate: new Date().toLocaleString('pt-BR'),
        version: `2.1.${Math.floor(Date.now() / 1000) % 100}` // Gera versão baseada no timestamp
      }));
    };

    // Atualizar a cada 30 minutos para simular deploys
    const interval = setInterval(updateVersion, 30 * 60 * 1000);
    
    // Atualizar na inicialização
    updateVersion();

    return () => clearInterval(interval);
  }, []);

  const handleThemeChange = () => {
    toast.info("Configuração de temas estará disponível em breve!");
  };

  const handleNotificationSettings = () => {
    toast.info("Configurações de notificação serão implementadas!");
  };

  const handlePrivacySettings = () => {
    toast.info("Configurações de privacidade em desenvolvimento!");
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight brand-gradient-text">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie suas preferências e configurações do aplicativo.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
        {/* Configurações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  {isDarkMode ? (
                    <Moon className="h-5 w-5 text-primary" />
                  ) : (
                    <Sun className="h-5 w-5 text-primary" />
                  )}
                  <div>
                    <Label htmlFor="dark-mode" className="font-medium cursor-pointer">
                      Modo Escuro
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {isDarkMode ? 'Ativado' : 'Desativado'}
                    </p>
                  </div>
                </div>
                <Switch
                  id="dark-mode"
                  checked={isDarkMode}
                  onCheckedChange={toggleDarkMode}
                />
              </div>

              <Separator />

              <div>
                <h4 className="font-medium">Tema de Cores</h4>
                <p className="text-sm text-muted-foreground">
                  Escolha um esquema de cores (funciona em modo claro e escuro)
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {themes.map((theme) => {
                  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;
                  return (
                    <Button
                      key={theme.name}
                      onClick={() => saveTheme(theme.name)}
                      variant={currentTheme === theme.name ? "default" : "outline"}
                      className={`h-16 flex flex-col gap-2 p-3 relative ${
                        currentTheme === theme.name ? 'ring-2 ring-primary' : ''
                      }`}
                    >
                      <div className="flex gap-1.5">
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: `hsl(${colors.primary})` }}
                        />
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: `hsl(${colors.secondary})` }}
                        />
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: `hsl(${colors.accent})` }}
                        />
                      </div>
                      <span className="text-xs font-medium">{theme.label}</span>
                      {currentTheme === theme.name && (
                        <div className="absolute top-1 right-1">
                          <CheckCircle className="h-4 w-4 text-primary" />
                        </div>
                      )}
                    </Button>
                  );
                })}
              </div>
              <div className="text-xs text-muted-foreground">
                💡 Os temas são aplicados instantaneamente e salvos automaticamente na sua conta
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium">Notificações</h4>
              <p className="text-sm text-muted-foreground">
                Configure alertas e lembretes
              </p>
              <Button 
                onClick={handleNotificationSettings}
                variant="outline" 
                className="w-full"
              >
                <Bell className="h-4 w-4 mr-2" />
                Gerenciar Notificações
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium">Privacidade</h4>
              <p className="text-sm text-muted-foreground">
                Configurações de segurança e privacidade
              </p>
              <Button 
                onClick={handlePrivacySettings}
                variant="outline" 
                className="w-full"
              >
                <Shield className="h-4 w-4 mr-2" />
                Configurar Privacidade
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Informações do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Informações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Versão:</span>
                <Badge variant="secondary">{appVersion.version}</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Ambiente:</span>
                <Badge variant={appVersion.environment === 'production' ? 'default' : 'secondary'}>
                  {appVersion.environment}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Build:</span>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {appVersion.buildDate}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Última Atualização:</span>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <GitBranch className="h-3 w-3" />
                  {appVersion.lastUpdate}
                </span>
              </div>

              {user && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Usuário:</span>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {user.email}
                  </span>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Sobre o Plenne</h4>
              <p className="text-xs text-muted-foreground">
                © 2025 Plenne - Todos os direitos reservados.<br />
                Projeto criado por apenas 1 dev! 💚
              </p>
            </div>
          </CardContent>
        </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="system" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Informações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Versão:</span>
                  <Badge variant="secondary">{appVersion.version}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Ambiente:</span>
                  <Badge variant={appVersion.environment === 'production' ? 'default' : 'secondary'}>
                    {appVersion.environment}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
