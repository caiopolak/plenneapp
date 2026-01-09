import { Bell, AlertTriangle, Info, CheckCircle, TrendingUp, DollarSign, Wallet } from "lucide-react";

export const getAlertIcon = (type: string) => {
  switch (type) {
    case 'spending': return <AlertTriangle className="w-5 h-5" />;
    case 'goal': return <TrendingUp className="w-5 h-5" />;
    case 'investment': return <DollarSign className="w-5 h-5" />;
    case 'tip': return <Info className="w-5 h-5" />;
    case 'challenge': return <CheckCircle className="w-5 h-5" />;
    case 'budget': return <Wallet className="w-5 h-5" />;
    default: return <Bell className="w-5 h-5" />;
  }
};

export const getAlertColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'border-l-destructive bg-card-error-bg';
    case 'medium': return 'border-l-attention bg-card-warning-bg';
    case 'low': return 'border-l-primary bg-card-info-bg';
    default: return 'border-l-muted-foreground bg-muted';
  }
};

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-destructive';
    case 'medium': return 'bg-attention';
    case 'low': return 'bg-primary';
    default: return 'bg-muted-foreground';
  }
};

export const getTypeLabel = (type: string) => {
  switch (type) {
    case 'spending': return 'Gastos';
    case 'goal': return 'Metas';
    case 'investment': return 'Investimentos';
    case 'tip': return 'Dica';
    case 'challenge': return 'Desafio';
    case 'budget': return 'Orçamento';
    default: return 'Geral';
  }
};
