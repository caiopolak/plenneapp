
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const SignUpForm: React.FC = () => {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await signUp(email, password, fullName);
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-name" className="text-[--primary] font-poppins">Nome Completo</Label>
        <Input
          id="signup-name"
          type="text"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
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
          onChange={e => setEmail(e.target.value)}
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
          onChange={e => setPassword(e.target.value)}
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
  );
};
