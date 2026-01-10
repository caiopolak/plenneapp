import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  HelpCircle, 
  CreditCard, 
  Shield, 
  Users, 
  Zap, 
  MessageCircle,
  Crown,
  Building2,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const faqCategories = [
  {
    id: 'geral',
    title: 'Perguntas Gerais',
    icon: HelpCircle,
    questions: [
      {
        q: 'O que é o Plenne?',
        a: 'O Plenne é uma plataforma completa de gestão financeira pessoal. Com ele, você pode controlar transações, definir metas, acompanhar investimentos, criar orçamentos e aprender educação financeira - tudo em um só lugar, com assistente IA integrado.'
      },
      {
        q: 'O Plenne é gratuito?',
        a: 'Sim! O Plenne oferece um plano gratuito com funcionalidades essenciais: até 100 transações/mês, 3 metas financeiras, 5 investimentos, dashboard completo e 5 perguntas/mês ao assistente IA. Para recursos avançados, oferecemos planos Pro e Business.'
      },
      {
        q: 'Posso usar o Plenne no celular?',
        a: 'Sim! O Plenne é totalmente responsivo e funciona perfeitamente em qualquer dispositivo: celular, tablet ou computador. Basta acessar pelo navegador.'
      },
      {
        q: 'Meus dados estão seguros?',
        a: 'Absolutamente! Utilizamos criptografia de ponta a ponta, autenticação segura com Supabase e seguimos as melhores práticas de segurança da indústria. Seus dados financeiros são 100% privados e protegidos.'
      }
    ]
  },
  {
    id: 'planos',
    title: 'Planos e Preços',
    icon: CreditCard,
    questions: [
      {
        q: 'Quais são as diferenças entre os planos?',
        a: 'Free: 100 transações/mês, 3 metas, 5 investimentos, 5 perguntas IA/mês e 5 temas básicos.\n\nPro (R$19,90/mês): 500 transações, 15 metas, 25 investimentos, 50 perguntas IA, 8 temas Pro, exportação PDF/CSV e agendamento de transações.\n\nBusiness (R$49,90/mês): Tudo ilimitado, até 10 workspaces, 10 membros por workspace, 7 temas premium exclusivos e suporte dedicado por WhatsApp.'
      },
      {
        q: 'Posso experimentar o plano Pro gratuitamente?',
        a: 'Sim! Novos usuários podem ativar um trial gratuito de 7 dias do plano Pro. Durante o trial, você terá acesso a todas as funcionalidades Pro sem custo. Ao final, você pode assinar ou voltar automaticamente para o plano gratuito.'
      },
      {
        q: 'Como funciona a cobrança?',
        a: 'A cobrança é mensal e processada pelo Stripe, a plataforma de pagamentos mais segura do mundo. Você pode cancelar a qualquer momento pelo portal do cliente.'
      },
      {
        q: 'Posso fazer upgrade ou downgrade a qualquer momento?',
        a: 'Sim! Você pode alterar seu plano a qualquer momento. Ao fazer upgrade, você ganha acesso imediato às novas funcionalidades. Ao fazer downgrade, as alterações entram em vigor no próximo ciclo de cobrança.'
      }
    ]
  },
  {
    id: 'funcionalidades',
    title: 'Funcionalidades',
    icon: Zap,
    questions: [
      {
        q: 'O que é o Assistente IA?',
        a: 'Nosso Assistente IA é alimentado pelo Google Gemini e pode responder suas dúvidas financeiras, analisar seus gastos, sugerir estratégias de economia e muito mais. É como ter um consultor financeiro disponível 24/7!'
      },
      {
        q: 'O que são Workspaces?',
        a: 'Workspaces são ambientes separados para organizar diferentes contextos financeiros. Por exemplo: um workspace pessoal, um familiar e um empresarial. Cada workspace tem seus próprios dados, transações, metas e membros.'
      },
      {
        q: 'Posso compartilhar um workspace com minha família?',
        a: 'Sim! Nos planos Pro e Business, você pode convidar membros para seus workspaces. No Pro, até 3 membros por workspace. No Business, até 10 membros. Ideal para gestão financeira em família ou equipe.'
      },
      {
        q: 'Como funcionam as transações recorrentes?',
        a: 'No plano Pro e Business, você pode configurar transações que se repetem automaticamente (mensal, semanal, anual). Ideal para salários, aluguéis, assinaturas e outras despesas fixas.'
      },
      {
        q: 'Posso exportar meus dados?',
        a: 'Sim! Nos planos Pro e Business, você pode exportar relatórios em PDF e dados em CSV. No plano gratuito, você pode visualizar todos os dados no dashboard, mas a exportação é limitada.'
      }
    ]
  },
  {
    id: 'workspaces',
    title: 'Workspaces e Colaboração',
    icon: Users,
    questions: [
      {
        q: 'O que acontece quando alguém é convidado para meu workspace?',
        a: 'A pessoa receberá um email de convite. Após aceitar, ela terá acesso aos dados do workspace conforme as permissões definidas. Todos os membros compartilham as mesmas transações, metas e investimentos daquele workspace.'
      },
      {
        q: 'Posso ter workspaces diferentes para pessoal e trabalho?',
        a: 'Sim! Essa é justamente a ideia dos workspaces. No plano Pro você pode ter até 3 workspaces, e no Business até 10. Cada um com dados completamente separados.'
      },
      {
        q: 'Os dados de um workspace podem ser vistos em outro?',
        a: 'Não. Cada workspace é completamente isolado. Suas transações pessoais não se misturam com as do trabalho ou da família. Ao trocar de workspace, você vê apenas os dados daquele contexto específico.'
      }
    ]
  },
  {
    id: 'suporte',
    title: 'Suporte e Ajuda',
    icon: MessageCircle,
    questions: [
      {
        q: 'Como entro em contato com o suporte?',
        a: 'Plano Free: Email com resposta em até 48h.\nPlano Pro: Suporte prioritário com resposta em até 24h.\nPlano Business: Canal dedicado no WhatsApp com resposta em até 12h.'
      },
      {
        q: 'O Plenne tem tutoriais?',
        a: 'Sim! Na seção de Educação Financeira, você encontra módulos interativos que ensinam a usar todas as funcionalidades do app, além de conteúdos sobre finanças pessoais, investimentos e planejamento.'
      },
      {
        q: 'Encontrei um bug. O que faço?',
        a: 'Entre em contato pelo suporte (email ou WhatsApp, dependendo do seu plano) descrevendo o problema. Nossa equipe analisará e corrigirá o mais rápido possível. Agradecemos seu feedback!'
      }
    ]
  },
  {
    id: 'seguranca',
    title: 'Segurança e Privacidade',
    icon: Shield,
    questions: [
      {
        q: 'Vocês vendem meus dados?',
        a: 'Jamais! Seus dados são 100% privados e nunca são compartilhados com terceiros para fins comerciais. Utilizamos apenas para fornecer o serviço e melhorar sua experiência.'
      },
      {
        q: 'Posso excluir minha conta e dados?',
        a: 'Sim! Você pode solicitar a exclusão completa da sua conta e todos os dados associados a qualquer momento nas configurações do perfil. O processo é irreversível e segue a LGPD.'
      },
      {
        q: 'Como protegem meus dados bancários?',
        a: 'O Plenne não armazena dados bancários sensíveis como senhas ou números de cartão. Todas as transações de pagamento são processadas pelo Stripe, uma das plataformas mais seguras do mundo. Seus dados financeiros no app são apenas registros que você mesmo insere.'
      }
    ]
  }
];

