# Admin Refactoring Plan: Prisma → Drizzle ORM + Admin Dinâmico

## Estrutura de Pastas Proposta

```
apps/admin/
├── drizzle.config.ts              # Configuração do Drizzle Kit
├── db/
│   ├── index.ts                   # Cliente de conexão (singleton, pg pool)
│   ├── schema/                    # Schemas modulares (1 arquivo por domínio)
│   │   ├── enums.ts               # Todos os pgEnum compartilhados
│   │   ├── users.ts               # User, Balance, UserLog, UserActivity, KYC
│   │   ├── admin.ts               # Admin
│   │   ├── finance.ts             # Deposit, Withdrawal, CreditCard
│   │   ├── trading.ts             # TradeOperation
│   │   ├── config.ts              # Config, Gateways
│   │   ├── affiliate.ts           # Affiliate, AffiliateCommission, ClickEvent, PixelEvent
│   │   ├── integrations.ts        # PostbackConfig, PostbackLog, WebhookConfig, WebhookLog
│   │   ├── audit.ts               # AuditLog
│   │   └── index.ts               # Re-exporta tudo (barrel)
│   └── queries/                   # DAL — Data Access Layer (funções encapsuladas)
│       ├── admins.ts              # getAdmins, getAdminById, createAdmin, updateAdmin, deleteAdmin
│       ├── clients.ts             # getClients, getClientById, searchClients, clientOverview
│       ├── withdrawals.ts         # getWithdrawals, approveWithdrawal, rejectWithdrawal
│       ├── deposits.ts            # getDeposits, depositStats
│       ├── config.ts              # getConfig, updateConfig
│       ├── gateways.ts            # getGateways, createGateway, updateGateway, deleteGateway
│       ├── audit.ts               # getAuditLogs
│       ├── dashboard.ts           # getDashboardStats (query otimizada, sem N+1)
│       └── index.ts               # Barrel
├── actions/                       # Server Actions para mutações
│   ├── admin.actions.ts
│   ├── client.actions.ts
│   ├── withdrawal.actions.ts
│   ├── config.actions.ts
│   └── gateway.actions.ts
├── app/
│   ├── [lang]/
│   │   ├── layout.tsx
│   │   ├── page.tsx               # Login
│   │   └── dashboard/
│   │       ├── layout.tsx         # Layout com Sidebar + Header
│   │       ├── page.tsx           # Dashboard (RSC com Suspense)
│   │       ├── admins/page.tsx    # RSC → DataTable genérico
│   │       ├── clients/page.tsx
│   │       ├── withdrawals/page.tsx
│   │       ├── transactions/page.tsx
│   │       ├── audit/page.tsx
│   │       ├── settings/page.tsx
│   │       ├── profile/page.tsx
│   │       └── security/page.tsx
│   └── api/                       # Mantém API routes para auth e ações que precisam de cookies
│       ├── auth/
│       │   ├── login/route.ts
│       │   └── logout/route.ts
│       └── admin/                 # Simplificados — delegam para DAL
│           ├── route.ts
│           ├── [id]/route.ts
│           ├── general/route.ts
│           ├── config/route.ts
│           ├── logo/route.ts
│           ├── clients/...
│           ├── withdrawals/...
│           ├── gateways/...
│           ├── transactions/route.ts
│           ├── finance/route.ts
│           └── audit/route.ts
├── components/
│   ├── ui/                        # Shadcn/UI (mantém)
│   ├── data-table/                # CRUD Dinâmico genérico
│   │   ├── data-table.tsx         # Tabela genérica com sort, filter, pagination
│   │   ├── data-table-toolbar.tsx # Barra de busca + filtros
│   │   ├── data-table-pagination.tsx
│   │   ├── column-header.tsx
│   │   └── types.ts               # ColumnConfig, TableConfig
│   ├── dynamic-form/              # Form genérico baseado em schema
│   │   ├── dynamic-form.tsx       # Renderiza campos com base em config
│   │   └── field-renderers.tsx    # Input, Select, DatePicker, etc.
│   ├── stats-card.tsx             # Card de KPI reutilizável
│   ├── auth-provider.tsx
│   ├── login-form.tsx
│   ├── theme-provider.tsx
│   ├── dashboard-header.tsx
│   ├── dashboard-sidebar.tsx
│   └── dashboard/                 # Componentes específicos de página
│       ├── financial-overview.tsx
│       └── ...
├── lib/
│   ├── utils.ts
│   ├── auth.ts                    # decodeJwt, requireAdmin (helper compartilhado)
│   └── errors/
└── (remove) repositories/         # Substituído por db/queries/
    (remove) lib/prisma.ts         # Substituído por db/index.ts
```

## Fases de Implementação

### FASE 1 — Infraestrutura Drizzle
1. Instalar dependências: `drizzle-orm`, `postgres` (driver), `drizzle-kit`
2. Criar `db/index.ts` — pool de conexão PostgreSQL singleton
3. Criar `drizzle.config.ts`
4. Criar todos os schemas em `db/schema/` espelhando o Prisma schema

### FASE 2 — DAL (Data Access Layer)
5. Criar `db/queries/` com funções tipadas que encapsulam as queries Drizzle
6. Cada função usa `select` específico (sem `select *`)
7. Queries de dashboard otimizadas (1 query ao invés de N+1)
8. Criar `lib/auth.ts` com helper de autenticação compartilhado

### FASE 3 — API Routes Migration
9. Migrar cada API route para usar DAL ao invés de Prisma direto
10. Remover `lib/prisma.ts` e `repositories/`
11. Remover dependências `@prisma/client` e `prisma` do package.json

### FASE 4 — Componentes Genéricos (CRUD Dinâmico)
12. Criar `DataTable` genérico com configuração de colunas
13. Criar `DynamicForm` genérico
14. Criar `StatsCard` reutilizável
15. Refatorar páginas do dashboard para usar componentes genéricos

### FASE 5 — Performance (Suspense + Streaming)
16. Converter páginas do dashboard para RSC com Suspense
17. Streaming de listas pesadas
