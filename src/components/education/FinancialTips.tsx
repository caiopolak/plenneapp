
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, TrendingUp, Shield, Brain, ChevronRight } from 'lucide-react';

interface FinancialTip {
  id: string;
  title: string;
  content: string;
  category: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
}

export function FinancialTips() {
  const [tips, setTips] = useState<FinancialTip[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Using mock data since the financial_tips table doesn't exist yet
    const mockTips: FinancialTip[] = [
      {
        id: '1',
        title: 'Regra dos 50/30/20',
        content: 'Divida sua renda em: 50% necessidades, 30% desejos, 20% poupança/investimentos. É uma base simples para organizar suas finanças.',
        category: 'budgeting',
        difficulty_level: 'beginner',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Fundo de Emergência',
        content: 'Mantenha de 3 a 6 meses de gastos essenciais guardados em uma aplicação de alta liquidez. É sua proteção contra imprevistos.',
        category: 'emergency_fund',
        difficulty_level: 'beginner',
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        title: 'Diversificação de Investimentos',
        content: 'Não coloque todos os ovos na mesma cesta. Diversifique entre renda fixa, variável e diferentes setores da economia.',
        category: 'investments',
        difficulty_level: 'intermediate',
        created_at: new Date().toISOString()
      },
      {
        id: '4',
        title: 'Juros Compostos',
        content: 'Einstein chamou de "8ª maravilha do mundo". Comece a investir cedo, mesmo pequenas quantias, e deixe o tempo trabalhar a seu favor.',
        category: 'investments',
        difficulty_level: 'intermediate',
        created_at: new Date().toISOString()
      },
      {
        id: '5',
        title: 'Análise de Fluxo de Caixa',
        content: 'Acompanhe mensalmente suas entradas e saídas. Identifique padrões e oportunidades de otimização nos seus gastos.',
        category: 'budgeting',
        difficulty_level: 'advanced',
        created_at: new Date().toISOString()
      },
      {
        id: '6',
        title: 'Planejamento de Aposentadoria',
        content: 'Comece a se planejar para a aposentadoria o quanto antes. Use a regra dos 4% para calcular quanto precisará acumular.',
        category: 'investments',
        difficulty_level: 'advanced',
        created_at: new Date().toISOString()
      }
    ];

    // Filter tips based on selected category and level
    let filteredTips = mockTips;
    
    if (selectedCategory !== 'all') {
      filteredTips = filteredTips.filter(tip => tip.category === selectedCategory);
    }
    
    if (selectedLevel !== 'all') {
      filteredTips = filteredTips.filter(tip => tip.difficulty_level === selectedLevel);
    }

    setTips(filteredTips);
    setLoading(false);
  }, [selectedCategory, selectedLevel]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'budgeting': return <BookOpen className="w-5 h-5" />;
      case 'investments': return <TrendingUp className="w-5 h-5" />;
      case 'emergency_fund': return <Shield className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'budgeting': return 'Orçamento';
      case 'investments': return 'Investimentos';
      case 'emergency_fund': return 'Reserva de Emergência';
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

  const categories = [
    { value: 'all', label: 'Todas' },
    { value: 'budgeting', label: 'Orçamento' },
    { value: 'investments', label: 'Investimentos' },
    { value: 'emergency_fund', label: 'Reserva de Emergência' }
  ];

  const levels = [
    { value: 'all', label: 'Todos' },
    { value: 'beginner', label: 'Iniciante' },
    { value: 'intermediate', label: 'Intermediário' },
    { value: 'advanced', label: 'Avançado' }
  ];

  if (loading) {
    return <div>Carregando dicas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#003f5c]">Educação Financeira</h2>
          <p className="text-[#2b2b2b]/70">Aprenda com dicas práticas de especialistas</p>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.value)}
              className={selectedCategory === category.value ? "bg-[#003f5c] hover:bg-[#003f5c]/90" : ""}
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {levels.map((level) => (
          <Badge
            key={level.value}
            variant={selectedLevel === level.value ? "default" : "outline"}
            className={`cursor-pointer ${selectedLevel === level.value ? "bg-[#2f9e44] hover:bg-[#2f9e44]/90" : ""}`}
            onClick={() => setSelectedLevel(level.value)}
          >
            {level.label}
          </Badge>
        ))}
      </div>

      {tips.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Brain className="w-12 h-12 mx-auto text-[#003f5c]/50 mb-4" />
            <p className="text-[#2b2b2b]/70">Nenhuma dica encontrada para os filtros selecionados</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tips.map((tip) => (
            <Card key={tip.id} className="border-l-4 border-l-[#2f9e44] hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(tip.category)}
                    <div>
                      <CardTitle className="text-lg text-[#003f5c]">{tip.title}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {getCategoryLabel(tip.category)}
                      </Badge>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getDifficultyColor(tip.difficulty_level)}`} 
                       title={getDifficultyLabel(tip.difficulty_level)} />
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-[#2b2b2b] leading-relaxed mb-4">{tip.content}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {getDifficultyLabel(tip.difficulty_level)}
                  </Badge>
                  <Button variant="ghost" size="sm" className="text-[#2f9e44] hover:text-[#2f9e44]/80">
                    Saiba mais <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
