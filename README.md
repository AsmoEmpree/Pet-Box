# 🚀 Projeto Next.js 15 - Netlify + Neon + FuriaPay

Template moderno de Next.js 15 com integração completa de pagamentos FuriaPay, banco de dados Neon (PostgreSQL) e deploy no Netlify.

## 📋 Stack Tecnológica

- **Framework:** Next.js 15 (App Router)
- **UI:** React 19 + Tailwind CSS v4
- **Componentes:** Shadcn/ui + Radix UI
- **Banco de Dados:** Neon (PostgreSQL Serverless)
- **Pagamentos:** FuriaPay (PIX, Cartão, Boleto)
- **Deploy:** Netlify
- **TypeScript:** Totalmente tipado

## 🎯 Funcionalidades

- ✅ Sistema de pagamentos completo (PIX, Cartão, Boleto)
- ✅ Banco de dados PostgreSQL serverless
- ✅ Webhooks automáticos de pagamento
- ✅ Interface moderna e responsiva
- ✅ Dark mode nativo
- ✅ Componentes UI prontos (Shadcn)
- ✅ Validação de formulários (Zod + React Hook Form)
- ✅ Ícones (Lucide React)
- ✅ Deploy otimizado para Netlify

## 🚀 Início Rápido

### 1. Clonar e Instalar

```bash
# Clonar repositório
git clone <seu-repositorio>
cd <nome-do-projeto>

# Instalar dependências
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```env
# Neon Database
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# FuriaPay
NEXT_PUBLIC_FURIA_PUBLIC_KEY="pk_live_sua_chave_aqui"
FURIA_SECRET_KEY="sk_live_sua_chave_aqui"
FURIA_ENVIRONMENT="production"
FURIA_WEBHOOK_URL="https://seu-site.netlify.app/api/webhook/furia"

# Next.js
NEXTAUTH_URL="https://seu-site.netlify.app"
NEXTAUTH_SECRET="sua_chave_secreta_aleatoria"
```

### 3. Executar Localmente

```bash
# Modo desenvolvimento
npm run dev

# Build de produção
npm run build

# Executar produção
npm start
```

Acesse: [http://localhost:3000](http://localhost:3000)

## 📦 Configuração de Serviços

### Neon Database (PostgreSQL)

1. Crie uma conta em [neon.tech](https://neon.tech)
2. Crie um novo projeto
3. Copie a **Connection String**
4. Adicione em `DATABASE_URL` no `.env.local`

**Executar Migrações:**
```bash
# Via código (recomendado)
# As migrações rodam automaticamente no primeiro acesso
```

Veja mais detalhes em: [NEONDB_NETLIFY_SETUP.md](./NEONDB_NETLIFY_SETUP.md)

### FuriaPay (Pagamentos)

1. Crie uma conta em [furiapaybr.com](https://furiapaybr.com)
2. Obtenha suas chaves de API no dashboard
3. Configure o webhook: `https://seu-site.netlify.app/api/webhook/furia`
4. Adicione as chaves no `.env.local`

Veja mais detalhes em: [PAGAMENTO_SETUP.md](./PAGAMENTO_SETUP.md)

### Netlify (Deploy)

1. Conecte seu repositório no [Netlify](https://app.netlify.com)
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

Veja mais detalhes em: [CONFIGURACAO_PRODUCAO.md](./CONFIGURACAO_PRODUCAO.md)

## 📁 Estrutura do Projeto

```
├── src/
│   ├── app/                    # App Router (Next.js 15)
│   │   ├── api/               # API Routes
│   │   │   ├── process-payment/  # Processar pagamentos
│   │   │   └── webhook/          # Webhooks FuriaPay
│   │   ├── page.tsx           # Página principal
│   │   └── layout.tsx         # Layout global
│   ├── components/            # Componentes React
│   │   ├── ui/               # Componentes Shadcn
│   │   └── custom/           # Componentes customizados
│   └── lib/                   # Utilitários
│       ├── neondb.ts         # Cliente Neon Database
│       ├── migrations.ts     # Migrações do banco
│       └── furiaPayConfig.ts # Config FuriaPay
├── public/                    # Arquivos estáticos
├── .env.local                # Variáveis de ambiente (não commitar!)
├── netlify.toml              # Config Netlify
├── next.config.ts            # Config Next.js
└── package.json              # Dependências
```

## 🗄️ Banco de Dados

### Tabelas Disponíveis

- **users** - Usuários do sistema
- **products** - Produtos/serviços
- **orders** - Pedidos
- **order_items** - Itens dos pedidos
- **accounts** - Contas (para transações)

### Exemplo de Uso

```typescript
import { getUsers, createUser } from '@/lib/neondb';

// Buscar usuários
const users = await getUsers();

// Criar usuário
const newUser = await createUser('João Silva', 'joao@example.com');
```

## 💳 Sistema de Pagamentos

### Métodos Disponíveis

- **PIX** - Pagamento instantâneo
- **Cartão de Crédito** - Parcelado até 12x
- **Boleto** - Pagamento bancário

### Exemplo de Uso

```typescript
// Processar pagamento
const response = await fetch('/api/process-payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 9990, // R$ 99,90 em centavos
    paymentMethod: 'pix',
    customer: {
      name: 'João Silva',
      email: 'joao@example.com',
      phone: '11999999999'
    }
  })
});

const data = await response.json();
console.log(data.transactionId);
```

## 🔒 Segurança

- ✅ Headers de segurança configurados
- ✅ SSL/TLS automático (Netlify)
- ✅ Variáveis de ambiente criptografadas
- ✅ Validação de dados com Zod
- ✅ Proteção contra SQL Injection (Neon)
- ✅ Webhook signature validation

## 📊 Monitoramento

### Logs no Netlify

```bash
# Ver logs em tempo real
netlify logs

# Ou no painel: Deploys > Function logs
```

### Logs de Pagamento

Todos os eventos de pagamento são logados:
- `PAYMENT_PROCESSED_SUCCESS` - Pagamento aprovado
- `WEBHOOK_RECEIVED` - Webhook recebido
- Erros detalhados com stack trace

## 🚨 Troubleshooting

### Build Falha

```bash
# Limpar cache
rm -rf node_modules package-lock.json .next
npm install
npm run build
```

### Banco de Dados Não Conecta

1. Verifique se `DATABASE_URL` está configurada
2. Teste a conexão:
```typescript
import { testConnection } from '@/lib/neondb';
await testConnection();
```

### Webhook Não Funciona

1. Verifique URL no dashboard FuriaPay
2. Teste manualmente:
```bash
curl -X POST https://seu-site.netlify.app/api/webhook/furia \
  -H "Content-Type: application/json" \
  -d '{"event":"transaction.paid","transaction":{"id":"test"}}'
```

## 📚 Documentação

- [Configuração de Produção](./CONFIGURACAO_PRODUCAO.md)
- [Setup Neon + Netlify](./NEONDB_NETLIFY_SETUP.md)
- [Setup FuriaPay](./PAGAMENTO_SETUP.md)

## 🤝 Suporte

- **Netlify:** [docs.netlify.com](https://docs.netlify.com)
- **Neon:** [neon.tech/docs](https://neon.tech/docs)
- **FuriaPay:** [docs.furiapaybr.com](https://docs.furiapaybr.com)
- **Next.js:** [nextjs.org/docs](https://nextjs.org/docs)

## 📝 Licença

MIT License - veja [LICENSE](./LICENSE) para mais detalhes.

---

**Desenvolvido com ❤️ usando Next.js 15 + Netlify + Neon + FuriaPay**
