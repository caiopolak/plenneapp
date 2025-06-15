
import { BookOpen, TrendingUp, Shield, Brain } from "lucide-react";

export const getCategoryIcon = (category: string | null | undefined) => {
  switch (category) {
    case 'budgeting': return <BookOpen className="w-5 h-5" />;
    case 'investments': return <TrendingUp className="w-5 h-5" />;
    case 'emergency_fund': return <Shield className="w-5 h-5" />;
    default: return <Brain className="w-5 h-5" />;
  }
};

export const getCategoryLabel = (category: string | null | undefined) => {
  switch (category) {
    case 'budgeting': return 'Orçamento';
    case 'investments': return 'Investimentos';
    case 'emergency_fund': return 'Reserva de Emergência';
    default: return 'Geral';
  }
};

export const getDifficultyColor = (level: string | null | undefined) => {
  switch (level) {
    case 'beginner': return 'bg-green-500';
    case 'intermediate': return 'bg-yellow-500';
    case 'advanced': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

export const getDifficultyLabel = (level: string | null | undefined) => {
  switch (level) {
    case 'beginner': return 'Iniciante';
    case 'intermediate': return 'Intermediário';
    case 'advanced': return 'Avançado';
    default: return 'Geral';
  }
};
