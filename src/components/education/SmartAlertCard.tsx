
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getAlertIcon, getAlertColor, getPriorityColor, getTypeLabel } from "./smartAlertUtils";

interface SmartAlert {
  id: string;
  title: string;
  message: string;
  alert_type: 'spending' | 'goal' | 'investment' | 'tip' | 'challenge';
  priority: 'low' | 'medium' | 'high';
  is_read: boolean;
  created_at: string;
}
interface Props {
  alert: SmartAlert;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function SmartAlertCard({ alert, onMarkAsRead, onDelete }: Props) {
  return (
    <Card className={`border-l-4 ${getAlertColor(alert.priority)} ${!alert.is_read ? 'shadow-md' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              alert.priority === 'high' ? 'bg-red-100 text-red-600'
              : alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-600'
              : 'bg-blue-100 text-blue-600'
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
            {!alert.is_read && onMarkAsRead && (
              <Button variant="ghost" size="sm" onClick={() => onMarkAsRead(alert.id)} title="Marcar como lido">
                <CheckCircle className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="sm" onClick={() => onDelete(alert.id)} title="Remover alerta">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className={`text-[#2b2b2b] ${!alert.is_read ? 'font-medium' : ''}`}>
          {alert.message}
        </p>
      </CardContent>
    </Card>
  );
}
