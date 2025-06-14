import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, DollarSign, LogIn } from 'lucide-react';
import { AuthBranding } from './AuthBranding';

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#017F66]/95 via-[#0057FF]/50 to-[#fff] px-2 py-7 select-none">
      <div className="flex flex-col md:flex-row w-full max-w-3xl bg-white/95 rounded-3xl shadow-2xl overflow-hidden animate-fade-in border-2 border-[--primary]/20">
        <div className="hidden md:flex flex-col items-center justify-center flex-1 relative">
          <AuthBranding />
        </div>
        {/* Direita: Formulário */}
        <div className="flex-1 flex items-center justify-center px-6 py-10 bg-white bg-opacity-95">
          {forgotPassword ? (
            <Card className="w-full max-w-md border-none shadow-none bg-transparent">
              <CardHeader className="text-center">
                <div className="mx-auto w-14 h-14 bg-gradient-to-r from-[#003f5c] to-[#2f9e44] rounded-full flex items-center justify-center mb-2 shadow-lg">
                  <LogIn className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-[#003f5c] font-poppins">Recuperar Senha</CardTitle>
                <CardDescription className="text-[#2b2b2b]/70 font-inter">
                  Digite seu email para receber instruções
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="text-[#003f5c] font-poppins">Email</Label>
                    <Input
                      id="reset-email"
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
                    className="w-full bg-gradient-to-r from-[#2f9e44] to-[#003f5c] hover:from-[#0057ff] hover:to-[#017f66] font-bold"
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enviar Instruções
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-[--primary] hover:bg-[--primary]/10 font-inter"
                    onClick={() => setForgotPassword(false)}
                  >
                    Voltar ao Login
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="w-full max-w-md border-none shadow-xl bg-white/90 animate-scale-in p-1">
              <CardHeader className="text-center space-y-1">
                <div className="mx-auto w-14 h-14 bg-gradient-to-r from-[--primary] to-[--gold] rounded-full flex items-center justify-center mb-2 shadow-lg">
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-2xl font-extrabold text-[--primary] font-poppins">
                  Entrar na Plenne
                </CardTitle>
                <CardDescription className="text-[#2b2b2b]/85 font-inter">
                  Plataforma <span className='text-[--electric] font-semibold'>Plenne Finance</span> <br/>
                  Inteligência, metas e segurança para você
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4 bg-[--muted]/70 rounded-lg">
                    <TabsTrigger value="signin" className="data-[state=active]:bg-[--primary] data-[state=active]:text-white text-[--primary]">Entrar</TabsTrigger>
                    <TabsTrigger value="signup" className="data-[state=active]:bg-[--electric] data-[state=active]:text-white text-[--primary]">Cadastrar</TabsTrigger>
                  </TabsList>

                  {/* LOGIN */}
                  <TabsContent value="signin">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signin-email" className="text-[--primary] font-poppins">Email</Label>
                        <Input
                          id="signin-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="seu@email.com"
                          className="border-[--primary]/20 focus:border-[--electric] font-inter"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signin-password" className="text-[--primary] font-poppins">Senha</Label>
                        <Input
                          id="signin-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="border-[--primary]/20 focus:border-[--electric] font-inter"
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-[--primary] via-[--electric] to-[--gold] hover:to-[--electric]/80 shadow font-bold"
                        disabled={isLoading}
                      >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Entrar
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full text-[--electric] hover:bg-[--electric]/10 text-sm font-inter"
                        onClick={() => setForgotPassword(true)}
                      >
                        Esqueci minha senha
                      </Button>
                    </form>
                  </TabsContent>

                  {/* CADASTRO */}
                  <TabsContent value="signup">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name" className="text-[--primary] font-poppins">Nome Completo</Label>
                        <Input
                          id="signup-name"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Digite seu nome"
                          className="border-[--primary]/20 focus:border-[--electric] font-inter"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-[--primary] font-poppins">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="seu@email.com"
                          className="border-[--primary]/20 focus:border-[--electric] font-inter"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-[--primary] font-poppins">Senha</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="border-[--primary]/20 focus:border-[--electric] font-inter"
                          required
                          minLength={6}
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-[--primary] to-[--gold] hover:to-[--electric] shadow font-bold"
                        disabled={isLoading}
                      >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Criar Conta
                      </Button>
                      <p className="text-xs mt-2 text-muted-foreground text-center font-inter">
                        Ao criar uma conta, você aceita nossos termos de uso.
                      </p>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
