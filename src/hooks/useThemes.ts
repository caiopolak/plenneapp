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

interface DefaultTheme {
  name: string;
  label: string;
  description: string;
  colors: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
}

const defaultThemes: DefaultTheme[] = [
  {
    name: 'default',
    label: 'Esmeralda',
    description: 'Verde institucional Plenne, sofisticado e confiável',
    colors: {
      light: {
        primary: '158 64% 35%',
        secondary: '142 76% 36%',
        accent: '38 92% 50%',
        background: '150 20% 98%',
        surface: '0 0% 100%',
        foreground: '158 30% 15%'
      },
      dark: {
        primary: '158 64% 52%',
        secondary: '142 76% 50%',
        accent: '38 92% 55%',
        background: '160 15% 6%',
        surface: '160 12% 10%',
        foreground: '0 0% 98%'
      }
    }
  },
  {
    name: 'ocean',
    label: 'Oceano',
    description: 'Azul profundo e sereno, transmite calma e profissionalismo',
    colors: {
      light: {
        primary: '199 89% 48%',
        secondary: '188 86% 45%',
        accent: '172 70% 50%',
        background: '200 40% 98%',
        surface: '0 0% 100%',
        foreground: '199 43% 18%'
      },
      dark: {
        primary: '199 89% 60%',
        secondary: '188 86% 55%',
        accent: '172 70% 55%',
        background: '200 25% 6%',
        surface: '200 20% 10%',
        foreground: '0 0% 98%'
      }
    }
  },
  {
    name: 'lavender',
    label: 'Lavanda',
    description: 'Roxo suave e elegante, sofisticação e criatividade',
    colors: {
      light: {
        primary: '262 72% 55%',
        secondary: '280 60% 60%',
        accent: '315 70% 60%',
        background: '270 30% 98%',
        surface: '0 0% 100%',
        foreground: '262 45% 20%'
      },
      dark: {
        primary: '262 72% 68%',
        secondary: '280 60% 70%',
        accent: '315 70% 70%',
        background: '270 20% 6%',
        surface: '270 15% 10%',
        foreground: '0 0% 98%'
      }
    }
  },
  {
    name: 'sunset',
    label: 'Pôr do Sol',
    description: 'Tons quentes e acolhedores, energia e otimismo',
    colors: {
      light: {
        primary: '25 95% 53%',
        secondary: '38 95% 50%',
        accent: '0 85% 60%',
        background: '35 50% 97%',
        surface: '0 0% 100%',
        foreground: '25 50% 18%'
      },
      dark: {
        primary: '25 95% 60%',
        secondary: '38 95% 55%',
        accent: '0 85% 65%',
        background: '25 20% 6%',
        surface: '25 15% 10%',
        foreground: '0 0% 98%'
      }
    }
  },
  {
    name: 'rose',
    label: 'Rose Gold',
    description: 'Rosa elegante e sofisticado, luxo discreto',
    colors: {
      light: {
        primary: '346 75% 55%',
        secondary: '330 70% 60%',
        accent: '20 80% 55%',
        background: '340 30% 98%',
        surface: '0 0% 100%',
        foreground: '346 40% 18%'
      },
      dark: {
        primary: '346 75% 65%',
        secondary: '330 70% 70%',
        accent: '20 80% 60%',
        background: '340 15% 6%',
        surface: '340 12% 10%',
        foreground: '0 0% 98%'
      }
    }
  },
  {
    name: 'midnight',
    label: 'Meia-Noite',
    description: 'Azul escuro premium, executivo e impactante',
    colors: {
      light: {
        primary: '222 85% 45%',
        secondary: '215 75% 50%',
        accent: '230 80% 65%',
        background: '220 25% 97%',
        surface: '0 0% 100%',
        foreground: '222 50% 15%'
      },
      dark: {
        primary: '222 85% 60%',
        secondary: '215 75% 60%',
        accent: '230 80% 70%',
        background: '222 25% 5%',
        surface: '222 20% 9%',
        foreground: '0 0% 98%'
      }
    }
  },
  {
    name: 'forest',
    label: 'Floresta',
    description: 'Verde escuro natural, conexão com a natureza',
    colors: {
      light: {
        primary: '150 45% 35%',
        secondary: '140 40% 40%',
        accent: '80 50% 45%',
        background: '140 20% 97%',
        surface: '0 0% 100%',
        foreground: '150 35% 15%'
      },
      dark: {
        primary: '150 45% 50%',
        secondary: '140 40% 50%',
        accent: '80 50% 55%',
        background: '150 20% 5%',
        surface: '150 15% 9%',
        foreground: '0 0% 98%'
      }
    }
  },
  {
    name: 'coral',
    label: 'Coral',
    description: 'Vibrante e moderno, dinamismo e juventude',
    colors: {
      light: {
        primary: '12 90% 60%',
        secondary: '25 85% 55%',
        accent: '350 80% 58%',
        background: '15 40% 98%',
        surface: '0 0% 100%',
        foreground: '12 50% 18%'
      },
      dark: {
        primary: '12 90% 65%',
        secondary: '25 85% 60%',
        accent: '350 80% 65%',
        background: '12 20% 6%',
        surface: '12 15% 10%',
        foreground: '0 0% 98%'
      }
    }
  },
  {
    name: 'slate',
    label: 'Ardósia',
    description: 'Neutro e profissional, minimalismo elegante',
    colors: {
      light: {
        primary: '215 20% 40%',
        secondary: '210 15% 50%',
        accent: '200 60% 50%',
        background: '210 20% 98%',
        surface: '0 0% 100%',
        foreground: '215 25% 15%'
      },
      dark: {
        primary: '215 20% 60%',
        secondary: '210 15% 60%',
        accent: '200 60% 60%',
        background: '215 20% 6%',
        surface: '215 15% 10%',
        foreground: '0 0% 98%'
      }
    }
  },
  // Novos temas premium
  {
    name: 'aurora',
    label: 'Aurora Boreal',
    description: 'Tons mágicos de verde e azul, inspiração nórdica',
    colors: {
      light: {
        primary: '180 70% 40%',
        secondary: '160 80% 45%',
        accent: '200 85% 55%',
        background: '175 35% 97%',
        surface: '0 0% 100%',
        foreground: '180 50% 15%'
      },
      dark: {
        primary: '180 70% 55%',
        secondary: '160 80% 55%',
        accent: '200 85% 65%',
        background: '180 25% 5%',
        surface: '180 20% 9%',
        foreground: '0 0% 98%'
      }
    }
  },
  {
    name: 'mocha',
    label: 'Mocha',
    description: 'Tons de café e chocolate, aconchegante e premium',
    colors: {
      light: {
        primary: '25 50% 35%',
        secondary: '35 40% 45%',
        accent: '15 60% 50%',
        background: '30 30% 97%',
        surface: '0 0% 100%',
        foreground: '25 40% 15%'
      },
      dark: {
        primary: '25 50% 50%',
        secondary: '35 40% 55%',
        accent: '15 60% 55%',
        background: '25 25% 6%',
        surface: '25 20% 10%',
        foreground: '0 0% 98%'
      }
    }
  },
  {
    name: 'amethyst',
    label: 'Ametista',
    description: 'Roxo profundo e misterioso, realeza e sabedoria',
    colors: {
      light: {
        primary: '280 65% 45%',
        secondary: '295 55% 50%',
        accent: '320 70% 55%',
        background: '280 25% 97%',
        surface: '0 0% 100%',
        foreground: '280 50% 18%'
      },
      dark: {
        primary: '280 65% 60%',
        secondary: '295 55% 65%',
        accent: '320 70% 65%',
        background: '280 25% 5%',
        surface: '280 20% 9%',
        foreground: '0 0% 98%'
      }
    }
  },
  {
    name: 'mint',
    label: 'Menta',
    description: 'Verde menta refrescante, leve e jovial',
    colors: {
      light: {
        primary: '168 76% 42%',
        secondary: '158 70% 48%',
        accent: '185 65% 50%',
        background: '165 40% 97%',
        surface: '0 0% 100%',
        foreground: '168 55% 15%'
      },
      dark: {
        primary: '168 76% 55%',
        secondary: '158 70% 58%',
        accent: '185 65% 58%',
        background: '168 25% 5%',
        surface: '168 20% 9%',
        foreground: '0 0% 98%'
      }
    }
  },
  {
    name: 'cherry',
    label: 'Cereja',
    description: 'Vermelho vibrante e elegante, paixão e energia',
    colors: {
      light: {
        primary: '350 85% 50%',
        secondary: '340 75% 55%',
        accent: '15 80% 55%',
        background: '350 30% 97%',
        surface: '0 0% 100%',
        foreground: '350 50% 15%'
      },
      dark: {
        primary: '350 85% 60%',
        secondary: '340 75% 65%',
        accent: '15 80% 60%',
        background: '350 25% 5%',
        surface: '350 20% 9%',
        foreground: '0 0% 98%'
      }
    }
  },
  {
    name: 'gold',
    label: 'Ouro',
    description: 'Dourado luxuoso, riqueza e exclusividade',
    colors: {
      light: {
        primary: '45 90% 45%',
        secondary: '38 85% 50%',
        accent: '30 80% 45%',
        background: '45 40% 97%',
        surface: '0 0% 100%',
        foreground: '45 60% 15%'
      },
      dark: {
        primary: '45 90% 55%',
        secondary: '38 85% 58%',
        accent: '30 80% 55%',
        background: '45 25% 5%',
        surface: '45 20% 9%',
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
        // Garante que existe uma linha ativa para o tema atual e atualiza apenas o darkMode
        const now = new Date().toISOString();

        // 1) Upsert da linha do tema atual (chave única user_id, theme_name)
        const { error: upsertErr } = await supabase
          .from('user_themes')
          .upsert({
            user_id: user.id,
            theme_name: currentTheme,
            is_active: true,
            custom_colors: { darkMode: newDarkMode },
            updated_at: now,
          }, { onConflict: 'user_id,theme_name' });
        if (upsertErr) throw upsertErr;

        // 2) Opcional: garantir que outros temas fiquem inativos
        await supabase
          .from('user_themes')
          .update({ is_active: false })
          .eq('user_id', user.id)
          .neq('theme_name', currentTheme);
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
      // Persistir preferências do usuário garantindo exclusividade por (user_id, theme_name)
      const now = new Date().toISOString();

      // 1) Desativar outros temas do usuário
      const { error: deactivateErr } = await supabase
        .from('user_themes')
        .update({ is_active: false })
        .eq('user_id', user.id);
      if (deactivateErr) throw deactivateErr;

      // 2) Upsert do tema escolhido como ativo
      const { error: upsertErr } = await supabase
        .from('user_themes')
        .upsert({
          user_id: user.id,
          theme_name: themeName,
          is_active: true,
          custom_colors: { darkMode: isDarkMode },
          updated_at: now,
        }, { onConflict: 'user_id,theme_name' });
      if (upsertErr) throw upsertErr;
      
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
        .order('is_active', { ascending: false })
        .order('updated_at', { ascending: false })
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(1);

      const row = Array.isArray(data) ? data[0] : data;
      const savedThemeLS = localStorage.getItem(THEME_STORAGE_KEY) || undefined;

      if (row) {
        const customColors = row.custom_colors as { darkMode?: boolean } | null;
        const darkModeFromDb = customColors?.darkMode ?? savedDarkMode;

        // Preferir SEMPRE o valor do banco para usuários logados
        const isValidDb = defaultThemes.some(t => t.name === row.theme_name);
        const isValidLocal = savedThemeLS && defaultThemes.some(t => t.name === savedThemeLS);
        const finalTheme = isValidDb ? row.theme_name : (isValidLocal ? (savedThemeLS as string) : 'default');

        // Aplicar e persistir localmente
        setIsDarkMode(darkModeFromDb);
        localStorage.setItem(DARK_MODE_STORAGE_KEY, String(darkModeFromDb));
        localStorage.setItem(THEME_STORAGE_KEY, finalTheme);
        applyTheme(finalTheme, darkModeFromDb);

        // Se o tema do banco for inválido, sincronizar com o tema final calculado
        if (!isValidDb && finalTheme !== row.theme_name) {
          try {
            const { error: syncErr } = await supabase
              .from('user_themes')
              .update({
                theme_name: finalTheme,
                custom_colors: { darkMode: darkModeFromDb },
                is_active: true,
                updated_at: new Date().toISOString()
              })
              .eq('id', row.id);
            if (syncErr) throw syncErr;
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
          const { error: insertErr } = await supabase
            .from('user_themes')
            .insert({
              user_id: user.id,
              theme_name: finalTheme,
              is_active: true,
              custom_colors: { darkMode: savedDarkMode }
            });
          if (insertErr) throw insertErr;
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