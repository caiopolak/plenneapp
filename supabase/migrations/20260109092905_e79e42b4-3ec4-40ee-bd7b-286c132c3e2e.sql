-- Criar módulo de teste
INSERT INTO public.learning_modules (id, title, description, category, level, published, content, created_at)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Fundamentos de Educação Financeira',
  'Aprenda os conceitos básicos de finanças pessoais: orçamento, poupança, investimentos e como alcançar a independência financeira. Este módulo é ideal para quem está começando sua jornada financeira.',
  'Finanças Pessoais',
  'iniciante',
  true,
  'Módulo introdutório completo sobre educação financeira',
  now()
);

-- Criar aulas do módulo
INSERT INTO public.education_lessons (id, module_id, title, description, content, video_url, duration_minutes, order_index, is_free, created_at)
VALUES 
(
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Introdução às Finanças Pessoais',
  'Entenda por que a educação financeira é fundamental para sua vida e como ela pode transformar seu futuro.',
  '# Bem-vindo ao Curso de Educação Financeira!

## O que você vai aprender

Neste módulo introdutório, vamos explorar os fundamentos que vão transformar sua relação com o dinheiro.

### Por que educação financeira é importante?

A educação financeira não é apenas sobre guardar dinheiro. É sobre:

- **Entender** como o dinheiro funciona
- **Planejar** seu futuro com segurança
- **Investir** de forma inteligente
- **Conquistar** liberdade financeira

### Os 4 Pilares das Finanças Pessoais

1. **Orçamento**: Saber exatamente para onde seu dinheiro vai
2. **Poupança**: Criar o hábito de guardar parte da sua renda
3. **Investimento**: Fazer seu dinheiro trabalhar para você
4. **Proteção**: Estar preparado para imprevistos

### Exercício Prático

Anote todos os seus gastos durante uma semana. Você vai se surpreender com o que vai descobrir!

> "O segredo para ter dinheiro é saber gastá-lo." - Benjamin Franklin',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  15,
  1,
  true,
  now()
),
(
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Criando seu Primeiro Orçamento',
  'Aprenda a criar um orçamento simples e eficiente usando a regra 50-30-20.',
  '# Como Criar um Orçamento que Funciona

## A Regra 50-30-20

Uma das formas mais simples de organizar suas finanças é usando a regra 50-30-20:

### 50% - Necessidades
- Moradia (aluguel, financiamento)
- Alimentação
- Transporte
- Contas básicas (água, luz, internet)
- Saúde

### 30% - Desejos
- Lazer e entretenimento
- Restaurantes
- Compras não essenciais
- Hobbies
- Viagens

### 20% - Poupança e Investimentos
- Reserva de emergência
- Investimentos
- Pagamento de dívidas
- Aposentadoria

## Como Começar

1. **Calcule sua renda líquida** (o que sobra após impostos)
2. **Liste suas despesas fixas** (as que não mudam)
3. **Acompanhe suas despesas variáveis** (use o Plenne!)
4. **Ajuste conforme necessário**

### Dica de Ouro 💡

Use o Plenne para categorizar automaticamente suas despesas e ver exatamente quanto está gastando em cada categoria!',
  null,
  20,
  2,
  false,
  now()
),
(
  'd4e5f6a7-b8c9-0123-def0-234567890123',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Reserva de Emergência: Seu Colchão Financeiro',
  'Descubra quanto guardar e onde investir sua reserva de emergência.',
  '# Reserva de Emergência

## O que é uma Reserva de Emergência?

É um valor guardado para cobrir imprevistos sem precisar se endividar.

### Quanto guardar?

A recomendação é ter entre **3 a 12 meses** de despesas mensais guardadas.

| Perfil | Meses de Reserva |
|--------|------------------|
| CLT estável | 3-6 meses |
| Autônomo | 6-12 meses |
| Empresário | 12+ meses |

### Onde guardar?

Sua reserva precisa ter:
- **Liquidez**: Poder resgatar rapidamente
- **Segurança**: Baixo risco de perder
- **Rentabilidade**: Pelo menos cobrir a inflação

**Melhores opções:**
1. Tesouro Selic
2. CDB com liquidez diária (100% CDI)
3. Conta remunerada de banco digital

### Como montar sua reserva

1. Calcule suas despesas mensais
2. Defina sua meta (ex: 6 meses = R$ 18.000)
3. Divida em parcelas mensais
4. Automatize a transferência

> Use a funcionalidade de **Metas** do Plenne para acompanhar sua reserva de emergência!',
  null,
  25,
  3,
  false,
  now()
);

-- Adicionar materiais complementares
INSERT INTO public.lesson_materials (lesson_id, title, description, file_url, file_type, order_index)
VALUES 
(
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'Planilha de Controle Financeiro',
  'Modelo de planilha para você começar a controlar suas finanças hoje mesmo.',
  'https://docs.google.com/spreadsheets/d/example',
  'document',
  1
),
(
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  'Guia da Regra 50-30-20',
  'PDF com exemplos práticos de como aplicar a regra 50-30-20 no seu dia a dia.',
  'https://example.com/guia-50-30-20.pdf',
  'pdf',
  1
);