
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertTriangle, Info, CheckCircle, X, TrendingUp, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface SmartAlert {
  id: string;
  title: string;
  message: string;
  alert_type: 'spending' | 'goal' | 'investment' | 'tip' | 'challenge';
  priority: 'low' | 'medium' | 'high';
  is_read: boolean;
  created_at: string;
}

export function SmartAlerts() {
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Simulando alertas inteligentes
    const mockAlerts: SmartAlert[] = [
      {
        id: '1',
        title: 'Gasto Alto Detectado',
        message: 'Você gastou R$ 450 em alimentação esta semana, 30% acima da sua média. Que tal cozinhar mais em casa?',
        alert_type: 'spending',
        priority: 'high',
        is_read: false,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Meta Próxima do Prazo',
        message: 'Sua meta "Fundo de Emergência" tem prazo até próximo mês. Você está 70% do caminho!',
        alert_type: 'goal',
        priority: 'medium',
        is_read: false,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        title: 'Oportunidade de Investimento',
        message: 'O Tesouro Selic está com rendimento de 13.5% ao ano. Considere diversificar sua carteira.',
        alert_type: 'investment',
        priority: 'medium',
        is_read: true,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '4',
        title: 'Dica do Dia',
        message: 'Sabia que automatizar transferências para poupança aumenta em 40% a chance de alcançar suas metas?',
        alert_type: 'tip',
        priority: 'low',
        is_read: false,
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    setAlerts(mockAlerts);
    setLoading(false);
  }, [user]);

  const markAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, is_read: true } : alert
    ));
  };

  const deleteAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    toast({
      title: "Alerta removido",
      description: "O alerta foi removido com sucesso"
    });
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'spending': return <AlertTriangle className="w-5 h-5" />;
      case 'goal': return <TrendingUp className="w-5 h-5" />;
      case 'investment': return <DollarSign className="w-5 h-5" />;
      case 'tip': return <Info className="w-5 h-5" />;
      case 'challenge': return <CheckCircle className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getAlertColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'spending': return 'Gastos';
      case 'goal': return 'Metas';
      case 'investment': return 'Investimentos';
      case 'tip': return 'Dica';
      case 'challenge': return 'Desafio';
      default: return 'Geral';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !alert.is_read;
    return alert.alert_type === filter;
  });

  const unreadCount = alerts.filter(alert => !alert.is_read).length;

  if (loading) {
    return <div>Carregando alertas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#003f5c] flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Alertas Inteligentes
            {unreadCount > 0 && (
              <Badge className="bg-[#d62828] text-white">
                {unreadCount}
              </Badge>
            )}
          </h2>
          <p className="text-[#2b2b2b]/70">Acompanhe insights personalizados sobre suas finanças</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { value: 'all', label: 'Todos' },
          { value: 'unread', label: 'Não lidos' },
          { value: 'spending', label: 'Gastos' },
          { value: 'goal', label: 'Metas' },
          { value: 'investment', label: 'Investimentos' },
          { value: 'tip', label: 'Dicas' }
        ].map((filterOption) => (
          <Button
            key={filterOption.value}
            variant={filter === filterOption.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(filterOption.value)}
            className={filter === filterOption.value ? "bg-[#003f5c] hover:bg-[#003f5c]/90" : ""}
          >
            {filterOption.label}
          </Button>
        ))}
      </div>

      {filteredAlerts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Bell className="w-12 h-12 mx-auto text-[#003f5c]/50 mb-4" />
            <p className="text-[#2b2b2b]/70">Nenhum alerta encontrado</p>
            <p className="text-sm text-[#2b2b2b]/50 mt-2">
              Seus alertas inteligentes aparecerão aqui
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <Card 
              key={alert.id} 
              className={`border-l-4 ${getAlertColor(alert.priority)} ${!alert.is_read ? 'shadow-md' : ''}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      alert.priority === 'high' ? 'bg-red-100 text-red-600' :
                      alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {getAlertIcon(alert.alert_type)}
                    </div>
                    <div>
                      <CardTitle className={`text-lg ${!alert.is_read ? 'font-bold' : 'font-normal'} text-[#003f5c]`}>
                        {alert.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(alert.alert_type)}
                        </Badge>
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(alert.priority)}`} />
                        <span className="text-xs text-[#2b2b2b]/50">
                          {format(new Date(alert.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    {!alert.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(alert.id)}
                        title="Marcar como lido"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAlert(alert.id)}
                      title="Remover alerta"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className={`text-[#2b2b2b] ${!alert.is_read ? 'font-medium' : ''}`}>
                  {alert.message}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
