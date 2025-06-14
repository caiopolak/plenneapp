
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, AlertTriangle, TrendingUp, Target, Lightbulb, Trophy, X, Check } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchAlerts = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('smart_alerts')
        .select('*')
        .eq('user_id', user.id);

      if (filter === 'unread') {
        query = query.eq('is_read', false);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar alertas"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [user, filter]);

  const markAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('smart_alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, is_read: true } : alert
      ));
    } catch (error) {
      console.error('Error marking alert as read:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao marcar alerta como lido"
      });
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('smart_alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      
      toast({
        title: "Sucesso!",
        description: "Alerta removido com sucesso"
      });
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao remover alerta"
      });
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'spending': return <AlertTriangle className="w-5 h-5" />;
      case 'goal': return <Target className="w-5 h-5" />;
      case 'investment': return <TrendingUp className="w-5 h-5" />;
      case 'tip': return <Lightbulb className="w-5 h-5" />;
      case 'challenge': return <Trophy className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return 'Normal';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'spending': return 'Gastos';
      case 'goal': return 'Meta';
      case 'investment': return 'Investimento';
      case 'tip': return 'Dica';
      case 'challenge': return 'Desafio';
      default: return 'Geral';
    }
  };

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
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </h2>
          <p className="text-[#2b2b2b]/70">Acompanhe suas finanças em tempo real</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter('all')}
            className={filter === 'all' ? "bg-[#003f5c] hover:bg-[#003f5c]/90" : ""}
          >
            Todos ({alerts.length})
          </Button>
          <Button
            variant={filter === 'unread' ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter('unread')}
            className={filter === 'unread' ? "bg-[#f8961e] hover:bg-[#f8961e]/90" : ""}
          >
            Não lidos ({unreadCount})
          </Button>
        </div>
      </div>

      {alerts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Bell className="w-12 h-12 mx-auto text-[#003f5c]/50 mb-4" />
            <p className="text-[#2b2b2b]/70">
              {filter === 'unread' ? 'Nenhum alerta não lido' : 'Nenhum alerta encontrado'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card key={alert.id} className={`${getPriorityColor(alert.priority)} ${!alert.is_read ? 'ring-2 ring-[#2f9e44]' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getAlertIcon(alert.alert_type)}
                    <div>
                      <CardTitle className="text-lg text-[#003f5c]">{alert.title}</CardTitle>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(alert.alert_type)}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {getPriorityLabel(alert.priority)}
                        </Badge>
                        {!alert.is_read && (
                          <Badge variant="default" className="text-xs bg-[#2f9e44]">
                            Novo
                          </Badge>
                        )}
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
                        <Check className="w-4 h-4" />
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
                <p className="text-[#2b2b2b] mb-3">{alert.message}</p>
                <div className="text-sm text-[#2b2b2b]/60">
                  {format(new Date(alert.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
