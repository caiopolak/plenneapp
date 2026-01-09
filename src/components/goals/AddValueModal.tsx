import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Zap, Target, Sparkles, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddValueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalName: string;
  currentAmount: number;
  targetAmount: number;
  onConfirm: (amount: number, note?: string) => void;
}

const quickAmounts = [50, 100, 200, 500];

export function AddValueModal({
  open,
  onOpenChange,
  goalName,
  currentAmount,
  targetAmount,
  onConfirm
}: AddValueModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [selectedQuick, setSelectedQuick] = useState<number | null>(null);

  const parsedAmount = useMemo(() => {
    const val = parseFloat(amount.replace(',', '.'));
    return isNaN(val) ? 0 : val;
  }, [amount]);

  const preview = useMemo(() => {
    const newAmount = currentAmount + parsedAmount;
    const newProgress = targetAmount > 0 ? (newAmount / targetAmount) * 100 : 0;
    const currentProgress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
    const progressGain = newProgress - currentProgress;
    const remaining = Math.max(0, targetAmount - newAmount);
    const willComplete = newAmount >= targetAmount;

    return {
      newAmount,
      newProgress: Math.min(100, newProgress),
      currentProgress,
      progressGain,
      remaining,
      willComplete
    };
  }, [currentAmount, targetAmount, parsedAmount]);

  const handleQuickSelect = (value: number) => {
    setSelectedQuick(value);
    setAmount(value.toString());
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedQuick(null);
    setAmount(e.target.value);
  };

  const handleConfirm = () => {
    if (parsedAmount > 0) {
      onConfirm(parsedAmount, note || undefined);
      setAmount("");
      setNote("");
      setSelectedQuick(null);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setAmount("");
    setNote("");
    setSelectedQuick(null);
    onOpenChange(false);
  };

  // Suggested amount to reach next milestone
  const suggestedAmount = useMemo(() => {
    const milestones = [25, 50, 75, 100];
    const currentProgress = (currentAmount / targetAmount) * 100;
    
    for (const m of milestones) {
      if (currentProgress < m) {
        const neededAmount = (m / 100) * targetAmount - currentAmount;
        return Math.ceil(neededAmount);
      }
    }
    return 0;
  }, [currentAmount, targetAmount]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Adicionar Aporte
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Goal Info */}
          <div className="p-3 rounded-xl bg-muted/50 border border-border">
            <p className="font-semibold text-sm text-foreground truncate">{goalName}</p>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={preview.currentProgress} className="flex-1 h-2" />
              <span className="text-xs font-medium text-muted-foreground">
                {preview.currentProgress.toFixed(0)}%
              </span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>R$ {currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              <span>R$ {targetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Valores Rápidos</Label>
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map(val => (
                <Button
                  key={val}
                  type="button"
                  variant={selectedQuick === val ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-10 font-semibold transition-all",
                    selectedQuick === val && "ring-2 ring-primary/50"
                  )}
                  onClick={() => handleQuickSelect(val)}
                >
                  R$ {val}
                </Button>
              ))}
            </div>
          </div>

          {/* Suggested Amount */}
          {suggestedAmount > 0 && suggestedAmount !== parsedAmount && (
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-start gap-2 text-left h-auto p-3 bg-primary/5 hover:bg-primary/10 border border-primary/20"
              onClick={() => handleQuickSelect(suggestedAmount)}
            >
              <Sparkles className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-primary">Sugestão inteligente</p>
                <p className="text-xs text-muted-foreground">
                  R$ {suggestedAmount.toLocaleString('pt-BR')} para o próximo marco
                </p>
              </div>
            </Button>
          )}

          {/* Custom Amount Input */}
          <div>
            <Label htmlFor="custom-amount" className="text-xs text-muted-foreground">
              Valor Personalizado
            </Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                R$
              </span>
              <Input
                id="custom-amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0,00"
                className="pl-10 h-12 text-lg font-semibold"
              />
            </div>
          </div>

          {/* Note Field */}
          <div>
            <Label htmlFor="note" className="text-xs text-muted-foreground">
              Observação (opcional)
            </Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Bônus do trabalho, economias do mês..."
              className="mt-1 resize-none"
              rows={2}
            />
          </div>

          {/* Preview Card */}
          {parsedAmount > 0 && (
            <div className={cn(
              "p-4 rounded-xl border transition-all duration-300",
              preview.willComplete 
                ? "bg-gradient-to-r from-secondary/20 to-emerald-500/20 border-secondary/30" 
                : "bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20"
            )}>
              <div className="flex items-center gap-2 mb-3">
                <Calculator className={cn(
                  "h-4 w-4",
                  preview.willComplete ? "text-secondary" : "text-primary"
                )} />
                <span className="text-sm font-semibold text-foreground">Preview do Impacto</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Novo progresso:</span>
                  <div className="flex items-center gap-2">
                    <Progress value={preview.newProgress} className="w-20 h-2" />
                    <span className="text-sm font-bold text-primary">
                      {preview.newProgress.toFixed(1)}%
                    </span>
                    <span className="text-xs text-secondary font-medium">
                      (+{preview.progressGain.toFixed(1)}%)
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Novo saldo:</span>
                  <span className="text-sm font-bold text-secondary">
                    R$ {preview.newAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {!preview.willComplete && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Ainda faltam:</span>
                    <span className="text-sm font-medium text-foreground">
                      R$ {preview.remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                {preview.willComplete && (
                  <div className="flex items-center gap-2 pt-2 border-t border-secondary/20">
                    <Zap className="h-4 w-4 text-secondary animate-pulse" />
                    <span className="text-sm font-bold text-secondary">
                      🎉 Este aporte completa sua meta!
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 h-11"
              onClick={handleCancel}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 h-11 gap-2"
              onClick={handleConfirm}
              disabled={parsedAmount <= 0}
            >
              <TrendingUp className="h-4 w-4" />
              Confirmar Aporte
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
