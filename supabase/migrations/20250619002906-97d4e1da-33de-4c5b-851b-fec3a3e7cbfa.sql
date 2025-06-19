
-- Create the create_recurring_transactions function
CREATE OR REPLACE FUNCTION public.create_recurring_transactions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  rec RECORD;
  next_date DATE;
  end_date DATE;
BEGIN
  -- Loop through all active recurring transactions
  FOR rec IN 
    SELECT * FROM transactions 
    WHERE is_recurring = true 
    AND recurrence_pattern IS NOT NULL
  LOOP
    -- Calculate next occurrence date based on pattern
    CASE rec.recurrence_pattern
      WHEN 'weekly' THEN
        next_date := rec.date + INTERVAL '7 days';
      WHEN 'monthly' THEN
        next_date := rec.date + INTERVAL '1 month';
      WHEN 'yearly' THEN
        next_date := rec.date + INTERVAL '1 year';
      ELSE
        CONTINUE; -- Skip unknown patterns
    END CASE;
    
    -- Check if we should create the next occurrence
    -- Only create if the next date is today or earlier, and hasn't been created yet
    IF next_date <= CURRENT_DATE THEN
      -- Check if this occurrence already exists
      IF NOT EXISTS (
        SELECT 1 FROM transactions 
        WHERE user_id = rec.user_id 
        AND workspace_id = rec.workspace_id
        AND description = rec.description
        AND amount = rec.amount
        AND type = rec.type
        AND category = rec.category
        AND date = next_date
        AND is_recurring = false -- Only check non-recurring instances
      ) THEN
        -- Check if we haven't exceeded the end date (if set)
        end_date := rec.recurrence_end_date;
        IF end_date IS NULL OR next_date <= end_date THEN
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
            next_date,
            false -- This is an instance, not the recurring template
          );
          
          -- Update the original recurring transaction's date for next calculation
          UPDATE transactions 
          SET date = next_date 
          WHERE id = rec.id;
        END IF;
      END IF;
    END IF;
  END LOOP;
END;
$function$
