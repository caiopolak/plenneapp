
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { DollarSign, LogOut, Settings, User, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  onNavigate: (section: string) => void;
  currentSection: string;
}

export function Header({ onNavigate, currentSection }: HeaderProps) {
  const { signOut, user } = useAuth();
  const { profile, subscription } = useProfile();

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'pro': return 'bg-blue-500';
      case 'business': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold">FinanciePRO</span>
          {subscription && subscription.plan !== 'free' && (
            <Badge className={`${getPlanColor(subscription.plan)} text-white`}>
              {subscription.plan.toUpperCase()}
            </Badge>
          )}
        </div>

        <nav className="hidden md:flex space-x-8">
          {['dashboard', 'transactions', 'goals', 'investments', 'reports'].map((section) => (
            <button
              key={section}
              onClick={() => onNavigate(section)}
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                currentSection === section ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              {section === 'dashboard' && 'Dashboard'}
              {section === 'transactions' && 'Transações'}
              {section === 'goals' && 'Metas'}
              {section === 'investments' && 'Investimentos'}
              {section === 'reports' && 'Relatórios'}
            </button>
          ))}
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
                <AvatarFallback>
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {profile?.full_name || 'Usuário'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onNavigate('profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onNavigate('subscription')}>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Assinatura</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onNavigate('settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
