
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign } from "lucide-react";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";

type AuthTab = "signin" | "signup";

export function AuthTabs({ onForgot }: { onForgot: () => void }) {
  const [tab, setTab] = useState<AuthTab>("signin");

  return (
    <Card className="w-full max-w-md border-none shadow-xl bg-white/90 animate-scale-in p-1">
      <CardHeader className="text-center space-y-1">
        <div className="mx-auto w-14 h-14 bg-gradient-to-r from-[--primary] to-[--gold] rounded-full flex items-center justify-center mb-2 shadow-lg">
          <DollarSign className="w-7 h-7 text-white" />
        </div>
        <CardTitle className="text-2xl font-extrabold text-[--primary] font-poppins">
          Entrar na Plenne
        </CardTitle>
        <CardDescription className="text-[#2b2b2b]/85 font-inter">
          Plataforma <span className='text-[--electric] font-semibold'>Plenne Finance</span> <br />
          Inteligência, metas e segurança para você
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={val => setTab(val as AuthTab)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-[--muted]/70 rounded-lg">
            <TabsTrigger value="signin" className="data-[state=active]:bg-[--primary] data-[state=active]:text-white text-[--primary]">Entrar</TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-[--electric] data-[state=active]:text-white text-[--primary]">Cadastrar</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <SignInForm onForgot={onForgot} />
          </TabsContent>
          <TabsContent value="signup">
            <SignUpForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
