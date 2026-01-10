import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Crown, Clock, Calendar, Repeat } from 'lucide-react';
import { IncomingTransactions } from '@/components/transactions/IncomingTransactions';
import { UnifiedTransactionForm } from '@/components/transactions/UnifiedTransactionForm';
import { usePlanAccess } from '@/hooks/usePlanAccess';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function IncomingPage() {
  const [showForm, setShowForm] = useState(false);
  const { isPremium, currentPlan } = usePlanAccess();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleOpenForm = () => {
    if (!isPremium) {
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
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold font-display brand-gradient-text">
              Transações Agendadas
            </h1>
            {!isPremium && (
              <Badge variant="outline" className="border-primary/50 text-primary">
                <Crown className="w-3 h-3 mr-1" />
                PRO
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Gerencie transações futuras, pendentes e recorrentes
          </p>
        </div>
        
        <Button 
          onClick={handleOpenForm}
          className="bg-gradient-to-tr from-primary/80 to-secondary/40 text-primary-foreground hover:from-primary hover:to-secondary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Agendar Transação
          {!isPremium && <Crown className="w-4 h-4 ml-2 text-amber-400" />}
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

      {/* CTA para usuários free */}
      {!isPremium && (
        <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Automatize suas Finanças</h3>
                  <p className="text-muted-foreground text-sm">
                    Agende transações futuras e crie recorrências automáticas para nunca mais esquecer uma conta.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 ml-auto">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Agendamento de transações</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Repeat className="w-4 h-4 text-primary" />
                  <span>Transações recorrentes</span>
                </div>
              </div>

              <Button 
                onClick={() => navigate('/app/subscription')}
                className="bg-gradient-to-r from-primary to-secondary shrink-0"
              >
                <Crown className="w-4 h-4 mr-2" />
                Ver Planos
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <IncomingTransactions />
    </div>
  );
}
