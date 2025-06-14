
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FinancialTips } from '@/components/education/FinancialTips';
import { SmartAlerts } from '@/components/education/SmartAlerts';
import { FinancialChallenges } from '@/components/education/FinancialChallenges';
import { MonthlyBudget } from '@/components/budget/MonthlyBudget';
import { WhatsAppIntegration } from '@/components/whatsapp/WhatsAppIntegration';
import { BookOpen, Bell, Trophy, DollarSign, MessageCircle } from 'lucide-react';

export default function Education() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f4f4] to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#003f5c] mb-2">
            Centro de Educação Financeira
          </h1>
          <p className="text-[#2b2b2b]/70">
            Organize. Economize. Evolua. Sua vida financeira que você merece começa aqui.
          </p>
        </div>

        <Tabs defaultValue="tips" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm">
            <TabsTrigger value="tips" className="flex items-center gap-2 data-[state=active]:bg-[#003f5c] data-[state=active]:text-white">
              <BookOpen className="w-4 h-4" />
              Dicas
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2 data-[state=active]:bg-[#003f5c] data-[state=active]:text-white">
              <Bell className="w-4 h-4" />
              Alertas
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center gap-2 data-[state=active]:bg-[#003f5c] data-[state=active]:text-white">
              <Trophy className="w-4 h-4" />
              Desafios
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center gap-2 data-[state=active]:bg-[#003f5c] data-[state=active]:text-white">
              <DollarSign className="w-4 h-4" />
              Orçamento
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex items-center gap-2 data-[state=active]:bg-[#003f5c] data-[state=active]:text-white">
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tips" className="space-y-6">
            <FinancialTips />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <SmartAlerts />
          </TabsContent>

          <TabsContent value="challenges" className="space-y-6">
            <FinancialChallenges />
          </TabsContent>

          <TabsContent value="budget" className="space-y-6">
            <MonthlyBudget />
          </TabsContent>

          <TabsContent value="whatsapp" className="space-y-6">
            <WhatsAppIntegration />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
