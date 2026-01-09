-- Adicionar usuário como admin
INSERT INTO public.user_roles (user_id, role) 
VALUES ('07343a79-9e65-4788-9918-0f9216099933', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;