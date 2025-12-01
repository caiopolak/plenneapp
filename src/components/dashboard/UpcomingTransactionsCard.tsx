import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUpcomingTransactions } from "@/hooks/useUpcomingTransactions";
import { Calendar, TrendingUp, TrendingDown, RefreshCw, ArrowRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export function UpcomingTransactionsCard() {
  const { transactions, loading } = useUpcomingTransactions(7);

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximas Transações (7 dias)
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/incoming" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                Ver Todas
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximas Transações (7 dias)
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/incoming" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                Ver Todas
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm text-center py-6">
            Nenhuma transação agendada para os próximos 7 dias
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Próximas Transações (7 dias)
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/incoming" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
              Ver Todas
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-3 rounded-lg bg-accent/50 border border-border hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
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
              <div>
                <p className="font-medium text-foreground">
                  {transaction.description || transaction.category}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{transaction.category}</span>
                  {transaction.source === 'recurring' && (
                    <Badge variant="outline" className="h-5 flex items-center gap-1">
                      <RefreshCw className="h-3 w-3" />
                      Recorrente
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${
                transaction.type === 'income' ? 'text-success' : 'text-destructive'
              }`}>
                {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(parseISO(transaction.expected_date), "dd 'de' MMM", { locale: ptBR })}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
