
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TransactionList } from "@/components/transactions/TransactionList";
import { GoalList } from "@/components/goals/GoalList";
import { InvestmentList } from "@/components/investments/InvestmentList";
import { BarChart3, Target, TrendingUp } from "lucide-react";

export function DashboardTabs() {
  const [tab, setTab] = useState("transactions");

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <TabsList className="mb-6 shadow-md bg-white">
        <TabsTrigger value="transactions" className="flex gap-2 items-center">
          <BarChart3 className="w-5 h-5" /> Transações
        </TabsTrigger>
        <TabsTrigger value="goals" className="flex gap-2 items-center">
          <Target className="w-5 h-5" /> Metas
        </TabsTrigger>
        <TabsTrigger value="investments" className="flex gap-2 items-center">
          <TrendingUp className="w-5 h-5" /> Investimentos
        </TabsTrigger>
      </TabsList>
      <TabsContent value="transactions" className="animate-fade-in">
        <TransactionList />
      </TabsContent>
      <TabsContent value="goals" className="animate-fade-in">
        <GoalList />
      </TabsContent>
      <TabsContent value="investments" className="animate-fade-in">
        <InvestmentList />
      </TabsContent>
    </Tabs>
  );
}
