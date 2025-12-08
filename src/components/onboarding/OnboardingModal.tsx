import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Wallet, 
  Target, 
  TrendingUp, 
  PieChart, 
  Bell, 
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
}

const steps: OnboardingStep[] = [
  {
    icon: <Wallet className="w-12 h-12" />,
    title: "Bem-vindo ao Plenne!",
    description: "Seu assistente financeiro pessoal inteligente. Vamos conhecer as principais funcionalidades.",
    features: [
      "Controle completo das suas finanças",
      "Análises inteligentes e personalizadas",
      "Metas e objetivos financeiros"
    ]
  },
  {
    icon: <TrendingUp className="w-12 h-12" />,
    title: "Transações Inteligentes",
    description: "Registre receitas e despesas de forma simples. Agende transações recorrentes automaticamente.",
    features: [
      "Categorização automática",
      "Transações recorrentes",
      "Filtros avançados e busca"
    ]
  },
  {
    icon: <Target className="w-12 h-12" />,
    title: "Metas Financeiras",
    description: "Defina objetivos claros e acompanhe seu progresso em tempo real.",
    features: [
      "Projeções de conclusão",
      "Alertas de prazo",
      "Depósitos e histórico"
    ]
  },
  {
    icon: <PieChart className="w-12 h-12" />,
    title: "Investimentos & Orçamentos",
    description: "Gerencie sua carteira de investimentos e controle seus gastos por categoria.",
    features: [
      "Análise de rentabilidade",
      "Orçamentos por categoria",
      "Alertas de limite"
    ]
  },
  {
    icon: <Bell className="w-12 h-12" />,
    title: "Alertas Inteligentes",
    description: "Receba notificações personalizadas sobre sua saúde financeira.",
    features: [
      "Alertas de gastos excessivos",
      "Lembretes de metas",
      "Dicas personalizadas"
    ]
  },
  {
    icon: <Sparkles className="w-12 h-12" />,
    title: "Pronto para começar!",
    description: "Explore o app e comece a transformar sua vida financeira hoje.",
    features: [
      "Assistente IA disponível",
      "Educação financeira",
      "Suporte sempre disponível"
    ]
  }
];

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

export function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
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

  const handleSkip = () => {
    onComplete();
  };

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-0">
        <div className="relative">
          {/* Header com gradiente */}
          <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-8 text-primary-foreground">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                {step.icon}
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-2">{step.title}</h2>
            <p className="text-center text-primary-foreground/90 text-sm">
              {step.description}
            </p>
          </div>

          {/* Progress */}
          <div className="px-6 pt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center mt-2">
              Passo {currentStep + 1} de {steps.length}
            </p>
          </div>

          {/* Features */}
          <div className="p-6 space-y-3">
            {step.features.map((feature, index) => (
              <div 
                key={index}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg bg-muted/50",
                  "animate-fade-in"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm text-foreground">{feature}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="p-6 pt-0 flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              Pular
            </Button>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <Button variant="outline" size="sm" onClick={handlePrev}>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </Button>
              )}
              <Button onClick={handleNext} size="sm">
                {isLastStep ? (
                  <>
                    Começar
                    <Sparkles className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  <>
                    Próximo
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 pb-6">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentStep 
                    ? "bg-primary w-6" 
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
