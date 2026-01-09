
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';

const DEFAULT_EXPENSE_CATEGORIES = [
  'Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação',
  'Lazer', 'Vestuário', 'Tecnologia', 'Seguros', 'Compras', 'Contas', 'Outros'
];

const DEFAULT_INCOME_CATEGORIES = [
  'Salário', 'Freelance', 'Investimentos', 'Venda', 'Outros'
];

interface Category {
  id: string;
  name: string;
  type: string;
}

export function useCategories() {
  const { user } = useAuth();
  const { current } = useWorkspace();
  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    if (!user?.id || !current?.id) {
      setCustomCategories([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('transaction_categories')
        .select('*')
        .eq('user_id', user.id)
        .eq('workspace_id', current.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setCustomCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [user?.id, current?.id]);

  // Todas as categorias de despesa (padrão + personalizadas)
  const expenseCategories = useMemo(() => {
    const custom = customCategories
      .filter(c => c.type === 'expense')
      .map(c => c.name);
    
    // Combinar padrão com personalizadas, removendo duplicatas
    const all = [...new Set([...DEFAULT_EXPENSE_CATEGORIES, ...custom])];
    return all;
  }, [customCategories]);

  // Todas as categorias de receita (padrão + personalizadas)
  const incomeCategories = useMemo(() => {
    const custom = customCategories
      .filter(c => c.type === 'income')
      .map(c => c.name);
    
    const all = [...new Set([...DEFAULT_INCOME_CATEGORIES, ...custom])];
    return all;
  }, [customCategories]);

  // Função para obter categorias por tipo
  const getCategoriesByType = (type: 'income' | 'expense') => {
    return type === 'income' ? incomeCategories : expenseCategories;
  };

  return {
    expenseCategories,
    incomeCategories,
    customCategories,
    getCategoriesByType,
    loading,
    refetch: fetchCategories
  };
}
