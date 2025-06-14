
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
import { LogOut, Settings, User, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LogoPlenne } from './LogoPlenne';

interface HeaderProps {
  onNavigate: (section: string) => void;
  currentSection: string;
}

export function Header({ onNavigate, currentSection }: HeaderProps) {
  const { signOut, user } = useAuth();
  const { profile, subscription } = useProfile();

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'pro': return 'bg-[--accent] text-[--accent-foreground]';
      case 'business': return 'bg-[--secondary] text-[--secondary-foreground]';
      default: return 'bg-[--primary] text-[--primary-foreground]';
    }
  };

  return (
    <header className="border-b bg-[#FFFFFFDD] backdrop-blur supports-[backdrop-filter]:bg-[#fff]/70 shadow-sm h-16">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <LogoPlenne />
          <span className="hidden sm:block text-md font-medium text-[#0057FF]">Sua vida financeira, plena.</span>
          {subscription && subscription.plan !== 'free' && (
            <Badge className={`${getPlanColor(subscription.plan)} ml-2 text-sm rounded-full font-semibold`}>
              {subscription.plan.toUpperCase()}
            </Badge>
          )}
        </div>

        <nav className="hidden md:flex space-x-8">
          {['dashboard', 'transactions', 'goals', 'investments', 'reports'].map((section) => (
            <button
              key={section}
              onClick={() => onNavigate(section)}
              className={`font-poppins text-sm font-medium transition-colors hover:text-[--primary] ${
                currentSection === section ? 'text-[--primary]' : 'text-gray-500'
              }`}
            >
              {{
                dashboard: 'Dashboard',
                transactions: 'Transações',
                goals: 'Metas',
                investments: 'Investimentos',
                reports: 'Relatórios'
              }[section]}
            </button>
          ))}
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 bg-[#f8fafc] hover:bg-[#e9ecef] shadow-md">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
                <AvatarFallback>
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1 font-poppins">
                <p className="text-sm font-semibold leading-none text-[--primary]">
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
