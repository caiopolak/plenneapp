import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUpcomingTransactions } from "@/hooks/useUpcomingTransactions";
import { useProjectedBalance } from "@/hooks/useProjectedBalance";
import { Calendar, TrendingUp, TrendingDown, RefreshCw, ArrowRight, Wallet, CalendarClock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export function UpcomingTransactionsCard() {
  const { transactions, loading } = useUpcomingTransactions(30);
  const { currentBalance, projectedData, loading: balanceLoading } = useProjectedBalance(30);

  // Calculate projected impact
  const futureIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + Number(t.amount), 0);
  
  const futureExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + Number(t.amount), 0);
  
  const netImpact = futureIncome - futureExpenses;
  const projectedBalance = currentBalance + netImpact;

  if (loading || balanceLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2">
              <CalendarClock className="h-5 w-5" />
              Transações Futuras Agendadas
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border h-full min-h-[480px] flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            Transações Futuras Agendadas
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/app/incoming" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
              Ver Todas
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Próximos 30 dias • {transactions.length} transação(ões) agendada(s)
        </p>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col">
        {/* Impact Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Saldo Atual</span>
            </div>
            <p className="font-bold text-foreground">
              R$ {currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          
          <div className="p-3 rounded-lg bg-success/10 border border-success/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="text-xs text-muted-foreground">Entradas</span>
            </div>
            <p className="font-bold text-success">
              +R$ {futureIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-destructive" />
              <span className="text-xs text-muted-foreground">Saídas</span>
            </div>
            <p className="font-bold text-destructive">
              -R$ {futureExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          
          <div className={`p-3 rounded-lg border ${netImpact >= 0 ? 'bg-success/10 border-success/20' : 'bg-destructive/10 border-destructive/20'}`}>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Saldo Projetado</span>
            </div>
            <p className={`font-bold ${projectedBalance >= 0 ? 'text-success' : 'text-destructive'}`}>
              R$ {projectedBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Transaction List */}
        {transactions.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">
            Nenhuma transação agendada para os próximos 30 dias
          </p>
        ) : (
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {transactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg bg-accent/50 border border-border hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-full shrink-0 ${
                    transaction.type === 'income' 
                      ? 'bg-success/20 text-success' 
                      : 'bg-destructive/20 text-destructive'
                  }`}>
                    {transaction.type === 'income' ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {transaction.description || transaction.category}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="truncate">{transaction.category}</span>
                      {transaction.source === 'recurring' && (
                        <Badge variant="outline" className="h-5 flex items-center gap-1 shrink-0">
                          <RefreshCw className="h-3 w-3" />
                          Recorrente
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <p className={`font-semibold ${
                    transaction.type === 'income' ? 'text-success' : 'text-destructive'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'} R$ {Number(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(transaction.expected_date), "dd 'de' MMM", { locale: ptBR })}
                  </p>
                </div>
              </div>
            ))}
            {transactions.length > 5 && (
              <p className="text-xs text-center text-muted-foreground pt-2">
                +{transactions.length - 5} transação(ões) agendada(s)
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
