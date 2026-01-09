-- Corrigir função de processamento de transações recorrentes
-- A função agora processa corretamente transações recorrentes agendadas para datas futuras

CREATE OR REPLACE FUNCTION public.create_recurring_transactions()
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  rec RECORD;
  current_date_val DATE := CURRENT_DATE;
  next_date DATE;
  end_date DATE;
  instance_date DATE;
BEGIN
  -- Loop through all active recurring transactions
  FOR rec IN 
    SELECT * FROM transactions 
    WHERE is_recurring = true 
    AND recurrence_pattern IS NOT NULL
  LOOP
    -- A data atual da transação recorrente é o ponto de partida
    instance_date := rec.date;
    end_date := rec.recurrence_end_date;
    
    -- Verificar se a data da transação template já passou ou é hoje
    -- Se sim, criar instâncias faltantes até hoje
    WHILE instance_date <= current_date_val LOOP
      -- Check if we haven't exceeded the end date (if set)
      IF end_date IS NOT NULL AND instance_date > end_date THEN
        EXIT;
      END IF;
      
      -- Check if this occurrence already exists
      IF NOT EXISTS (
        SELECT 1 FROM transactions 
        WHERE user_id = rec.user_id 
        AND workspace_id = rec.workspace_id
        AND description = rec.description
        AND amount = rec.amount
        AND type = rec.type
        AND category = rec.category
        AND date = instance_date
        AND is_recurring = false -- Only check non-recurring instances
      ) THEN
        -- Create the new transaction instance
        INSERT INTO transactions (
          user_id,
          workspace_id,
          description,
          amount,
          type,
          category,
          date,
          is_recurring
        ) VALUES (
          rec.user_id,
          rec.workspace_id,
          rec.description,
          rec.amount,
          rec.type,
          rec.category,
          instance_date,
          false -- This is an instance, not the recurring template
        );
      END IF;
      
      -- Calculate next occurrence date based on pattern
      CASE rec.recurrence_pattern
        WHEN 'weekly' THEN
          instance_date := instance_date + INTERVAL '7 days';
        WHEN 'monthly' THEN
          instance_date := instance_date + INTERVAL '1 month';
        WHEN 'yearly' THEN
          instance_date := instance_date + INTERVAL '1 year';
        ELSE
          EXIT; -- Skip unknown patterns
      END CASE;
    END LOOP;
    
    -- Update the original recurring transaction's date to the last processed + 1 interval
    -- This prevents reprocessing and marks the next expected date
    IF instance_date > rec.date THEN
      UPDATE transactions 
      SET date = instance_date 
      WHERE id = rec.id;
    END IF;
  END LOOP;
END;
$$;