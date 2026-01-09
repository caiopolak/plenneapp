import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjectedBalance } from "@/hooks/useProjectedBalance";
import { TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

export function ProjectedBalanceChart() {
  const { projectedData, currentBalance, loading } = useProjectedBalance(30);

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Saldo Projetado (30 dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const futureBalance = projectedData[projectedData.length - 1]?.balance || currentBalance;
  const balanceChange = futureBalance - currentBalance;
  const percentageChange = currentBalance !== 0 ? (balanceChange / Math.abs(currentBalance)) * 100 : 0;

  return (
    <Card className="bg-card border-border h-full min-h-[480px] flex flex-col">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Saldo Projetado (30 dias)
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">
              R$ {futureBalance.toFixed(2)}
            </p>
            <p className={`text-sm ${balanceChange >= 0 ? 'text-success' : 'text-destructive'}`}>
              {balanceChange >= 0 ? '+' : ''}{balanceChange.toFixed(2)} ({percentageChange.toFixed(1)}%)
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={projectedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="label" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))"
              }}
              formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Saldo']}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
