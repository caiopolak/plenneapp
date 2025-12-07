import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, User, Sparkles } from 'lucide-react';
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
    <form onSubmit={handleSignUp} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="signup-name" className="text-foreground font-medium">
          Nome Completo
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="signup-name"
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Seu nome completo"
            className="pl-10 h-11 border-border focus:border-primary bg-background"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signup-email" className="text-foreground font-medium">
          Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="signup-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="pl-10 h-11 border-border focus:border-primary bg-background"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signup-password" className="text-foreground font-medium">
          Senha
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="signup-password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            className="pl-10 h-11 border-border focus:border-primary bg-background"
            required
            minLength={6}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Use pelo menos 6 caracteres com letras e números
        </p>
      </div>
      
      <Button
        type="submit"
        className="w-full h-11 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold shadow-lg shadow-secondary/20 transition-all duration-300 hover:shadow-xl hover:shadow-secondary/30"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Criar Conta Grátis
          </>
        )}
      </Button>
    </form>
  );
};
