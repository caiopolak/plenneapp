
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Crown } from 'lucide-react';
import { IncomingTransactions } from '@/components/transactions/IncomingTransactions';
import { UnifiedTransactionForm } from '@/components/transactions/UnifiedTransactionForm';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function IncomingPage() {
  const [showForm, setShowForm] = useState(false);
  const { limits } = useSubscriptionLimits();
  const { toast } = useToast();

  const canUseScheduling = limits?.plan !== 'free';

  const handleOpenForm = () => {
    if (!canUseScheduling) {
      toast({
        title: "Recurso Premium",
        description: "Agendamento de transações está disponível apenas nos planos Pro e Business.",
        action: <Badge variant="secondary" className="ml-2"><Crown className="w-3 h-3 mr-1" />Upgrade</Badge>
      });
      return;
    }
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-display brand-gradient-text">
            Transações Agendadas
          </h1>
          <p className="text-muted-foreground">
            Gerencie transações futuras e pendentes
          </p>
        </div>
        
        <Button 
          onClick={handleOpenForm}
          className="bg-gradient-to-tr from-primary/80 to-secondary/40 text-primary-foreground hover:from-primary hover:to-secondary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Agendar Transação
          {!canUseScheduling && <Crown className="w-4 h-4 ml-2 text-amber-400" />}
        </Button>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl bg-card text-foreground">
            <DialogHeader>
              <DialogTitle className="text-foreground">Agendar Nova Transação</DialogTitle>
            </DialogHeader>
            <UnifiedTransactionForm 
              onSuccess={handleFormSuccess}
              onCancel={() => setShowForm(false)}
              initialMode="scheduled"
            />
          </DialogContent>
        </Dialog>
      </div>

      <IncomingTransactions />
    </div>
  );
}
