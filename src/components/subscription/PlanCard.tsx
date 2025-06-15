
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface PlanCardProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  isCurrentPlan?: boolean;
  planId: string;
  currentPlan: string | undefined;
  onSelect: () => void;
}

export function PlanCard({ 
  name, 
  price, 
  description, 
  features, 
  isPopular, 
  isCurrentPlan,
  planId,
  currentPlan,
  onSelect 
}: PlanCardProps) {
  // Badge cor do plano
  const getPlanColor = (plan: string) => {
    if (plan === "business") return "bg-green-100 text-green-700";
    if (plan === "pro") return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-700";
  };
  // Botão cor do plano
  const getButtonVariant = () => (isCurrentPlan ? "outline" : "default");

  return (
    <Card className={`relative ${isPopular ? 'border-blue-500 shadow-lg' : ''}`}>
      {isPopular && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
          Mais Popular
        </Badge>
      )}
      <CardHeader>
        <CardTitle className="text-xl">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="text-3xl font-bold">
          {price}
          {price !== 'Grátis' && <span className="text-sm font-normal text-muted-foreground">/mês</span>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        <Button 
          className={`w-full ${getPlanColor(planId)}`}
          variant={getButtonVariant()}
          onClick={onSelect}
          disabled={isCurrentPlan}
        >
          {isCurrentPlan ? 'Plano Atual' : 'Selecionar Plano'}
        </Button>
      </CardContent>
    </Card>
  );
}
