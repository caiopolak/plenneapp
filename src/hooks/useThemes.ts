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
      light: {
        primary: '216 87% 18%',
        secondary: '142 76% 36%',
        accent: '24 95% 53%',
        background: '210 40% 98%',
        surface: '0 0% 100%',
        foreground: '240 10% 4%'
      },
      dark: {
        primary: '199 89% 65%',
        secondary: '142 76% 55%',
        accent: '24 95% 60%',
        background: '240 10% 3.9%',
        surface: '240 10% 8%',
        foreground: '0 0% 98%'
      }
    }
  },
  {
    name: 'blue',
    label: 'Azul Profissional',
    colors: {
      light: {
        primary: '217 91% 60%',
        secondary: '220 91% 54%',
        accent: '239 84% 67%',
        background: '210 40% 98%',
        surface: '0 0% 100%',
        foreground: '217 33% 17%'
      },
      dark: {
        primary: '217 91% 70%',
        secondary: '220 91% 65%',
        accent: '239 84% 75%',
        background: '240 10% 3.9%',
        surface: '240 10% 8%',
        foreground: '0 0% 98%'
      }
    }
  },
  {
    name: 'purple',
    label: 'Roxo Moderno',
    colors: {
      light: {
        primary: '262 83% 58%',
        secondary: '258 90% 66%',
        accent: '330 81% 60%',
        background: '300 20% 99%',
        surface: '0 0% 100%',
        foreground: '262 47% 25%'
      },
      dark: {
        primary: '262 83% 70%',
        secondary: '258 90% 75%',
        accent: '330 81% 70%',
        background: '240 10% 3.9%',
        surface: '240 10% 8%',
        foreground: '0 0% 98%'
      }
    }
  },
  {
    name: 'emerald',
    label: 'Verde Esmeralda',
    colors: {
      light: {
        primary: '158 64% 52%',
        secondary: '160 84% 39%',
        accent: '142 76% 36%',
        background: '152 81% 96%',
        surface: '0 0% 100%',
        foreground: '158 36% 17%'
      },
      dark: {
        primary: '158 64% 65%',
        secondary: '160 84% 55%',
        accent: '142 76% 50%',
        background: '240 10% 3.9%',
        surface: '240 10% 8%',
        foreground: '0 0% 98%'
      }
    }
  },
  {
    name: 'sunset',
    label: 'Pôr do Sol',
    colors: {
      light: {
        primary: '25 95% 53%',
        secondary: '45 93% 47%',
        accent: '0 84% 60%',
        background: '48 100% 96%',
        surface: '0 0% 100%',
        foreground: '25 47% 25%'
      },
      dark: {
        primary: '25 95% 65%',
        secondary: '45 93% 60%',
        accent: '0 84% 70%',
        background: '240 10% 3.9%',
        surface: '240 10% 8%',
        foreground: '0 0% 98%'
      }
    }
  },
  {
    name: 'ocean',
    label: 'Oceano',
    colors: {
      light: {
        primary: '199 89% 48%',
        secondary: '188 86% 53%',
        accent: '180 78% 60%',
        background: '204 100% 97%',
        surface: '0 0% 100%',
        foreground: '199 43% 20%'
      },
      dark: {
        primary: '199 89% 65%',
        secondary: '188 86% 65%',
        accent: '180 78% 70%',
        background: '240 10% 3.9%',
        surface: '240 10% 8%',
        foreground: '0 0% 98%'
      }
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
    
    // Selecionar cores baseadas no modo
    const themeColors = useDarkMode ? theme.colors.dark : theme.colors.light;
    
    // Aplicar ou remover classe dark
    if (useDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Aplicar cores usando valores HSL corretos
    Object.entries(themeColors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
      
      // Também aplicar nas variáveis CSS principais
      if (key === 'primary') root.style.setProperty('--primary', value);
      if (key === 'secondary') root.style.setProperty('--secondary', value);
      if (key === 'accent') root.style.setProperty('--accent', value);
      if (key === 'background') root.style.setProperty('--background', value);
      if (key === 'surface') root.style.setProperty('--card', value);
      if (key === 'foreground') {
        root.style.setProperty('--foreground', value);
        root.style.setProperty('--card-foreground', value);
      }
    });
    
    // Atualizar muted colors baseado no modo
    if (useDarkMode) {
      root.style.setProperty('--muted', '240 5% 18%');
      root.style.setProperty('--muted-foreground', '240 5% 65%');
      root.style.setProperty('--border', '240 5% 25%');
      root.style.setProperty('--input', '240 5% 18%');
      root.style.setProperty('--primary-foreground', '0 0% 98%');
      root.style.setProperty('--secondary-foreground', '0 0% 98%');
      root.style.setProperty('--accent-foreground', '0 0% 98%');
      root.style.setProperty('--popover', '240 10% 10%');
      root.style.setProperty('--popover-foreground', '0 0% 98%');
      
      // Ajustar surface para cards
      root.style.setProperty('--card', '240 10% 10%');
      root.style.setProperty('--card-foreground', '0 0% 98%');
    } else {
      root.style.setProperty('--muted', '210 40% 96%');
      root.style.setProperty('--muted-foreground', '240 3.8% 46.1%');
      root.style.setProperty('--border', '240 5.9% 90%');
      root.style.setProperty('--input', '240 5.9% 90%');
      root.style.setProperty('--primary-foreground', '0 0% 98%');
      
      root.style.setProperty('--secondary-foreground', '0 0% 98%');
      root.style.setProperty('--accent-foreground', '0 0% 98%');
      root.style.setProperty('--popover', '0 0% 100%');
      root.style.setProperty('--popover-foreground', '240 10% 3.9%');
      
      // Restaurar surface para cards
      root.style.setProperty('--card', themeColors.surface);
      root.style.setProperty('--card-foreground', '240 10% 3.9%');
    }
    
    // Atualizar gradientes baseados nas novas cores
    const gradientPrimary = `linear-gradient(120deg, hsl(${themeColors.primary}) 0%, hsl(${themeColors.secondary}) 100%)`;
    const gradientAccent = `linear-gradient(98deg, hsl(${themeColors.accent}) 15%, hsl(${themeColors.primary}) 89%)`;
    
    root.style.setProperty('--gradient-primary', gradientPrimary);
    root.style.setProperty('--gradient-accent', gradientAccent);
    
    setCurrentTheme(themeName);
    
    // Salvar no localStorage para persistência imediata
    localStorage.setItem(THEME_STORAGE_KEY, themeName);
    if (darkMode !== undefined) {
      localStorage.setItem(DARK_MODE_STORAGE_KEY, String(useDarkMode));
    }
  };

  const toggleDarkMode = async (next?: boolean) => {
    const newDarkMode = typeof next === 'boolean' ? next : !isDarkMode;
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
        // 1) Buscar a linha mais recente do usuário e atualizar; se não houver, criar
        const { data: existing, error: fetchErr } = await supabase
          .from('user_themes')
          .select('id')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(1);

        if (fetchErr) throw fetchErr;

        if (existing && existing.length > 0) {
          await supabase
            .from('user_themes')
            .update({
              theme_name: currentTheme,
              is_active: true,
              custom_colors: { darkMode: newDarkMode },
              updated_at: new Date().toISOString()
            })
            .eq('id', existing[0].id);
        } else {
          await supabase
            .from('user_themes')
            .insert({
              user_id: user.id,
              theme_name: currentTheme,
              is_active: true,
              custom_colors: { darkMode: newDarkMode }
            });
        }
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
      // Persistir preferências do usuário com única linha por usuário (cria/atualiza)
      const { data: existing, error: fetchErr } = await supabase
        .from('user_themes')
        .select('id')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1);
      if (fetchErr) throw fetchErr;

      if (existing && existing.length > 0) {
        await supabase
          .from('user_themes')
          .update({
            theme_name: themeName,
            custom_colors: { darkMode: isDarkMode },
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing[0].id);
      } else {
        await supabase
          .from('user_themes')
          .insert({
            user_id: user.id,
            theme_name: themeName,
            is_active: true,
            custom_colors: { darkMode: isDarkMode }
          });
      }
      
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
        .order('updated_at', { ascending: false })
        .limit(1);

      const row = Array.isArray(data) ? data[0] : data;
      const savedThemeLS = localStorage.getItem(THEME_STORAGE_KEY) || undefined;

      if (row) {
        const customColors = row.custom_colors as { darkMode?: boolean } | null;
        const darkModeFromDb = customColors?.darkMode ?? savedDarkMode;

        // Preferir o tema salvo no dispositivo caso exista e seja válido
        const isValidLocal = savedThemeLS && defaultThemes.some(t => t.name === savedThemeLS);
        const finalTheme = isValidLocal ? (savedThemeLS as string) : row.theme_name;

        // Aplicar e persistir localmente
        setIsDarkMode(darkModeFromDb);
        localStorage.setItem(DARK_MODE_STORAGE_KEY, String(darkModeFromDb));
        localStorage.setItem(THEME_STORAGE_KEY, finalTheme);
        applyTheme(finalTheme, darkModeFromDb);

        // Se o localStorage diverge do banco, sincronizar o banco em background
        if (isValidLocal && savedThemeLS !== row.theme_name) {
          try {
            await supabase
              .from('user_themes')
              .update({
                theme_name: finalTheme,
                custom_colors: { darkMode: darkModeFromDb },
                is_active: true,
                updated_at: new Date().toISOString()
              })
              .eq('id', row.id);
          } catch (e) {
            console.warn('Falha ao sincronizar tema com o banco, mantendo local:', e);
          }
        }
      } else {
        // Sem linha no banco: usar localStorage e criar registro
        const finalTheme = (savedThemeLS && defaultThemes.some(t => t.name === savedThemeLS))
          ? (savedThemeLS as string)
          : 'default';

        localStorage.setItem(THEME_STORAGE_KEY, finalTheme);
        applyTheme(finalTheme, savedDarkMode);

        try {
          await supabase
            .from('user_themes')
            .insert({
              user_id: user.id,
              theme_name: finalTheme,
              is_active: true,
              custom_colors: { darkMode: savedDarkMode }
            });
        } catch (e) {
          console.warn('Não foi possível criar registro de tema. Continuando com configuração local.', e);
        }
      }
    } catch (error) {
      // Se ocorrer erro, tentar localStorage
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