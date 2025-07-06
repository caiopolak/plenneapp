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
      primary: '216, 56, 92', // #003f5c
      secondary: '47, 158, 68', // #2f9e44
      accent: '248, 150, 30', // #f8961e
    }
  },
  {
    name: 'blue',
    label: 'Azul Profissional',
    colors: {
      primary: '59, 130, 246', // blue-500
      secondary: '99, 102, 241', // indigo-500
      accent: '168, 85, 247', // purple-500
    }
  },
  {
    name: 'purple',
    label: 'Roxo Moderno',
    colors: {
      primary: '147, 51, 234', // purple-600
      secondary: '168, 85, 247', // purple-500
      accent: '236, 72, 153', // pink-500
    }
  },
  {
    name: 'emerald',
    label: 'Verde Esmeralda',
    colors: {
      primary: '5, 150, 105', // emerald-600
      secondary: '16, 185, 129', // emerald-500
      accent: '34, 197, 94', // green-500
    }
  },
  {
    name: 'dark',
    label: 'Modo Escuro',
    colors: {
      primary: '30, 30, 30',
      secondary: '60, 60, 60',
      accent: '248, 150, 30',
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
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
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