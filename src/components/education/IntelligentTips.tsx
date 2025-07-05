import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, BookOpen, TrendingUp, Shield, Brain, PiggyBank, DollarSign, ExternalLink } from 'lucide-react';
import { useIntelligentTips } from '@/hooks/useIntelligentTips';
import { useNavigate } from 'react-router-dom';

export function IntelligentTips() {
  const { tips, loading } = useIntelligentTips();
  const [filter, setFilter] = useState<string>('all');
  const navigate = useNavigate();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'budgeting': return <BookOpen className="w-5 h-5" />;
      case 'saving': return <PiggyBank className="w-5 h-5" />;
      case 'investment': return <TrendingUp className="w-5 h-5" />;
      case 'emergency_fund': return <Shield className="w-5 h-5" />;
      case 'spending': return <DollarSign className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'budgeting': return 'Orçamento';
      case 'saving': return 'Poupança';
      case 'investment': return 'Investimentos';
      case 'emergency_fund': return 'Reserva de Emergência';
      case 'spending': return 'Gastos';
      default: return 'Geral';
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyLabel = (level: string) => {
    switch (level) {
      case 'beginner': return 'Iniciante';
      case 'intermediate': return 'Intermediário';
      case 'advanced': return 'Avançado';
      default: return 'Geral';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const handleActionClick = (url?: string) => {
    if (url) {
      navigate(url);
    }
  };

  // Filtro das dicas conforme seleção
  const filteredTips = tips.filter(tip => {
    if (filter === 'all') return true;
    if (filter === 'automatic') return tip.is_automatic;
    if (filter === 'manual') return !tip.is_automatic;
    return tip.category === filter;
  });

  const automaticCount = tips.filter(tip => tip.is_automatic).length;
  const highPriorityCount = tips.filter(tip => tip.priority === 'high').length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-[#f8961e]" />
            Dicas Inteligentes
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
            <Lightbulb className="w-6 h-6 text-[#f8961e]" />
            Dicas Inteligentes Personalizadas
            {highPriorityCount > 0 && (
              <Badge className="bg-[#d62828] text-white">
                {highPriorityCount} urgentes
              </Badge>
            )}
          </h2>
          <p className="text-[#2b2b2b]/70">
            {automaticCount} dicas automáticas baseadas no seu comportamento financeiro
          </p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { value: 'all', label: `Todas (${tips.length})` },
          { value: 'automatic', label: `Automáticas (${automaticCount})` },
          { value: 'emergency_fund', label: 'Reserva' },
          { value: 'budgeting', label: 'Orçamento' },
          { value: 'saving', label: 'Poupança' },
          { value: 'investment', label: 'Investimentos' },
          { value: 'spending', label: 'Gastos' }
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

      {filteredTips.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Lightbulb className="w-12 h-12 mx-auto text-[#f8961e]/50 mb-4" />
            <p className="text-[#2b2b2b]/70">
              Nenhuma dica encontrada nesta categoria
            </p>
            <p className="text-sm text-[#2b2b2b]/50 mt-2">
              Continue registrando suas transações para receber dicas personalizadas!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTips.map((tip) => {
            const Icon = getCategoryIcon(tip.category);
            return (
              <Card key={tip.id} className={`border-l-4 ${getPriorityColor(tip.priority)} transition-all hover:shadow-md`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 rounded-full bg-[#eaf6ee] text-[#2f9e44]">
                        {Icon}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-[#003f5c]">
                          {tip.title}
                          {tip.is_automatic && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Automática
                            </Badge>
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {getCategoryLabel(tip.category)}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${getDifficultyColor(tip.difficulty_level)}`} />
                            <span className="text-xs text-[#2b2b2b]/50">
                              {getDifficultyLabel(tip.difficulty_level)}
                            </span>
                          </div>
                          {tip.priority === 'high' && (
                            <Badge className="bg-red-500 text-white text-xs">
                              Urgente
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {tip.action_url && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleActionClick(tip.action_url)}
                        title="Ver detalhes"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-[#2b2b2b] mb-3">
                    {tip.content}
                  </p>
                  {tip.reason && (
                    <p className="text-xs text-[#2b2b2b]/50 italic">
                      💡 {tip.reason}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}