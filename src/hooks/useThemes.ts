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

export interface DefaultTheme {
  name: string;
  label: string;
  description: string;
  plan: 'free' | 'pro' | 'business';
  colors: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
}

// Temas com paletas harmoniosas e categorizados por plano
const defaultThemes: DefaultTheme[] = [
  // ========== TEMAS FREE (5 temas) ==========
  {
    name: 'default',
    label: 'Esmeralda',
    description: 'Verde institucional Plenne, sofisticado e confiável',
    plan: 'free',
    colors: {
      light: {
        primary: '158 64% 35%',
        secondary: '142 50% 42%',
        accent: '43 96% 56%',
        background: '150 20% 98%',
        surface: '0 0% 100%',
        foreground: '158 30% 15%'
      },
      dark: {
        primary: '158 55% 48%',
        secondary: '142 45% 52%',
        accent: '43 90% 52%',
        background: '160 18% 7%',
        surface: '160 14% 11%',
        foreground: '150 15% 95%'
      }
    }
  },
  {
    name: 'ocean',
    label: 'Oceano',
    description: 'Azul profundo inspirado no mar, transmite calma e confiança',
    plan: 'free',
    colors: {
      light: {
        primary: '205 85% 45%',
        secondary: '195 70% 52%',
        accent: '175 65% 48%',
        background: '205 30% 98%',
        surface: '0 0% 100%',
        foreground: '205 50% 15%'
      },
      dark: {
        primary: '205 75% 58%',
        secondary: '195 65% 60%',
        accent: '175 60% 55%',
        background: '205 30% 7%',
        surface: '205 25% 11%',
        foreground: '200 20% 95%'
      }
    }
  },
  {
    name: 'slate',
    label: 'Grafite',
    description: 'Neutro e profissional, minimalismo elegante',
    plan: 'free',
    colors: {
      light: {
        primary: '220 15% 40%',
        secondary: '215 12% 50%',
        accent: '210 55% 55%',
        background: '220 15% 98%',
        surface: '0 0% 100%',
        foreground: '220 25% 12%'
      },
      dark: {
        primary: '220 15% 60%',
        secondary: '215 12% 65%',
        accent: '210 55% 62%',
        background: '220 18% 8%',
        surface: '220 15% 12%',
        foreground: '220 10% 95%'
      }
    }
  },
  {
    name: 'forest',
    label: 'Floresta',
    description: 'Verde natural e acolhedor, conexão com a natureza',
    plan: 'free',
    colors: {
      light: {
        primary: '145 40% 38%',
        secondary: '130 35% 45%',
        accent: '85 45% 50%',
        background: '140 20% 97%',
        surface: '0 0% 100%',
        foreground: '145 35% 15%'
      },
      dark: {
        primary: '145 38% 50%',
        secondary: '130 33% 55%',
        accent: '85 42% 55%',
        background: '145 22% 7%',
        surface: '145 18% 11%',
        foreground: '140 15% 95%'
      }
    }
  },
  {
    name: 'midnight',
    label: 'Meia-Noite',
    description: 'Azul escuro elegante, executivo e impactante',
    plan: 'free',
    colors: {
      light: {
        primary: '225 65% 50%',
        secondary: '215 55% 55%',
        accent: '240 60% 65%',
        background: '225 25% 97%',
        surface: '0 0% 100%',
        foreground: '225 50% 12%'
      },
      dark: {
        primary: '225 60% 62%',
        secondary: '215 52% 62%',
        accent: '240 55% 70%',
        background: '225 30% 6%',
        surface: '225 25% 10%',
        foreground: '225 15% 95%'
      }
    }
  },

  // ========== TEMAS PRO (8 temas) ==========
  {
    name: 'lavender',
    label: 'Lavanda',
    description: 'Roxo suave e relaxante, sofisticação e criatividade',
    plan: 'pro',
    colors: {
      light: {
        primary: '268 55% 55%',
        secondary: '280 45% 60%',
        accent: '300 50% 62%',
        background: '270 25% 98%',
        surface: '0 0% 100%',
        foreground: '268 40% 18%'
      },
      dark: {
        primary: '268 50% 65%',
        secondary: '280 42% 68%',
        accent: '300 48% 70%',
        background: '270 22% 7%',
        surface: '270 18% 11%',
        foreground: '270 15% 95%'
      }
    }
  },
  {
    name: 'sunset',
    label: 'Pôr do Sol',
    description: 'Laranja quente e vibrante, energia e otimismo',
    plan: 'pro',
    colors: {
      light: {
        primary: '25 90% 52%',
        secondary: '35 88% 55%',
        accent: '15 85% 58%',
        background: '30 40% 98%',
        surface: '0 0% 100%',
        foreground: '25 45% 15%'
      },
      dark: {
        primary: '25 85% 58%',
        secondary: '35 82% 60%',
        accent: '15 80% 62%',
        background: '25 25% 7%',
        surface: '25 20% 11%',
        foreground: '30 20% 95%'
      }
    }
  },
  {
    name: 'rose',
    label: 'Rose Gold',
    description: 'Rosa elegante e sofisticado, luxo discreto e feminino',
    plan: 'pro',
    colors: {
      light: {
        primary: '350 65% 55%',
        secondary: '340 55% 60%',
        accent: '20 70% 58%',
        background: '350 25% 98%',
        surface: '0 0% 100%',
        foreground: '350 40% 15%'
      },
      dark: {
        primary: '350 58% 62%',
        secondary: '340 50% 68%',
        accent: '20 65% 62%',
        background: '350 20% 7%',
        surface: '350 16% 11%',
        foreground: '350 15% 95%'
      }
    }
  },
  {
    name: 'coral',
    label: 'Coral',
    description: 'Vibrante e moderno, dinamismo e juventude',
    plan: 'pro',
    colors: {
      light: {
        primary: '12 80% 58%',
        secondary: '20 75% 55%',
        accent: '0 72% 60%',
        background: '15 35% 98%',
        surface: '0 0% 100%',
        foreground: '12 45% 15%'
      },
      dark: {
        primary: '12 75% 62%',
        secondary: '20 70% 60%',
        accent: '0 68% 65%',
        background: '12 22% 7%',
        surface: '12 18% 11%',
        foreground: '15 15% 95%'
      }
    }
  },
  {
    name: 'mint',
    label: 'Menta',
    description: 'Verde menta refrescante, leve e revitalizante',
    plan: 'pro',
    colors: {
      light: {
        primary: '168 62% 45%',
        secondary: '175 55% 50%',
        accent: '155 50% 48%',
        background: '168 30% 97%',
        surface: '0 0% 100%',
        foreground: '168 45% 15%'
      },
      dark: {
        primary: '168 55% 55%',
        secondary: '175 50% 58%',
        accent: '155 48% 55%',
        background: '168 25% 7%',
        surface: '168 20% 11%',
        foreground: '168 15% 95%'
      }
    }
  },
  {
    name: 'aurora',
    label: 'Aurora Boreal',
    description: 'Tons mágicos de verde e azul, inspiração nórdica',
    plan: 'pro',
    colors: {
      light: {
        primary: '180 55% 42%',
        secondary: '165 60% 48%',
        accent: '200 65% 55%',
        background: '180 25% 97%',
        surface: '0 0% 100%',
        foreground: '180 45% 15%'
      },
      dark: {
        primary: '180 50% 52%',
        secondary: '165 55% 55%',
        accent: '200 60% 62%',
        background: '180 25% 6%',
        surface: '180 20% 10%',
        foreground: '180 15% 95%'
      }
    }
  },
  {
    name: 'mocha',
    label: 'Mocha',
    description: 'Tons de café e chocolate, aconchegante e elegante',
    plan: 'pro',
    colors: {
      light: {
        primary: '28 45% 38%',
        secondary: '35 40% 45%',
        accent: '18 55% 50%',
        background: '30 25% 97%',
        surface: '0 0% 100%',
        foreground: '28 40% 15%'
      },
      dark: {
        primary: '28 42% 50%',
        secondary: '35 38% 55%',
        accent: '18 50% 55%',
        background: '28 25% 7%',
        surface: '28 20% 11%',
        foreground: '28 15% 95%'
      }
    }
  },
  {
    name: 'cherry',
    label: 'Cereja',
    description: 'Vermelho vibrante e apaixonado, energia e ousadia',
    plan: 'pro',
    colors: {
      light: {
        primary: '355 72% 52%',
        secondary: '345 65% 58%',
        accent: '10 70% 55%',
        background: '355 25% 98%',
        surface: '0 0% 100%',
        foreground: '355 45% 12%'
      },
      dark: {
        primary: '355 68% 58%',
        secondary: '345 60% 65%',
        accent: '10 65% 60%',
        background: '355 25% 7%',
        surface: '355 20% 11%',
        foreground: '355 15% 95%'
      }
    }
  },

  // ========== TEMAS BUSINESS (7 temas exclusivos) ==========
  {
    name: 'gold',
    label: 'Ouro Imperial',
    description: 'Dourado luxuoso e exclusivo, riqueza e prestígio',
    plan: 'business',
    colors: {
      light: {
        primary: '45 85% 48%',
        secondary: '38 80% 52%',
        accent: '30 75% 50%',
        background: '45 30% 97%',
        surface: '0 0% 100%',
        foreground: '45 50% 12%'
      },
      dark: {
        primary: '45 80% 55%',
        secondary: '38 75% 58%',
        accent: '30 70% 55%',
        background: '45 28% 6%',
        surface: '45 22% 10%',
        foreground: '45 20% 95%'
      }
    }
  },
  {
    name: 'amethyst',
    label: 'Ametista',
    description: 'Roxo profundo e místico, realeza e sabedoria',
    plan: 'business',
    colors: {
      light: {
        primary: '275 55% 50%',
        secondary: '290 48% 55%',
        accent: '260 50% 58%',
        background: '275 22% 97%',
        surface: '0 0% 100%',
        foreground: '275 45% 15%'
      },
      dark: {
        primary: '275 50% 60%',
        secondary: '290 45% 65%',
        accent: '260 48% 65%',
        background: '275 25% 6%',
        surface: '275 20% 10%',
        foreground: '275 15% 95%'
      }
    }
  },
  {
    name: 'obsidian',
    label: 'Obsidiana',
    description: 'Preto refinado com toques de azul, poder e elegância',
    plan: 'business',
    colors: {
      light: {
        primary: '230 25% 35%',
        secondary: '220 22% 42%',
        accent: '210 45% 52%',
        background: '230 18% 97%',
        surface: '0 0% 100%',
        foreground: '230 30% 10%'
      },
      dark: {
        primary: '230 22% 55%',
        secondary: '220 20% 60%',
        accent: '210 42% 60%',
        background: '230 25% 5%',
        surface: '230 20% 9%',
        foreground: '230 12% 95%'
      }
    }
  },
  {
    name: 'sapphire',
    label: 'Safira',
    description: 'Azul precioso e profundo, sofisticação atemporal',
    plan: 'business',
    colors: {
      light: {
        primary: '215 72% 48%',
        secondary: '225 65% 55%',
        accent: '200 60% 52%',
        background: '215 28% 97%',
        surface: '0 0% 100%',
        foreground: '215 55% 12%'
      },
      dark: {
        primary: '215 68% 58%',
        secondary: '225 60% 62%',
        accent: '200 55% 58%',
        background: '215 30% 6%',
        surface: '215 25% 10%',
        foreground: '215 15% 95%'
      }
    }
  },
  {
    name: 'emerald',
    label: 'Esmeralda Real',
    description: 'Verde esmeralda intenso e vibrante, luxo natural',
    plan: 'business',
    colors: {
      light: {
        primary: '152 62% 40%',
        secondary: '165 55% 45%',
        accent: '140 50% 48%',
        background: '152 25% 97%',
        surface: '0 0% 100%',
        foreground: '152 50% 12%'
      },
      dark: {
        primary: '152 58% 50%',
        secondary: '165 52% 55%',
        accent: '140 48% 55%',
        background: '152 28% 6%',
        surface: '152 22% 10%',
        foreground: '152 15% 95%'
      }
    }
  },
  {
    name: 'wine',
    label: 'Vinho Nobre',
    description: 'Bordô sofisticado e intenso, requinte e tradição',
    plan: 'business',
    colors: {
      light: {
        primary: '345 55% 42%',
        secondary: '355 48% 48%',
        accent: '335 45% 52%',
        background: '345 22% 97%',
        surface: '0 0% 100%',
        foreground: '345 45% 12%'
      },
      dark: {
        primary: '345 50% 52%',
        secondary: '355 45% 58%',
        accent: '335 42% 58%',
        background: '345 28% 6%',
        surface: '345 22% 10%',
        foreground: '345 15% 95%'
      }
    }
  },
  {
    name: 'platinum',
    label: 'Platina',
    description: 'Cinza prateado premium, modernidade e exclusividade',
    plan: 'business',
    colors: {
      light: {
        primary: '210 12% 45%',
        secondary: '200 10% 52%',
        accent: '220 35% 58%',
        background: '210 15% 98%',
        surface: '0 0% 100%',
        foreground: '210 20% 10%'
      },
      dark: {
        primary: '210 12% 62%',
        secondary: '200 10% 68%',
        accent: '220 32% 65%',
        background: '210 18% 6%',
        surface: '210 14% 10%',
        foreground: '210 10% 96%'
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
    
    // Reaplicar tema com novo modo
    applyTheme(currentTheme, newDarkMode);
    
    // Salvar no banco se usuário estiver logado
    if (user) {
      try {
        const now = new Date().toISOString();

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

        await supabase
          .from('user_themes')
          .update({ is_active: false })
          .eq('user_id', user.id)
          .neq('theme_name', currentTheme);
      } catch (error) {
        console.error('Erro ao salvar modo escuro:', error);
      }
    }
  };

  const saveTheme = async (themeName: string) => {
    applyTheme(themeName, isDarkMode);
    
    toast({
      title: "Tema aplicado",
      description: `O tema foi alterado com sucesso.`,
    });
    
    if (user) {
      try {
        const now = new Date().toISOString();
        
        await supabase
          .from('user_themes')
          .update({ is_active: false, updated_at: now })
          .eq('user_id', user.id);
        
        const { error } = await supabase
          .from('user_themes')
          .upsert({
            user_id: user.id,
            theme_name: themeName,
            is_active: true,
            custom_colors: { darkMode: isDarkMode },
            updated_at: now,
          }, { onConflict: 'user_id,theme_name' });
        
        if (error) throw error;
      } catch (error) {
        console.error('Erro ao salvar tema:', error);
      }
    }
  };

  const loadUserTheme = async () => {
    setLoading(true);
    
    // 1. Tentar carregar do localStorage primeiro (resposta instantânea)
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const storedDarkMode = localStorage.getItem(DARK_MODE_STORAGE_KEY);
    
    if (storedTheme) {
      const darkMode = storedDarkMode === 'true';
      setIsDarkMode(darkMode);
      applyTheme(storedTheme, darkMode);
    }
    
    // 2. Se usuário logado, sincronizar com o banco
    if (user) {
      try {
        const { data, error } = await supabase
          .from('user_themes')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();
        
        if (data && !error) {
          const customColors = data.custom_colors as Record<string, unknown> | null;
          const darkMode = customColors?.darkMode === true;
          
          setIsDarkMode(darkMode);
          applyTheme(data.theme_name, darkMode);
          
          // Sincronizar localStorage com banco
          localStorage.setItem(THEME_STORAGE_KEY, data.theme_name);
          localStorage.setItem(DARK_MODE_STORAGE_KEY, String(darkMode));
        }
      } catch (error) {
        // Silently fail - já temos o tema do localStorage
      }
    }
    
    setLoading(false);
  };

  useEffect(() => {
    loadUserTheme();
  }, [user]);

  return {
    themes: defaultThemes,
    currentTheme,
    isDarkMode,
    loading,
    applyTheme,
    saveTheme,
    toggleDarkMode,
    loadUserTheme
  };
}
