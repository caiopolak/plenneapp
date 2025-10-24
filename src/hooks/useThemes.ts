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
      primary: '216 87% 18%',
      secondary: '142 76% 36%',
      accent: '24 95% 53%',
      background: '210 40% 98%',
      surface: '0 0% 100%',
      graphite: '240 10% 4%'
    }
  },
  {
    name: 'blue',
    label: 'Azul Profissional',
    colors: {
      primary: '217 91% 60%',
      secondary: '220 91% 54%',
      accent: '239 84% 67%',
      background: '210 40% 98%',
      surface: '0 0% 100%',
      graphite: '217 33% 17%'
    }
  },
  {
    name: 'purple',
    label: 'Roxo Moderno',
    colors: {
      primary: '262 83% 58%',
      secondary: '258 90% 66%',
      accent: '330 81% 60%',
      background: '300 20% 99%',
      surface: '0 0% 100%',
      graphite: '262 47% 25%'
    }
  },
  {
    name: 'emerald',
    label: 'Verde Esmeralda',
    colors: {
      primary: '158 64% 52%',
      secondary: '160 84% 39%',
      accent: '142 76% 36%',
      background: '152 81% 96%',
      surface: '0 0% 100%',
      graphite: '158 36% 17%'
    }
  },
  {
    name: 'sunset',
    label: 'Pôr do Sol',
    colors: {
      primary: '25 95% 53%',
      secondary: '45 93% 47%',
      accent: '0 84% 60%',
      background: '48 100% 96%',
      surface: '0 0% 100%',
      graphite: '25 47% 25%'
    }
  },
  {
    name: 'ocean',
    label: 'Oceano',
    colors: {
      primary: '199 89% 48%',
      secondary: '188 86% 53%',
      accent: '180 78% 60%',
      background: '204 100% 97%',
      surface: '0 0% 100%',
      graphite: '199 43% 20%'
    }
  }
];

// Chaves para localStorage
const THEME_STORAGE_KEY = 'plenne_user_theme';
const DARK_MODE_STORAGE_KEY = 'plenne_dark_mode';

export function useThemes() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [currentTheme, setCurrentTheme] = useState<string>('default');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const applyTheme = (themeName: string, darkMode?: boolean) => {
    const theme = defaultThemes.find(t => t.name === themeName);
    if (!theme) return;

    const root = document.documentElement;
    const useDarkMode = darkMode !== undefined ? darkMode : isDarkMode;
    
    // Aplicar ou remover classe dark
    if (useDarkMode) {
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
    
    // Salvar no localStorage para persistência imediata
    localStorage.setItem(THEME_STORAGE_KEY, themeName);
  };

  const toggleDarkMode = async () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    // Aplicar imediatamente
    const root = document.documentElement;
    if (newDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Salvar no localStorage
    localStorage.setItem(DARK_MODE_STORAGE_KEY, String(newDarkMode));
    
    // Salvar no banco se usuário estiver logado
    if (user) {
      try {
        await supabase
          .from('user_themes')
          .upsert({
            user_id: user.id,
            theme_name: currentTheme,
            is_active: true,
            custom_colors: { darkMode: newDarkMode }
          });
      } catch (error) {
        console.error('Erro ao salvar preferência de modo escuro:', error);
      }
    }
  };

  const saveTheme = async (themeName: string) => {
    // Aplicar o tema imediatamente
    applyTheme(themeName);

    if (!user) {
      toast({
        title: "Tema aplicado!",
        description: "Faça login para salvar suas preferências."
      });
      return;
    }

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
      
      toast({
        title: "Tema salvo!",
        description: `Tema ${defaultThemes.find(t => t.name === themeName)?.label} aplicado em todas as páginas.`
      });
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao salvar tema, mas foi aplicado localmente."
      });
    }
  };

  const loadUserTheme = async () => {
    // Carregar preferência de dark mode do localStorage primeiro
    const savedDarkMode = localStorage.getItem(DARK_MODE_STORAGE_KEY) === 'true';
    setIsDarkMode(savedDarkMode);
    
    if (!user) {
      // Tentar carregar do localStorage se não estiver logado
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme) {
        applyTheme(savedTheme, savedDarkMode);
      } else {
        applyTheme('default', savedDarkMode);
      }
      setLoading(false);
      return;
    }

    try {
      const { data } = await supabase
        .from('user_themes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (data) {
        const customColors = data.custom_colors as { darkMode?: boolean } | null;
        const darkModeFromDb = customColors?.darkMode || false;
        setIsDarkMode(darkModeFromDb);
        localStorage.setItem(DARK_MODE_STORAGE_KEY, String(darkModeFromDb));
        applyTheme(data.theme_name, darkModeFromDb);
      } else {
        // Tentar carregar do localStorage
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme) {
          applyTheme(savedTheme, savedDarkMode);
        } else {
          applyTheme('default', savedDarkMode);
        }
      }
    } catch (error) {
      // Se não há tema salvo, tentar localStorage
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme) {
        applyTheme(savedTheme, savedDarkMode);
      } else {
        applyTheme('default', savedDarkMode);
      }
    } finally {
      setLoading(false);
    }
  };

  // Carregar tema quando o usuário mudar
  useEffect(() => {
    loadUserTheme();
  }, [user?.id]);

  // Aplicar tema sempre que o componente renderizar (garantir persistência)
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'default';
    const savedDarkMode = localStorage.getItem(DARK_MODE_STORAGE_KEY) === 'true';
    if (currentTheme !== savedTheme) {
      applyTheme(savedTheme, savedDarkMode);
    }
  }, []);

  // Re-aplicar dark mode quando mudar
  useEffect(() => {
    applyTheme(currentTheme, isDarkMode);
  }, [isDarkMode]);

  return {
    themes: defaultThemes,
    currentTheme,
    isDarkMode,
    loading,
    applyTheme,
    saveTheme,
    toggleDarkMode
  };
}