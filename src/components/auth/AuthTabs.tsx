
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LogoPlenne } from "@/components/layout/LogoPlenne";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";

type AuthTab = "signin" | "signup";

export function AuthTabs({ onForgot }: { onForgot: () => void }) {
  const [tab, setTab] = useState<AuthTab>("signin");

  return (
    <Card className="w-full max-w-md border-none shadow-xl bg-white/90 animate-scale-in p-1">
      <CardHeader className="text-center space-y-2">
        <div className="flex justify-center items-center mb-2">
          <LogoPlenne className="scale-110 drop-shadow-none" />
        </div>
        <CardTitle className="text-2xl font-extrabold font-poppins tracking-tight text-graphite">
          Entrar na{" "}
          <span className="brand-gradient-text font-extrabold font-display ml-1">
            Plenne
          </span>
        </CardTitle>
        <CardDescription className="text-[#2b2b2b]/85 font-inter">
          Plataforma{" "}
          <span className="brand-gradient-text font-semibold">Plenne Finance</span>
          <br />
          Inteligência, metas e segurança para você
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={val => setTab(val as AuthTab)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-[--muted]/70 rounded-lg">
            <TabsTrigger value="signin" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-primary">Entrar</TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground text-primary">Cadastrar</TabsTrigger>
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
