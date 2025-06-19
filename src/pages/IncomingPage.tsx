
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { IncomingTransactions } from '@/components/transactions/IncomingTransactions';
import { IncomingTransactionForm } from '@/components/transactions/IncomingTransactionForm';

export default function IncomingPage() {
  const [showForm, setShowForm] = useState(false);

  const handleFormSuccess = () => {
    setShowForm(false);
    // A lista será recarregada automaticamente via useEffect
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-display brand-gradient-text">
            Transações Pendentes
          </h1>
          <p className="text-muted-foreground">
            Gerencie receitas e despesas futuras ou pendentes
          </p>
        </div>
        
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-tr from-[#003f5c]/80 to-[#2f9e44]/40 text-white hover:from-[#003f5c] hover:to-[#2f9e44]">
              <Plus className="w-4 h-4 mr-2" />
              Nova Transação Pendente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Transação Pendente</DialogTitle>
            </DialogHeader>
            <IncomingTransactionForm 
              onSuccess={handleFormSuccess}
              onCancel={() => setShowForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <IncomingTransactions />
    </div>
  );
}