export default function FAQPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge variant="outline" className="text-xs px-3 py-1">
          Central de Ajuda
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight brand-gradient-text">
          Perguntas Frequentes
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Encontre respostas para as dúvidas mais comuns sobre o Plenne, planos, funcionalidades e segurança.
        </p>
      </div>

      {/* Quick Links */}
      <div className="flex flex-wrap justify-center gap-2">
        {faqCategories.map((cat) => (
          <Button
            key={cat.id}
            variant="outline"
            size="sm"
            onClick={() => document.getElementById(cat.id)?.scrollIntoView({ behavior: 'smooth' })}
            className="gap-2"
          >
            <cat.icon className="h-4 w-4" />
            {cat.title}
          </Button>
        ))}
      </div>

      {/* FAQ Categories */}
      <div className="space-y-8">
        {faqCategories.map((category) => (
          <Card key={category.id} id={category.id} className="scroll-mt-20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <category.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>{category.title}</CardTitle>
                  <CardDescription>{category.questions.length} perguntas</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {category.questions.map((item, index) => (
                  <AccordionItem key={index} value={`${category.id}-${index}`}>
                    <AccordionTrigger className="text-left hover:text-primary">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground whitespace-pre-line">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="flex flex-col items-center text-center py-8 gap-4">
            <Crown className="h-10 w-10 text-primary" />
            <div>
              <h3 className="text-lg font-semibold">Quer mais recursos?</h3>
              <p className="text-sm text-muted-foreground">
                Experimente o plano Pro grátis por 7 dias e desbloqueie todo o potencial do Plenne.
              </p>
            </div>
            <Button onClick={() => navigate('/app/plans')} className="bg-gradient-to-r from-primary to-secondary">
              Ver Planos
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/20">
          <CardContent className="flex flex-col items-center text-center py-8 gap-4">
            <MessageCircle className="h-10 w-10 text-amber-500" />
            <div>
              <h3 className="text-lg font-semibold">Ainda tem dúvidas?</h3>
              <p className="text-sm text-muted-foreground">
                Nossa equipe está pronta para ajudar. Entre em contato pelo canal do seu plano.
              </p>
            </div>
            <Button variant="outline" className="border-amber-500/50 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10">
              Falar com Suporte
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}