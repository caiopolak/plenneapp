import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertTriangle, TrendingUp, DollarSign, Info, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIntelligentAlerts, IntelligentAlert } from "@/hooks/useIntelligentAlerts";
import { SmartAlertCard } from "./SmartAlertCard";

export function SmartAlerts() {
  const { alerts, markAsRead, deleteAlert } = useIntelligentAlerts();
  const [filter, setFilter] = useState<string>('all');
  const { toast } = useToast();

  const handleMarkAsRead = async (alertId: string) => {
    await markAsRead(alertId);
    toast({ title: "Alerta marcado como lido." });
  };
  
  const handleDeleteAlert = async (alertId: string) => {
    await deleteAlert(alertId);
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

  // Filtro dos alertas conforme seleção
  const filteredAlerts = alerts.filter((alert: IntelligentAlert) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !alert.is_read;
    return alert.alert_type === filter;
  });

  const unreadCount = alerts.filter((alert: IntelligentAlert) => !alert.is_read).length;

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
          {filteredAlerts.map((alert: IntelligentAlert) => (
            <SmartAlertCard
              key={alert.id}
              alert={alert}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDeleteAlert}
            />
          ))}
        </div>
      )}
    </div>
  );
}
