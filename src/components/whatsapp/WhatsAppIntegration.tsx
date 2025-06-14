
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Phone, Bot, Zap, CheckCircle, Star, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';

export function WhatsAppIntegration() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { subscription } = useProfile();

  const isBusinessPlan = subscription?.plan === 'business';

  const connectWhatsApp = async () => {
    if (!phoneNumber) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, insira seu número do WhatsApp"
      });
      return;
    }

    if (!isBusinessPlan) {
      toast({
        variant: "destructive",
        title: "Recurso Premium",
        description: "A integração com WhatsApp está disponível apenas no plano Business"
      });
      return;
    }

    setLoading(true);
    
    // Simulando conexão
    setTimeout(() => {
      setIsConnected(true);
      setLoading(false);
      toast({
        title: "Sucesso!",
        description: "WhatsApp conectado com sucesso! Você receberá uma mensagem de confirmação."
      });
    }, 2000);
  };

  const disconnectWhatsApp = () => {
    setIsConnected(false);
    setPhoneNumber('');
    toast({
      title: "WhatsApp desconectado",
      description: "A integração foi desativada com sucesso"
    });
  };

  const sendTestMessage = () => {
    toast({
      title: "Mensagem enviada!",
      description: "Uma mensagem de teste foi enviada para seu WhatsApp"
    });
  };

  const features = [
    {
      icon: <Bot className="w-5 h-5" />,
      title: "Assistente AI 24/7",
      description: "Converse com nossa IA para tirar dúvidas sobre finanças a qualquer hora"
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Comandos Rápidos",
      description: "Adicione transações, consulte saldo e defina metas diretamente pelo WhatsApp"
    },
    {
      icon: <CheckCircle className="w-5 h-5" />,
      title: "Alertas Personalizados",
      description: "Receba notificações sobre gastos, metas e oportunidades de economia"
    },
    {
      icon: <Star className="w-5 h-5" />,
      title: "Relatórios Instantâneos",
      description: "Solicite relatórios financeiros e receba insights personalizados"
    }
  ];

  const commands = [
    { command: "/saldo", description: "Consultar saldo atual e resumo financeiro" },
    { command: "/gasto [valor] [categoria]", description: "Registrar um novo gasto" },
    { command: "/receita [valor] [descrição]", description: "Registrar uma nova receita" },
    { command: "/meta [nome] [valor]", description: "Criar uma nova meta financeira" },
    { command: "/relatorio", description: "Gerar relatório mensal" },
    { command: "/dica", description: "Receber uma dica financeira personalizada" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#003f5c] flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            Assistente WhatsApp
            <Badge className="bg-[#f8961e] text-white">
              <Crown className="w-3 h-3 mr-1" />
              Business
            </Badge>
          </h2>
          <p className="text-[#2b2b2b]/70">Gerencie suas finanças diretamente pelo WhatsApp</p>
        </div>
      </div>

      {!isBusinessPlan && (
        <Card className="border-l-4 border-l-[#f8961e] bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6 text-[#f8961e]" />
              <div>
                <h3 className="font-semibold text-[#003f5c]">Recurso Premium</h3>
                <p className="text-[#2b2b2b]/70">
                  A integração com WhatsApp está disponível exclusivamente no plano Business. 
                  Upgrade seu plano para acessar este recurso.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuração */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#003f5c]">
              <Phone className="w-5 h-5" />
              Configuração
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isConnected ? (
              <div className="space-y-4">
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
                    Inclua o código do país (+55 para Brasil)
                  </p>
                </div>
                
                <Button 
                  onClick={connectWhatsApp}
                  disabled={loading || !isBusinessPlan}
                  className="w-full bg-[#25D366] hover:bg-[#25D366]/90 text-white"
                >
                  {loading ? "Conectando..." : "Conectar WhatsApp"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">WhatsApp Conectado</p>
                    <p className="text-sm text-green-600">{phoneNumber}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={sendTestMessage}
                    variant="outline"
                    className="flex-1"
                  >
                    Teste
                  </Button>
                  <Button 
                    onClick={disconnectWhatsApp}
                    variant="outline"
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Desconectar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recursos Disponíveis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#003f5c]">Recursos Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="p-2 bg-[#2f9e44]/10 rounded-lg text-[#2f9e44]">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-[#003f5c]">{feature.title}</h4>
                    <p className="text-sm text-[#2b2b2b]/70">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comandos Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#003f5c]">Comandos Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {commands.map((cmd, index) => (
              <div key={index} className="p-4 bg-[#f4f4f4] rounded-lg">
                <code className="text-[#2f9e44] font-mono font-semibold">
                  {cmd.command}
                </code>
                <p className="text-sm text-[#2b2b2b]/70 mt-1">
                  {cmd.description}
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">💡 Dica:</h4>
            <p className="text-sm text-blue-700">
              Você também pode conversar naturalmente com nosso assistente! 
              Pergunte coisas como "Quanto gastei este mês?" ou "Como posso economizar mais?"
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Exemplo de Conversa */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#003f5c]">Exemplo de Conversa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            <div className="flex justify-end">
              <div className="bg-[#dcf8c6] p-3 rounded-lg max-w-xs">
                <p className="text-sm">Oi! Gastei R$ 45 no almoço hoje</p>
              </div>
            </div>
            
            <div className="flex justify-start">
              <div className="bg-white border p-3 rounded-lg max-w-xs">
                <p className="text-sm">✅ Gasto registrado! R$ 45,00 em Alimentação.</p>
                <p className="text-sm mt-1">💡 Você já gastou R$ 350 em alimentação este mês. Sua meta é R$ 400.</p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <div className="bg-[#dcf8c6] p-3 rounded-lg max-w-xs">
                <p className="text-sm">Como está meu orçamento?</p>
              </div>
            </div>
            
            <div className="flex justify-start">
              <div className="bg-white border p-3 rounded-lg max-w-xs">
                <p className="text-sm">📊 Seu orçamento mensal:</p>
                <p className="text-sm">• Alimentação: R$ 350/400 (87%)</p>
                <p className="text-sm">• Transporte: R$ 200/300 (67%)</p>
                <p className="text-sm">• Lazer: R$ 150/200 (75%)</p>
                <p className="text-sm mt-1">🎯 Você está no caminho certo!</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
