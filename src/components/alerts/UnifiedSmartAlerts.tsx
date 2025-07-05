import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertTriangle, TrendingUp, DollarSign, Info, CheckCircle, Target, PiggyBank, X, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIntelligentAlerts } from '@/hooks/useIntelligentAlerts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

export function UnifiedSmartAlerts() {
  const { alerts, loading, markAsRead, deleteAlert } = useIntelligentAlerts();
  const [filter, setFilter] = useState<string>('all');
  const { toast } = useToast();
  const navigate = useNavigate();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'spending': return <AlertTriangle className="w-5 h-5" />;
      case 'goal': return <Target className="w-5 h-5" />;
      case 'investment': return <DollarSign className="w-5 h-5" />;
      case 'budget': return <PiggyBank className="w-5 h-5" />;
      case 'tip': return <Info className="w-5 h-5" />;
      case 'challenge': return <CheckCircle className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getAlertColor = (priority: string, isRead: boolean) => {
    const opacity = isRead ? '50' : '100';
    switch (priority) {
      case 'high': return `border-l-red-500 bg-red-${isRead ? '25' : '50'}`;
      case 'medium': return `border-l-yellow-500 bg-yellow-${isRead ? '25' : '50'}`;
      case 'low': return `border-l-blue-500 bg-blue-${isRead ? '25' : '50'}`;
      default: return `border-l-gray-500 bg-gray-${isRead ? '25' : '50'}`;
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
      case 'budget': return 'Orçamento';
      case 'tip': return 'Dica';
      case 'challenge': return 'Desafio';
      default: return 'Geral';
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

  const handleMarkAsRead = async (alertId: string) => {
    await markAsRead(alertId);
    toast({ 
      title: "Alerta marcado como lido",
      description: "O alerta foi marcado como lido com sucesso."
    });
  };

  const handleDelete = async (alertId: string) => {
    await deleteAlert(alertId);
    toast({ 
      title: "Alerta removido",
      description: "O alerta foi removido com sucesso."
    });
  };

  const handleActionClick = (url?: string) => {
    if (url) {
      navigate(url);
    }
  };

  // Filtro dos alertas conforme seleção
  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !alert.is_read;
    if (filter === 'automatic') return alert.is_automatic;
    if (filter === 'manual') return !alert.is_automatic;
    return alert.alert_type === filter;
  });

  const unreadCount = alerts.filter(alert => !alert.is_read).length;
  const automaticCount = alerts.filter(alert => alert.is_automatic).length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Alertas Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
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
                {unreadCount} não lidos
              </Badge>
            )}
          </h2>
          <p className="text-[#2b2b2b]/70">
            {automaticCount} alertas automáticos baseados no seu comportamento financeiro
          </p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { value: 'all', label: `Todos (${alerts.length})` },
          { value: 'unread', label: `Não lidos (${unreadCount})` },
          { value: 'automatic', label: `Automáticos (${automaticCount})` },
          { value: 'spending', label: 'Gastos' },
          { value: 'budget', label: 'Orçamento' },
          { value: 'goal', label: 'Metas' },
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
            <p className="text-[#2b2b2b]/70">
              {filter === 'all' ? 'Nenhum alerta encontrado' : `Nenhum alerta ${filter === 'unread' ? 'não lido' : 'nesta categoria'}`}
            </p>
            <p className="text-sm text-[#2b2b2b]/50 mt-2">
              Continue usando o app para receber alertas personalizados
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <Card key={alert.id} className={`border-l-4 ${getAlertColor(alert.priority, alert.is_read)} transition-all hover:shadow-md`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`p-2 rounded-full ${
                      alert.priority === 'high' ? 'bg-red-100 text-red-600'
                      : alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-blue-100 text-blue-600'
                    }`}>
                      {getAlertIcon(alert.alert_type)}
                    </div>
                    <div className="flex-1">
                      <CardTitle className={`text-lg ${!alert.is_read ? 'font-bold' : 'font-normal'} text-[#003f5c]`}>
                        {alert.title}
                        {alert.is_automatic && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Automático
                          </Badge>
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(alert.alert_type)}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(alert.priority)}`} />
                          <span className="text-xs text-[#2b2b2b]/50">
                            {getPriorityLabel(alert.priority)}
                          </span>
                        </div>
                        <span className="text-xs text-[#2b2b2b]/50">
                          {format(new Date(alert.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {alert.action_url && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleActionClick(alert.action_url)}
                        title="Ver detalhes"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                    {!alert.is_read && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleMarkAsRead(alert.id)} 
                        title="Marcar como lido"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDelete(alert.id)} 
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