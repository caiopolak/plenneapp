import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, ChevronRight, ChevronLeft, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TourStep {
  target: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    target: '[data-tour="sidebar"]',
    title: "Menu Principal",
    content: "Navegue entre todas as seções do app: Dashboard, Transações, Metas, Investimentos e mais.",
    position: 'right'
  },
  {
    target: '[data-tour="welcome-card"]',
    title: "Seu Resumo Pessoal",
    content: "Veja seu saldo atual, metas ativas e taxa de poupança em um único lugar.",
    position: 'bottom'
  },
  {
    target: '[data-tour="health-card"]',
    title: "Saúde Financeira",
    content: "Sua pontuação de saúde financeira calculada automaticamente com dicas personalizadas.",
    position: 'bottom'
  },
  {
    target: '[data-tour="overview"]',
    title: "Resumo Geral",
    content: "Visão completa do mês: receitas, despesas, metas e transações próximas.",
    position: 'top'
  },
  {
    target: '[data-tour="add-transaction"]',
    title: "Adicionar Transação",
    content: "Registre suas receitas e despesas rapidamente. Você pode agendar transações recorrentes!",
    position: 'left'
  }
];

interface GuidedTourProps {
  active: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function GuidedTour({ active, onComplete, onSkip }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const updatePosition = useCallback(() => {
    const step = tourSteps[currentStep];
    const target = document.querySelector(step.target);
    
    if (target) {
      const rect = target.getBoundingClientRect();
      setTargetRect(rect);
      
      const pos = step.position || 'bottom';
      let top = 0;
      let left = 0;
      
      switch (pos) {
        case 'top':
          top = rect.top - 150;
          left = rect.left + rect.width / 2 - 160;
          break;
        case 'bottom':
          top = rect.bottom + 16;
          left = rect.left + rect.width / 2 - 160;
          break;
        case 'left':
          top = rect.top + rect.height / 2 - 75;
          left = rect.left - 340;
          break;
        case 'right':
          top = rect.top + rect.height / 2 - 75;
          left = rect.right + 16;
          break;
      }
      
      // Keep within viewport
      left = Math.max(16, Math.min(left, window.innerWidth - 340));
      top = Math.max(16, Math.min(top, window.innerHeight - 200));
      
      setPosition({ top, left });
    }
  }, [currentStep]);

  useEffect(() => {
    if (active) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);
      
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
      };
    }
  }, [active, updatePosition]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (!active) return null;

  const step = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;

  return createPortal(
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm" />
      
      {/* Highlight */}
      {targetRect && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
            borderRadius: '12px'
          }}
        >
          <div className="absolute inset-0 border-2 border-primary rounded-xl animate-pulse" />
        </div>
      )}
      
      {/* Tooltip Card */}
      <Card
        className={cn(
          "fixed z-[10000] w-[320px] p-4 shadow-2xl border-primary/20",
          "animate-scale-in"
        )}
        style={{ top: position.top, left: position.left }}
      >
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground">{step.title}</h4>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 -mr-2 -mt-1"
                onClick={onSkip}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{step.content}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t">
          <span className="text-xs text-muted-foreground">
            {currentStep + 1} de {tourSteps.length}
          </span>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" size="sm" onClick={handlePrev}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
            <Button size="sm" onClick={handleNext}>
              {isLastStep ? 'Finalizar' : 'Próximo'}
              {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </div>
      </Card>
    </>,
    document.body
  );
}
