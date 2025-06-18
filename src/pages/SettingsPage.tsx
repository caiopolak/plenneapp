
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cog, Palette, Bell, Shield, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();

  const handleComingSoon = () => {
    toast({
      title: "Em breve!",
      description: "Esta funcionalidade será implementada em futuras atualizações.",
    });
  };

  const settingsCategories = [
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Aparência",
      description: "Personalize temas, cores e layout do aplicativo",
      status: "Em breve",
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Notificações",
      description: "Configure alertas, lembretes e notificações push",
      status: "Em breve",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Segurança",
      description: "Gerenciar autenticação de dois fatores e senhas",
      status: "Em breve",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Região & Idioma",
      description: "Configurar moeda, fuso horário e idioma",
      status: "Em breve",
    },
  ];

  return (
    <div className="min-h-screen p-0 sm:p-4 bg-gradient-to-br from-[#f4f4f4] to-white">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Cog className="w-8 h-8 text-[--primary]" />
          <h1 className="text-3xl font-extrabold text-[#003f5c]">
            Configurações
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settingsCategories.map((category, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {category.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg text-[#003f5c]">
                      {category.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {category.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Status: {category.status}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleComingSoon}
                    disabled={category.status === "Em breve"}
                  >
                    Configurar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-[#003f5c]">Sobre o Plenne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Versão do aplicativo</span>
                <span className="text-sm font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Última atualização</span>
                <span className="text-sm font-medium">Dezembro 2024</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Suporte</span>
                <Button variant="link" size="sm" className="p-0 h-auto">
                  contato@plenne.com
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
