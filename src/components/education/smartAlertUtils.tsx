
import { Bell, AlertTriangle, Info, CheckCircle, TrendingUp, DollarSign } from "lucide-react";

export const getAlertIcon = (type: string) => {
  switch (type) {
    case 'spending': return <AlertTriangle className="w-5 h-5" />;
    case 'goal': return <TrendingUp className="w-5 h-5" />;
    case 'investment': return <DollarSign className="w-5 h-5" />;
    case 'tip': return <Info className="w-5 h-5" />;
    case 'challenge': return <CheckCircle className="w-5 h-5" />;
    default: return <Bell className="w-5 h-5" />;
  }
};
export const getAlertColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'border-l-red-500 bg-red-50';
    case 'medium': return 'border-l-yellow-500 bg-yellow-50';
    case 'low': return 'border-l-blue-500 bg-blue-50';
    default: return 'border-l-gray-500 bg-gray-50';
  }
};
export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-blue-500';
    default: return 'bg-gray-500';
  }
};
export const getTypeLabel = (type: string) => {
  switch (type) {
    case 'spending': return 'Gastos';
    case 'goal': return 'Metas';
    case 'investment': return 'Investimentos';
    case 'tip': return 'Dica';
    case 'challenge': return 'Desafio';
    default: return 'Geral';
  }
};
