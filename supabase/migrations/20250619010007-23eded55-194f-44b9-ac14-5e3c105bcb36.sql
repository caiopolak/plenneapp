
-- Create the incoming_transactions table
CREATE TABLE public.incoming_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workspace_id UUID,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  expected_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE public.incoming_transactions
ADD CONSTRAINT fk_incoming_transactions_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE public.incoming_transactions
ADD CONSTRAINT fk_incoming_transactions_workspace_id 
FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE public.incoming_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own incoming transactions"
ON public.incoming_transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own incoming transactions"
ON public.incoming_transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own incoming transactions"
ON public.incoming_transactions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own incoming transactions"
ON public.incoming_transactions FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_incoming_transactions_user_id ON public.incoming_transactions(user_id);
CREATE INDEX idx_incoming_transactions_workspace_id ON public.incoming_transactions(workspace_id);
CREATE INDEX idx_incoming_transactions_expected_date ON public.incoming_transactions(expected_date);
CREATE INDEX idx_incoming_transactions_status ON public.incoming_transactions(status);
