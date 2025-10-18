
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SignInFormProps {
  onForgot: () => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({ onForgot }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await signIn(email, password);
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signin-email" className="text-primary font-poppins">Email</Label>
        <Input
          id="signin-email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="seu@email.com"
          className="border-primary/20 focus:border-secondary font-inter"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signin-password" className="text-primary font-poppins">Senha</Label>
        <Input
          id="signin-password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          className="border-primary/20 focus:border-secondary font-inter"
          required
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-primary via-secondary to-accent hover:from-primary/90 shadow font-bold"
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Entrar
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="w-full text-primary hover:bg-primary/10 text-sm font-inter"
        onClick={onForgot}
      >
        Esqueci minha senha
      </Button>
    </form>
  );
};
