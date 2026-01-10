-- Criar tabela para armazenar histórico de conversas com o assistente IA
CREATE TABLE public.assistant_conversations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Nova conversa',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para armazenar mensagens das conversas
CREATE TABLE public.assistant_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.assistant_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX idx_assistant_conversations_user_id ON public.assistant_conversations(user_id);
CREATE INDEX idx_assistant_conversations_workspace_id ON public.assistant_conversations(workspace_id);
CREATE INDEX idx_assistant_messages_conversation_id ON public.assistant_messages(conversation_id);
CREATE INDEX idx_assistant_messages_user_id ON public.assistant_messages(user_id);

-- Habilitar RLS
ALTER TABLE public.assistant_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_messages ENABLE ROW LEVEL SECURITY;

-- Políticas para assistant_conversations
CREATE POLICY "Users can view their own conversations" 
ON public.assistant_conversations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations" 
ON public.assistant_conversations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" 
ON public.assistant_conversations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" 
ON public.assistant_conversations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas para assistant_messages
CREATE POLICY "Users can view their own messages" 
ON public.assistant_messages 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own messages" 
ON public.assistant_messages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages" 
ON public.assistant_messages 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at nas conversas
CREATE TRIGGER update_assistant_conversations_updated_at
BEFORE UPDATE ON public.assistant_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();