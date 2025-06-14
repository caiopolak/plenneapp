
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, DollarSign, User } from 'lucide-react';

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

  // Novo Background e Card robusto
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#017F66]/90 via-[#0057FF]/40 to-[#fff] px-2 py-4">
      <div className="flex flex-col md:flex-row w-full max-w-3xl bg-white/95 rounded-3xl shadow-2xl overflow-hidden animate-fade-in border-2 border-[--primary]/10">
        {/* Lado Esquerdo - Ilustração ou Slogan */}
        <div className="hidden md:flex flex-col items-center justify-center flex-1 bg-gradient-to-br from-[--primary]/90 via-emerald-500/50 to-[--white]/45 px-8 py-12 relative">
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-2 font-bold text-lg text-white drop-shadow-md">
              <DollarSign className="w-7 h-7 text-[--gold]" /> FinanciePRO
            </span>
          </div>
          <div className="relative flex-1 flex items-center justify-center w-full z-10">
            {/* Ilustração simples SVG */}
            <svg viewBox="0 0 170 120" fill="none" className="w-44 h-44">
              <ellipse cx="85" cy="100" rx="65" ry="18" fill="#f5b94255"/>
              <rect x="95" y="60" width="40" height="24" rx="6" fill="#0057FF"/>
              <rect x="35" y="72" width="60" height="16" rx="6" fill="#017F6688"/>
              <rect x="52" y="37" width="55" height="28" rx="6" fill="#F5B94299"/>
              <rect x="60" y="18" width="35" height="18" rx="5" fill="#fff"/>
              <rect x="92" y="22" width="20" height="10" rx="3" fill="#0057FF"/>
              <ellipse cx="140" cy="55" rx="8" ry="8" fill="#fff" opacity="0.23"/>
            </svg>
          </div>
          <div className="relative text-center z-10 mt-8">
            <span className="font-poppins text-lg font-semibold text-white drop-shadow">Sua vida financeira, plena.</span>
            <p className="text-sm mt-2 text-[#fff9]/90 font-inter">Robusto. Inteligente. Simples. <br /> <span className="font-bold text-[--gold]">Bem-vindo(a)!</span></p>
          </div>
        </div>

        {/* Lado Direito - Formulário */}
        <div className="flex-1 flex items-center justify-center px-6 py-10">
          {forgotPassword ? (
            <Card className="w-full max-w-md border-none shadow-none bg-transparent">
              <CardHeader className="text-center">
                <div className="mx-auto w-14 h-14 bg-gradient-to-r from-[#003f5c] to-[#2f9e44] rounded-full flex items-center justify-center mb-2 shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-[#003f5c]">Recuperar Senha</CardTitle>
                <CardDescription className="text-[#2b2b2b]/70">
                  Digite seu email para receber instruções de recuperação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="text-[#003f5c]">Email</Label>
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
                    className="w-full bg-gradient-to-r from-[#2f9e44] to-[#003f5c] hover:from-[#0057ff] hover:to-[#017f66]"
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enviar Instruções
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-[--primary] hover:bg-[--primary]/10"
                    onClick={() => setForgotPassword(false)}
                  >
                    Voltar ao Login
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="w-full max-w-md border-none shadow-xl bg-white/80 animate-scale-in p-1">
              <CardHeader className="text-center space-y-1">
                <div className="mx-auto w-14 h-14 bg-gradient-to-r from-[#017F66] to-[#F5B942] rounded-full flex items-center justify-center mb-2 shadow-lg">
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-[#017F66]">Acesse sua Conta</CardTitle>
                <CardDescription className="text-[#2b2b2b]/80 font-medium">
                  Plataforma <span className='text-[--electric]'>FinanciePRO</span> <br/>
                  Gerencie <span className='text-[--gold] font-bold'>dinheiro</span> & <span className='text-[--electric] font-bold'>metas</span> <span className='text-[--primary] font-semibold'>com inteligência</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4 bg-[--muted]/70 rounded-lg">
                    <TabsTrigger value="signin" className="data-[state=active]:bg-[--primary] data-[state=active]:text-white text-[--primary]">Entrar</TabsTrigger>
                    <TabsTrigger value="signup" className="data-[state=active]:bg-[--primary] data-[state=active]:text-white text-[--primary]">Cadastrar</TabsTrigger>
                  </TabsList>

                  {/* LOGIN */}
                  <TabsContent value="signin">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signin-email" className="text-[--primary]">Email</Label>
                        <Input
                          id="signin-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="seu@email.com"
                          className="border-[--primary]/20 focus:border-[--secondary]"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signin-password" className="text-[--primary]">Senha</Label>
                        <Input
                          id="signin-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="border-[--primary]/20 focus:border-[--secondary]"
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
                        className="w-full text-[--secondary] hover:bg-[--electric]/10 text-sm"
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
                        <Label htmlFor="signup-name" className="text-[--primary]">Nome Completo</Label>
                        <Input
                          id="signup-name"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Digite seu nome"
                          className="border-[--primary]/20 focus:border-[--secondary]"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-[--primary]">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="seu@email.com"
                          className="border-[--primary]/20 focus:border-[--secondary]"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-[--primary]">Senha</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="border-[--primary]/20 focus:border-[--secondary]"
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
                      <p className="text-xs mt-2 text-muted-foreground text-center">
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
