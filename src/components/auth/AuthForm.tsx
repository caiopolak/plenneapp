
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, DollarSign } from 'lucide-react';

export function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  
  const { signIn, signUp, resetPassword } = useAuth();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await signIn(email, password);
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await signUp(email, password, fullName);
    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await resetPassword(email);
    setIsLoading(false);
    setForgotPassword(false);
  };

  if (forgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f4f4f4] to-[#003f5c]/10 p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-[#003f5c] to-[#2f9e44] rounded-full flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-[#003f5c]">Recuperar Senha</CardTitle>
            <CardDescription className="text-[#2b2b2b]/70">
              Digite seu email para receber instruções de recuperação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#003f5c]">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="border-[#003f5c]/20 focus:border-[#2f9e44]"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-[#2f9e44] hover:bg-[#2f9e44]/90" 
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar Instruções
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full text-[#003f5c] hover:bg-[#003f5c]/10"
                onClick={() => setForgotPassword(false)}
              >
                Voltar ao Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f4f4f4] to-[#003f5c]/10 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-[#003f5c] to-[#2f9e44] rounded-full flex items-center justify-center mb-4">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#003f5c]">FinanciePRO</CardTitle>
          <CardDescription className="text-[#2b2b2b]/70">
            Sua plataforma de gestão financeira pessoal
          </CardDescription>
          <div className="text-xs text-[#2f9e44] font-medium mt-2">
            "Você no controle do seu dinheiro, de verdade."
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#f4f4f4]">
              <TabsTrigger value="signin" className="data-[state=active]:bg-[#003f5c] data-[state=active]:text-white">Entrar</TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-[#003f5c] data-[state=active]:text-white">Cadastrar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-[#003f5c]">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="border-[#003f5c]/20 focus:border-[#2f9e44]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="text-[#003f5c]">Senha</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="border-[#003f5c]/20 focus:border-[#2f9e44]"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-[#003f5c] hover:bg-[#003f5c]/90" 
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Entrar
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full text-sm text-[#2b2b2b]/70 hover:text-[#003f5c] hover:bg-[#003f5c]/10"
                  onClick={() => setForgotPassword(true)}
                >
                  Esqueci minha senha
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-[#003f5c]">Nome Completo</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="border-[#003f5c]/20 focus:border-[#2f9e44]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-[#003f5c]">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="border-[#003f5c]/20 focus:border-[#2f9e44]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-[#003f5c]">Senha</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="border-[#003f5c]/20 focus:border-[#2f9e44]"
                    required
                    minLength={6}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-[#2f9e44] hover:bg-[#2f9e44]/90" 
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar Conta
                </Button>
                <p className="text-xs text-[#2b2b2b]/60 text-center">
                  Ao criar uma conta, você aceita nossos termos de uso
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
