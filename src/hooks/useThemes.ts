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

// ================================================================================
// SISTEMA DE TEMAS PLENNE - Paletas diferenciadas por plano
// ================================================================================
// FREE (5): Cores sólidas, básicas, funcionais - foco em usabilidade
// PRO (8): Cores vibrantes, ousadas, "trendy" - foco em personalidade
// BUSINESS (7): Cores de luxo, metálicas, joias - foco em sofisticação premium
// ================================================================================

const defaultThemes: DefaultTheme[] = [
  // ╔══════════════════════════════════════════════════════════════════════════════╗
  // ║                           TEMAS FREE (5 temas)                               ║
  // ║        Cores básicas, neutras e funcionais - Paletas sólidas                 ║
  // ╚══════════════════════════════════════════════════════════════════════════════╝
  
  {
    name: 'default',
    label: 'Esmeralda',
    description: 'Verde institucional Plenne - padrão e confiável',
    plan: 'free',
    colors: {
      light: {
        primary: '158 64% 35%',
        secondary: '158 50% 42%',
        accent: '158 45% 48%',
        background: '0 0% 99%',
        surface: '0 0% 100%',
        foreground: '158 25% 12%'
      },
      dark: {
        primary: '158 55% 48%',
        secondary: '158 45% 52%',
        accent: '158 40% 56%',
        background: '160 15% 8%',
        surface: '160 12% 12%',
        foreground: '150 10% 95%'
      }
    }
  },
  {
    name: 'ocean',
    label: 'Oceano',
    description: 'Azul clássico - profissional e sereno',
    plan: 'free',
    colors: {
      light: {
        primary: '210 70% 45%',
        secondary: '210 55% 52%',
        accent: '210 50% 58%',
        background: '0 0% 99%',
        surface: '0 0% 100%',
        foreground: '210 40% 12%'
      },
      dark: {
        primary: '210 65% 55%',
        secondary: '210 50% 60%',
        accent: '210 45% 65%',
        background: '210 20% 8%',
        surface: '210 15% 12%',
        foreground: '200 10% 95%'
      }
    }
  },
  {
    name: 'slate',
    label: 'Grafite',
    description: 'Cinza neutro - minimalista e clean',
    plan: 'free',
    colors: {
      light: {
        primary: '220 12% 42%',
        secondary: '220 10% 50%',
        accent: '220 15% 55%',
        background: '0 0% 99%',
        surface: '0 0% 100%',
        foreground: '220 15% 12%'
      },
      dark: {
        primary: '220 10% 60%',
        secondary: '220 8% 65%',
        accent: '220 12% 70%',
        background: '220 10% 8%',
        surface: '220 8% 12%',
        foreground: '220 5% 95%'
      }
    }
  },
  {
    name: 'forest',
    label: 'Floresta',
    description: 'Verde escuro - natural e terroso',
    plan: 'free',
    colors: {
      light: {
        primary: '140 35% 35%',
        secondary: '140 30% 42%',
        accent: '140 25% 48%',
        background: '0 0% 99%',
        surface: '0 0% 100%',
        foreground: '140 30% 12%'
      },
      dark: {
        primary: '140 32% 48%',
        secondary: '140 28% 52%',
        accent: '140 24% 56%',
        background: '140 18% 8%',
        surface: '140 14% 12%',
        foreground: '140 10% 95%'
      }
    }
  },
  {
    name: 'midnight',
    label: 'Meia-Noite',
    description: 'Azul escuro - executivo e sóbrio',
    plan: 'free',
    colors: {
      light: {
        primary: '230 50% 40%',
        secondary: '230 40% 48%',
        accent: '230 35% 55%',
        background: '0 0% 99%',
        surface: '0 0% 100%',
        foreground: '230 35% 12%'
      },
      dark: {
        primary: '230 45% 55%',
        secondary: '230 38% 60%',
        accent: '230 32% 65%',
        background: '230 22% 7%',
        surface: '230 18% 11%',
        foreground: '225 10% 95%'
      }
    }
  },

  // ╔══════════════════════════════════════════════════════════════════════════════╗
  // ║                           TEMAS PRO (8 temas)                                ║
  // ║        Cores vibrantes, combinações ousadas, personalidade forte             ║
  // ╚══════════════════════════════════════════════════════════════════════════════╝

  {
    name: 'aurora',
    label: 'Aurora Neon',
    description: 'Ciano elétrico cyberpunk - futurista e intenso',
    plan: 'pro',
    colors: {
      light: {
        primary: '185 100% 40%',
        secondary: '175 85% 45%',
        accent: '195 90% 50%',
        background: '185 20% 98%',
        surface: '0 0% 100%',
        foreground: '185 60% 10%'
      },
      dark: {
        primary: '185 95% 50%',
        secondary: '175 80% 55%',
        accent: '195 85% 58%',
        background: '185 40% 5%',
        surface: '185 30% 9%',
        foreground: '180 15% 95%'
      }
    }
  },
  {
    name: 'sunset',
    label: 'Pôr do Sol',
    description: 'Laranja quente com rosa - vibrante e energético',
    plan: 'pro',
    colors: {
      light: {
        primary: '25 95% 52%',
        secondary: '15 90% 55%',
        accent: '35 88% 50%',
        background: '30 30% 98%',
        surface: '0 0% 100%',
        foreground: '25 50% 12%'
      },
      dark: {
        primary: '25 90% 58%',
        secondary: '15 85% 60%',
        accent: '35 82% 55%',
        background: '20 30% 6%',
        surface: '20 25% 10%',
        foreground: '30 15% 95%'
      }
    }
  },
  {
    name: 'coral',
    label: 'Coral Vibrante',
    description: 'Coral intenso - moderno e jovem',
    plan: 'pro',
    colors: {
      light: {
        primary: '12 85% 55%',
        secondary: '5 80% 58%',
        accent: '20 82% 52%',
        background: '12 25% 98%',
        surface: '0 0% 100%',
        foreground: '12 50% 12%'
      },
      dark: {
        primary: '12 80% 60%',
        secondary: '5 75% 62%',
        accent: '20 78% 58%',
        background: '12 25% 6%',
        surface: '12 20% 10%',
        foreground: '15 12% 95%'
      }
    }
  },
  {
    name: 'rose',
    label: 'Rose Gold',
    description: 'Rosa dourado - elegante e feminino',
    plan: 'pro',
    colors: {
      light: {
        primary: '350 70% 55%',
        secondary: '340 60% 60%',
        accent: '0 65% 58%',
        background: '350 20% 98%',
        surface: '0 0% 100%',
        foreground: '350 45% 12%'
      },
      dark: {
        primary: '350 65% 62%',
        secondary: '340 55% 65%',
        accent: '0 60% 62%',
        background: '350 22% 6%',
        surface: '350 18% 10%',
        foreground: '350 12% 95%'
      }
    }
  },
  {
    name: 'mint',
    label: 'Menta Fresca',
    description: 'Verde água refrescante - clean e moderno',
    plan: 'pro',
    colors: {
      light: {
        primary: '168 70% 42%',
        secondary: '175 62% 48%',
        accent: '160 58% 45%',
        background: '168 22% 98%',
        surface: '0 0% 100%',
        foreground: '168 50% 10%'
      },
      dark: {
        primary: '168 65% 52%',
        secondary: '175 58% 55%',
        accent: '160 54% 52%',
        background: '168 30% 6%',
        surface: '168 24% 10%',
        foreground: '168 12% 95%'
      }
    }
  },
  {
    name: 'lavender',
    label: 'Lavanda Suave',
    description: 'Lilás delicado - criativo e relaxante',
    plan: 'pro',
    colors: {
      light: {
        primary: '270 60% 55%',
        secondary: '280 52% 60%',
        accent: '260 48% 58%',
        background: '270 18% 98%',
        surface: '0 0% 100%',
        foreground: '270 45% 12%'
      },
      dark: {
        primary: '270 55% 62%',
        secondary: '280 48% 65%',
        accent: '260 44% 62%',
        background: '270 22% 6%',
        surface: '270 18% 10%',
        foreground: '270 10% 95%'
      }
    }
  },
  {
    name: 'mocha',
    label: 'Mocha Café',
    description: 'Marrom aconchegante - quente e sofisticado',
    plan: 'pro',
    colors: {
      light: {
        primary: '28 55% 38%',
        secondary: '22 48% 45%',
        accent: '35 52% 42%',
        background: '28 18% 98%',
        surface: '0 0% 100%',
        foreground: '28 45% 12%'
      },
      dark: {
        primary: '28 50% 50%',
        secondary: '22 45% 55%',
        accent: '35 48% 52%',
        background: '28 28% 6%',
        surface: '28 22% 10%',
        foreground: '28 12% 95%'
      }
    }
  },
  {
    name: 'cherry',
    label: 'Cereja Intensa',
    description: 'Vermelho apaixonado - ousado e marcante',
    plan: 'pro',
    colors: {
      light: {
        primary: '355 78% 50%',
        secondary: '345 70% 55%',
        accent: '5 72% 52%',
        background: '355 18% 98%',
        surface: '0 0% 100%',
        foreground: '355 50% 10%'
      },
      dark: {
        primary: '355 72% 58%',
        secondary: '345 65% 62%',
        accent: '5 68% 58%',
        background: '355 28% 6%',
        surface: '355 22% 10%',
        foreground: '355 12% 95%'
      }
    }
  },

  // ╔══════════════════════════════════════════════════════════════════════════════╗
  // ║                        TEMAS BUSINESS (7 temas)                              ║
  // ║        Cores de luxo, metálicas, joias - Máxima sofisticação                 ║
  // ╚══════════════════════════════════════════════════════════════════════════════╝

  {
    name: 'gold',
    label: 'Ouro Imperial',
    description: 'Dourado luxuoso - prestígio e riqueza',
    plan: 'business',
    colors: {
      light: {
        primary: '45 90% 45%',
        secondary: '40 85% 48%',
        accent: '50 88% 42%',
        background: '45 25% 97%',
        surface: '0 0% 100%',
        foreground: '45 55% 10%'
      },
      dark: {
        primary: '45 85% 52%',
        secondary: '40 80% 55%',
        accent: '50 82% 50%',
        background: '45 35% 5%',
        surface: '45 28% 9%',
        foreground: '45 15% 95%'
      }
    }
  },
  {
    name: 'amethyst',
    label: 'Ametista Real',
    description: 'Roxo profundo místico - realeza e sabedoria',
    plan: 'business',
    colors: {
      light: {
        primary: '280 60% 48%',
        secondary: '290 52% 52%',
        accent: '270 55% 50%',
        background: '280 18% 97%',
        surface: '0 0% 100%',
        foreground: '280 50% 10%'
      },
      dark: {
        primary: '280 55% 58%',
        secondary: '290 48% 62%',
        accent: '270 50% 60%',
        background: '280 32% 5%',
        surface: '280 26% 9%',
        foreground: '280 12% 95%'
      }
    }
  },
  {
    name: 'obsidian',
    label: 'Obsidiana Negra',
    description: 'Preto absoluto premium - poder e mistério',
    plan: 'business',
    colors: {
      light: {
        primary: '0 0% 25%',
        secondary: '0 0% 32%',
        accent: '0 0% 40%',
        background: '0 0% 98%',
        surface: '0 0% 100%',
        foreground: '0 0% 8%'
      },
      dark: {
        primary: '0 0% 75%',
        secondary: '0 0% 68%',
        accent: '0 0% 60%',
        background: '0 0% 3%',
        surface: '0 0% 7%',
        foreground: '0 0% 95%'
      }
    }
  },
  {
    name: 'sapphire',
    label: 'Safira Nobreza',
    description: 'Azul royal intenso - sofisticação atemporal',
    plan: 'business',
    colors: {
      light: {
        primary: '220 80% 48%',
        secondary: '225 72% 52%',
        accent: '215 75% 50%',
        background: '220 22% 97%',
        surface: '0 0% 100%',
        foreground: '220 60% 10%'
      },
      dark: {
        primary: '220 75% 58%',
        secondary: '225 68% 62%',
        accent: '215 70% 58%',
        background: '220 38% 5%',
        surface: '220 30% 9%',
        foreground: '220 12% 95%'
      }
    }
  },
  {
    name: 'emerald',
    label: 'Esmeralda Joia',
    description: 'Verde esmeralda vibrante - luxo natural',
    plan: 'business',
    colors: {
      light: {
        primary: '152 70% 38%',
        secondary: '158 62% 42%',
        accent: '145 65% 40%',
        background: '152 20% 97%',
        surface: '0 0% 100%',
        foreground: '152 55% 10%'
      },
      dark: {
        primary: '152 65% 48%',
        secondary: '158 58% 52%',
        accent: '145 60% 50%',
        background: '152 35% 5%',
        surface: '152 28% 9%',
        foreground: '152 12% 95%'
      }
    }
  },
  {
    name: 'wine',
    label: 'Vinho Nobre',
    description: 'Bordô intenso - requinte e tradição',
    plan: 'business',
    colors: {
      light: {
        primary: '345 65% 40%',
        secondary: '350 58% 45%',
        accent: '340 60% 42%',
        background: '345 18% 97%',
        surface: '0 0% 100%',
        foreground: '345 50% 10%'
      },
      dark: {
        primary: '345 60% 52%',
        secondary: '350 54% 55%',
        accent: '340 56% 52%',
        background: '345 35% 5%',
        surface: '345 28% 9%',
        foreground: '345 12% 95%'
      }
    }
  },
  {
    name: 'platinum',
    label: 'Platina Premium',
    description: 'Prata metálico - exclusividade moderna',
    plan: 'business',
    colors: {
      light: {
        primary: '210 15% 50%',
        secondary: '200 12% 55%',
        accent: '220 18% 52%',
        background: '210 10% 98%',
        surface: '0 0% 100%',
        foreground: '210 18% 10%'
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
