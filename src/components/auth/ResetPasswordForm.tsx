
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ResetPasswordFormProps {
  onBack: () => void;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onBack }) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await resetPassword(email);
    setIsLoading(false);
    onBack();
  };

  return (
    <div className="w-full max-w-md border-none shadow-none bg-transparent">
      <div className="text-center mx-auto w-14 h-14 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mb-2 shadow-lg">
        <LogIn className="w-6 h-6 text-primary-foreground" />
      </div>
      <h2 className="text-2xl font-bold text-primary font-poppins mb-2">Recuperar Senha</h2>
      <p className="text-muted-foreground font-inter mb-4">
        Digite seu email para receber instruções
      </p>
      <form onSubmit={handleResetPassword} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reset-email" className="text-primary font-poppins">Email</Label>
          <Input
            id="reset-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="border-primary/20 focus:border-accent"
            required
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-accent to-primary hover:from-secondary hover:to-primary font-bold"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Enviar Instruções
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full text-primary hover:bg-primary/10 font-inter"
          onClick={onBack}
        >
          Voltar ao Login
        </Button>
      </form>
    </div>
  );
};
