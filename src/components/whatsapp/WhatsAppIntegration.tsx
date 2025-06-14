
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageCircle, Smartphone, Bot, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';

export function WhatsAppIntegration() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { subscription } = useProfile();

  const isBusinessPlan = subscription?.plan === 'business';

  const connectWhatsApp = async () => {
    if (!isBusinessPlan) {
      toast({
        variant: "destructive",
        title: "Recurso Premium",
        description: "Integração com WhatsApp disponível apenas no plano Business"
      });
      return;
    }

    setIsLoading(true);
    
    // Simular conexão (aqui seria integração real com API do WhatsApp Business)
    setTimeout(() => {
      setIsConnected(true);
      setIsLoading(false);
      toast({
        title: "Sucesso!",
        description: "WhatsApp conectado com sucesso!"
      });
    }, 2000);
  };

  const examples = [
    {
      command: "Receita R$ 500 Freelance",
      description: "Adiciona uma receita de R$ 500 na categoria Freelance"
    },
    {
      command: "Gasto R$ 120 Transporte Uber",
      description: "Registra um gasto de R$ 120 em transporte com descrição 'Uber'"
    },
    {
      command: "Meta Casa R$ 50000 12/2025",
      description: "Cria uma meta de R$ 50.000 para comprar uma casa até dezembro de 2025"
    },
    {
      command: "Saldo",
      description: "Mostra seu saldo atual e resumo financeiro"
    },
    {
      command: "Metas",
      description: "Lista todas suas metas financeiras e progresso"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#003f5c]">Assistente WhatsApp</h2>
          <p className="text-[#2b2b2b]/70">Gerencie suas finanças direto pelo WhatsApp</p>
        </div>
        <Badge variant={isBusinessPlan ? "default" : "secondary"} className="ml-auto">
          {isBusinessPlan ? "Business" : "Upgrade necessário"}
        </Badge>
      </div>

      {!isBusinessPlan && (
        <Alert className="border-[#f8961e] bg-[#f8961e]/10">
          <AlertCircle className="h-4 w-4 text-[#f8961e]" />
          <AlertDescription className="text-[#f8961e]">
            A integração com WhatsApp está disponível apenas no plano Business. 
            Faça upgrade para acessar este recurso premium.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuração */}
        <Card className="border-l-4 border-l-[#25D366]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuração
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isConnected ? (
              <>
                <div>
                  <Label htmlFor="phone">Número do WhatsApp</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+55 (11) 99999-9999"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={!isBusinessPlan}
                  />
                  <p className="text-xs text-[#2b2b2b]/60 mt-1">
                    Incluir código do país (+55 para Brasil)
                  </p>
                </div>
                
                <Button 
                  onClick={connectWhatsApp}
                  disabled={!phoneNumber || !isBusinessPlan || isLoading}
                  className="w-full bg-[#25D366] hover:bg-[#25D366]/90"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4 mr-2" />
                      Conectar WhatsApp
                    </>
                  )}
                </Button>
              </>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 text-[#25D366] mx-auto mb-3" />
                <h3 className="font-semibold text-[#003f5c] mb-2">WhatsApp Conectado!</h3>
                <p className="text-sm text-[#2b2b2b]/70 mb-4">
                  Número: {phoneNumber}
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setIsConnected(false)}
                  className="border-[#d62828] text-[#d62828] hover:bg-[#d62828] hover:text-white"
                >
                  Desconectar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Como usar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Como usar o Assistente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-[#2b2b2b]/70">
                Envie comandos simples pelo WhatsApp para gerenciar suas finanças:
              </p>
              
              <div className="space-y-3">
                {examples.map((example, index) => (
                  <div key={index} className="border-l-2 border-[#2f9e44] pl-3">
                    <code className="text-sm font-mono bg-[#f4f4f4] px-2 py-1 rounded text-[#003f5c]">
                      {example.command}
                    </code>
                    <p className="text-xs text-[#2b2b2b]/60 mt-1">
                      {example.description}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="bg-[#2f9e44]/10 p-3 rounded-lg">
                <p className="text-sm text-[#2f9e44] font-medium">
                  💡 Dica: O assistente responde em português e entende linguagem natural!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recursos Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle>Recursos Disponíveis via WhatsApp</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Transações", desc: "Adicionar receitas e despesas" },
              { title: "Metas", desc: "Criar e acompanhar metas financeiras" },
              { title: "Saldo", desc: "Consultar saldo e resumos" },
              { title: "Investimentos", desc: "Registrar novos investimentos" },
              { title: "Relatórios", desc: "Receber relatórios mensais" },
              { title: "Alertas", desc: "Notificações inteligentes" }
            ].map((feature, index) => (
              <div key={index} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-[#003f5c] mb-1">{feature.title}</h4>
                <p className="text-sm text-[#2b2b2b]/70">{feature.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
