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
      primary: '216 87% 18%',      // hsl(216, 87%, 18%) = #003f5c
      secondary: '142 76% 36%',    // hsl(142, 76%, 36%) = #2f9e44
      accent: '24 95% 53%',        // hsl(24, 95%, 53%) = #f8961e
      background: '210 40% 98%',   // hsl(210, 40%, 98%) = #f4f4f4
      surface: '0 0% 100%',        // hsl(0, 0%, 100%) = #ffffff
      graphite: '240 10% 4%'       // hsl(240, 10%, 4%) = #2b2b2b
    }
  },
  {
    name: 'blue',
    label: 'Azul Profissional',
    colors: {
      primary: '217 91% 60%',      // blue-500
      secondary: '220 91% 54%',    // blue-600  
      accent: '239 84% 67%',       // indigo-500
      background: '210 40% 98%',
      surface: '0 0% 100%',
      graphite: '217 33% 17%'
    }
  },
  {
    name: 'purple',
    label: 'Roxo Moderno',
    colors: {
      primary: '262 83% 58%',      // purple-600
      secondary: '258 90% 66%',    // purple-500
      accent: '330 81% 60%',       // pink-500
      background: '300 20% 99%',
      surface: '0 0% 100%',
      graphite: '262 47% 25%'
    }
  },
  {
    name: 'emerald',
    label: 'Verde Esmeralda',
    colors: {
      primary: '158 64% 52%',      // emerald-500
      secondary: '160 84% 39%',    // emerald-600
      accent: '142 76% 36%',       // green-600
      background: '152 81% 96%',
      surface: '0 0% 100%',
      graphite: '158 36% 17%'
    }
  },
  {
    name: 'sunset',
    label: 'Pôr do Sol',
    colors: {
      primary: '25 95% 53%',       // orange-500
      secondary: '45 93% 47%',     // yellow-500
      accent: '0 84% 60%',         // red-500
      background: '48 100% 96%',
      surface: '0 0% 100%',
      graphite: '25 47% 25%'
    }
  },
  {
    name: 'ocean',
    label: 'Oceano',
    colors: {
      primary: '199 89% 48%',      // sky-500
      secondary: '188 86% 53%',    // cyan-500
      accent: '180 78% 60%',       // teal-400
      background: '204 100% 97%',
      surface: '0 0% 100%',
      graphite: '199 43% 20%'
    }
  },
  {
    name: 'dark',
    label: 'Modo Escuro',
    colors: {
      primary: '0 0% 85%',         // Texto claro
      secondary: '142 76% 36%',    // Verde mantido
      accent: '24 95% 53%',        // Laranja mantido
      background: '240 10% 4%',    // Fundo escuro
      surface: '240 12% 8%',       // Superfície escura
      graphite: '0 0% 98%'         // Texto muito claro
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
    
    // Aplicar cores usando valores HSL corretos
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
      
      // Também aplicar nas variáveis CSS principais
      if (key === 'primary') root.style.setProperty('--primary', value);
      if (key === 'secondary') root.style.setProperty('--secondary', value);
      if (key === 'accent') root.style.setProperty('--accent', value);
      if (key === 'background') root.style.setProperty('--background', value);
      if (key === 'surface') root.style.setProperty('--card', value);
    });
    
    // Atualizar gradientes baseados nas novas cores
    const gradientPrimary = `linear-gradient(120deg, hsl(${theme.colors.primary}) 0%, hsl(${theme.colors.secondary}) 100%)`;
    const gradientAccent = `linear-gradient(98deg, hsl(${theme.colors.accent}) 15%, hsl(${theme.colors.primary}) 89%)`;
    
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