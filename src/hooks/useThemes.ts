import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Theme {
  id: string;
  theme_name: string;
  custom_colors: Record<string, string>;
  is_active: boolean;
}

const defaultThemes = [
  {
    name: 'default',
    label: 'Padrão Verde',
    colors: {
      primary: '0, 63, 92',
      secondary: '47, 158, 68',
      accent: '248, 150, 30',
      background: '244, 244, 244',
      surface: '255, 255, 255',
      graphite: '43, 43, 43'
    }
  },
  {
    name: 'blue',
    label: 'Azul Profissional',
    colors: {
      primary: '37, 99, 235',
      secondary: '59, 130, 246',
      accent: '99, 102, 241',
      background: '248, 250, 252',
      surface: '255, 255, 255',
      graphite: '30, 41, 59'
    }
  },
  {
    name: 'purple',
    label: 'Roxo Moderno',
    colors: {
      primary: '147, 51, 234',
      secondary: '168, 85, 247',
      accent: '236, 72, 153',
      background: '250, 245, 255',
      surface: '255, 255, 255',
      graphite: '88, 28, 135'
    }
  },
  {
    name: 'emerald',
    label: 'Verde Esmeralda',
    colors: {
      primary: '5, 150, 105',
      secondary: '16, 185, 129',
      accent: '34, 197, 94',
      background: '240, 253, 244',
      surface: '255, 255, 255',
      graphite: '20, 83, 45'
    }
  },
  {
    name: 'sunset',
    label: 'Pôr do Sol',
    colors: {
      primary: '251, 146, 60',
      secondary: '251, 191, 36',
      accent: '239, 68, 68',
      background: '255, 251, 235',
      surface: '255, 255, 255',
      graphite: '154, 52, 18'
    }
  },
  {
    name: 'ocean',
    label: 'Oceano',
    colors: {
      primary: '14, 165, 233',
      secondary: '6, 182, 212',
      accent: '34, 211, 238',
      background: '240, 249, 255',
      surface: '255, 255, 255',
      graphite: '12, 74, 110'
    }
  },
  {
    name: 'dark',
    label: 'Modo Escuro',
    colors: {
      primary: '148, 163, 184',
      secondary: '100, 116, 139',
      accent: '248, 150, 30',
      background: '15, 23, 42',
      surface: '30, 41, 59',
      graphite: '248, 250, 252'
    }
  }
];

export function useThemes() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [currentTheme, setCurrentTheme] = useState<string>('default');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const applyTheme = (themeName: string) => {
    const theme = defaultThemes.find(t => t.name === themeName);
    if (!theme) return;

    const root = document.documentElement;
    
    // Aplicar modo escuro se necessário
    if (themeName === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Aplicar cores customizadas
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Atualizar gradientes baseados nas novas cores
    const gradientPrimary = `linear-gradient(120deg, rgb(${theme.colors.primary}) 0%, rgb(${theme.colors.secondary}) 100%)`;
    const gradientAccent = `linear-gradient(98deg, rgb(${theme.colors.accent}) 15%, rgb(${theme.colors.primary}) 89%)`;
    
    root.style.setProperty('--gradient-primary', gradientPrimary);
    root.style.setProperty('--gradient-accent', gradientAccent);
    
    setCurrentTheme(themeName);
  };

  const saveTheme = async (themeName: string) => {
    if (!user) return;

    try {
      // Desativar tema atual
      await supabase
        .from('user_themes')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Ativar novo tema
      await supabase
        .from('user_themes')
        .upsert({
          user_id: user.id,
          theme_name: themeName,
          is_active: true,
          custom_colors: {}
        });

      applyTheme(themeName);
      
      toast({
        title: "Tema aplicado!",
        description: `Tema ${defaultThemes.find(t => t.name === themeName)?.label} ativado.`
      });
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao aplicar tema."
      });
    }
  };

  const loadUserTheme = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('user_themes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (data) {
        applyTheme(data.theme_name);
      } else {
        applyTheme('default');
      }
    } catch (error) {
      // Se não há tema salvo, usar padrão
      applyTheme('default');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadUserTheme();
    } else {
      applyTheme('default');
      setLoading(false);
    }
  }, [user]);

  return {
    themes: defaultThemes,
    currentTheme,
    loading,
    applyTheme,
    saveTheme
  };
}