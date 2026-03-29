# Muniz Platform

Plataforma de trading de opcoes binarias com tres aplicacoes integradas: **Trading**, **Admin** e **Afiliados**. Todas compartilham um unico banco PostgreSQL e sao orquestradas via Docker Compose com Caddy como reverse proxy (SSL automatico via Let's Encrypt).

---

## Arquitetura

```
                         Internet
                            |
                      +-----------+
                      |   Caddy   |  :80 / :443 (auto-SSL)
                      +-----------+
                       /    |     \
                      /     |      \
               +--------+ +-------+ +-----------+
               |Trading | | Admin | | Afiliados |
               | :3000  | | :1313 | |   :3000   |
               +--------+ +-------+ +-----------+
                      \     |      /
                       \    |     /
                      +-----------+
                      |PostgreSQL |  :5432
                      |    16     |
                      +-----------+
```

| Servico    | Descricao                                      | Porta interna |
|------------|-------------------------------------------------|---------------|
| `trading`  | App principal — trading, depositos, saques, KYC | 3000          |
| `admin`    | Painel administrativo — gestao da plataforma     | 1313          |
| `afiliados`| Portal de afiliados — comissoes e tracking       | 3000          |
| `db`       | PostgreSQL 16 Alpine                             | 5432          |
| `caddy`    | Reverse proxy com auto-SSL                       | 80, 443       |

---

## Tech Stack

| Camada         | Tecnologia                                         |
|----------------|----------------------------------------------------|
| Framework      | Next.js 15 (App Router) + React 19 + TypeScript 5  |
| ORM (Trading)  | Prisma 6 (migrations, seed, transactions)           |
| ORM (Admin/Af) | Drizzle ORM 0.45                                   |
| Banco          | PostgreSQL 16                                       |
| Auth (Trading) | NextAuth 5 (Credentials + Google OAuth)             |
| Auth (Admin/Af)| JWT customizado (jose)                              |
| Estado (client)| Zustand 5 com persist middleware                    |
| UI             | Radix UI + Tailwind CSS 3 + Framer Motion           |
| Graficos       | amCharts 5 (candlesticks) + Recharts (dashboards)   |
| Market Data    | Tiingo API (forex + crypto) + Binance (crypto)      |
| Infra          | Docker Compose + Caddy 2 (auto Let's Encrypt)       |
| i18n           | next-intl (pt, en, es)                              |

---

## Quick Start

### 1. Bootstrap automatico (recomendado)

```bash
git clone <repo-url> && cd iqClone

# Gera .env com senhas aleatorias e sobe todos os servicos
./scripts/docker-up.sh
```

O script:
- Gera usuario/senha aleatoria pro banco
- Gera JWT secret aleatorio
- Gera senha do admin aleatorio
- Cria o `.env`
- Roda `docker compose up -d --build`

### 2. Setup manual

```bash
# Copiar template de variaveis
cp .env.example .env

# Editar com seus valores
nano .env

# Subir todos os servicos
docker compose up -d --build
```

### 3. Verificar se subiu

```bash
# Logs do trading (mostra migrations + seed)
docker compose logs -f trading

# Status dos containers
docker compose ps
```

Quando o trading estiver healthy, as 3 aplicacoes estarao disponiveis:

| App        | URL (local)                    | URL (producao exemplo)          |
|------------|--------------------------------|----------------------------------|
| Trading    | https://app.localhost          | https://seudominio.com           |
| Admin      | https://admin.localhost        | https://admin.seudominio.com     |
| Afiliados  | https://afiliados.localhost    | https://afiliados.seudominio.com |

---

## Variaveis de Ambiente

Configuradas no `.env` na raiz do projeto:

```bash
# ---------- Banco ----------
DB_USER=muniz_app              # Usuario PostgreSQL
DB_PASSWORD=troque-esta-senha  # Senha PostgreSQL
DB_NAME=muniz_platform         # Nome do banco

# ---------- Dominios (Caddy auto-SSL) ----------
TRADING_DOMAIN=app.localhost
AFILIADOS_DOMAIN=afiliados.localhost
ADMIN_DOMAIN=admin.localhost

# ---------- Branding ----------
SITE_DOMAIN=localhost           # Usado para gerar email do admin: admin@<SITE_DOMAIN>
SITE_NAME="Muniz Platform"     # Nome exibido na plataforma

# ---------- Admin ----------
ADMIN_PASSWORD=TroqueEstaSenha123  # Senha do SUPER_ADMIN auto-criado

# ---------- Market Data ----------
TIINGO_API_KEY=                 # Chave da API Tiingo (https://www.tiingo.com/)

# ---------- Auth ----------
JWT_SECRET_KEY=gere-uma-chave   # Segredo JWT (admin + afiliados)
```

> O script `docker-up.sh` gera todos os valores automaticamente. Para producao, aponte os dominios para o IP do servidor e o Caddy provisiona os certificados SSL sozinho.

---

## Estrutura do Projeto

```
iqClone/
├── docker-compose.yml          # Orquestracao dos 5 servicos
├── Caddyfile                   # Config do reverse proxy
├── .env.example                # Template de variaveis
├── scripts/
│   └── docker-up.sh            # Bootstrap automatico
├── shared/                     # Codigo compartilhado entre apps
│   ├── auth/                   # JWT utils, session parsing
│   ├── affiliate/              # Calculo de comissoes
│   └── platform/               # Branding, moeda, cores, icones
├── trading/                    # App principal de trading
│   ├── app/
│   │   ├── [locale]/           # Rotas com i18n (pt/en/es)
│   │   │   └── trading/        # Pagina principal de trading
│   │   └── api/                # API routes
│   │       ├── account/        # Saldo, deposito, saque, KYC, operacoes
│   │       ├── auth/           # Login, registro, recuperacao de senha
│   │       ├── market/         # Precos, candles, snapshots
│   │       └── ...
│   ├── components/             # Componentes React
│   ├── hooks/                  # Custom hooks (polling, sync, settlement)
│   ├── lib/
│   │   ├── services/           # Logica de negocio (trade, balance, settlement)
│   │   ├── server/             # Market data, registry de providers
│   │   ├── config/             # Configuracao dinamica do site
│   │   └── gateways/           # Integracao com gateways de pagamento
│   ├── repositories/           # Data access layer (Prisma)
│   ├── store/                  # Zustand stores
│   ├── prisma/
│   │   ├── schema.prisma       # Schema completo do banco
│   │   ├── migrations/         # Migracoes incrementais
│   │   └── seed.js             # Seed inicial (admin, config, pares)
│   └── messages/               # Traducoes (pt.json, en.json, es.json)
├── admin/                      # Painel administrativo
│   ├── app/
│   │   ├── [lang]/             # Rotas com i18n
│   │   └── api/admin/          # API routes do admin
│   └── db/
│       ├── schema/             # Schema Drizzle ORM
│       └── queries/            # Queries tipadas
└── afiliados/                  # Portal de afiliados
    ├── app/
    │   ├── [lang]/             # Rotas com i18n
    │   └── api/                # API routes de afiliados
    └── db/
        └── schema/             # Schema Drizzle ORM
```

---

## Trading App — Detalhes

### Funcionalidades

- **Opcoes binarias**: Call/Put com expiracoes de 1m a 24h
- **Pares de trading**: 20+ Forex (EURUSD, GBPJPY...) + 50+ Crypto (BTCUSDT, ETHUSDT...)
- **Conta demo**: Saldo virtual de $10.000 para praticar (resetavel)
- **Conta real**: Depositos via PIX, cartao de credito ou crypto
- **Graficos em tempo real**: Candlesticks (amCharts 5) com multiplos timeframes
- **Settlement automatico**: Worker server-side resolve operacoes na expiracao
- **KYC**: Verificacao de documentos (CNH, RG, Passaporte)
- **Saques**: Solicitacao via PIX ou crypto com taxa configuravel
- **Promocoes**: Bonus de deposito e multiplicadores de receita
- **Afiliados**: Tracking de referral via cookie + postbacks

### Fluxo de uma Ordem

```
1. Usuario clica Call/Put no TradingPanel
2. POST /api/account/operations/create
3. tradeService.createOperation() em transacao atomica:
   a. Debita saldo do usuario
   b. Cria TradeOperation (resultado: "pendente")
   c. Cria OperationSettlementJob (schedulado para expiresAt)
4. useActiveOperations poll a cada 5s -> mostra operacao ativa no UI
5. Na expiracao, settlement-worker.ts:
   a. Busca jobs vencidos
   b. Claim via updateMany (evita race condition)
   c. Busca preco de fechamento
   d. Resolve resultado (ganho/perda)
   e. tradeService.resolveOperation() em transacao atomica:
      - updateMany WHERE resultado='pendente' (protecao contra dupla liquidacao)
      - Se ganho: credita saldo
6. useActiveOperations detecta settlement -> atualiza UI + sync saldo
```

### Protecoes de Consistencia

- **Race condition**: Todas as operacoes de settlement usam `updateMany WHERE resultado='pendente'` dentro de transacoes Prisma — impossivel creditar saldo duas vezes
- **Sell vs Settlement**: Mesma protecao atomica — quem chegar primeiro resolve, o segundo recebe null/409
- **Fallback**: Se preco de fechamento nao for obtido, operacao e forcada como perda (nunca adivinha)
- **Saldo**: Debito e feito na abertura da ordem; credito so ocorre dentro da transacao de settlement

### APIs Principais

| Metodo | Rota                                | Descricao                          |
|--------|-------------------------------------|------------------------------------|
| POST   | `/api/auth/register`                | Registro de usuario                |
| POST   | `/api/auth/[...nextauth]`           | Login (NextAuth)                   |
| GET    | `/api/account/balances`             | Consultar saldos                   |
| PATCH  | `/api/account/balances/update`      | Alterar tipo de conta (demo/real)  |
| POST   | `/api/account/operations/create`    | Abrir operacao                     |
| GET    | `/api/account/operations/pending`   | Operacoes ativas                   |
| POST   | `/api/account/operations/sell`      | Venda antecipada                   |
| PATCH  | `/api/account/operations/search`    | Liquidar operacao (admin)          |
| POST   | `/api/account/withdraw`             | Solicitar saque                    |
| POST   | `/api/account/reload-demo`          | Resetar saldo demo                 |
| GET    | `/api/market/price?symbol=X`        | Preco em tempo real                |
| GET    | `/api/market/candles?symbol=X&tf=Y` | Candles para grafico               |
| GET    | `/api/market/snapshot?symbol=X`     | Snapshot (preco + variacao)        |
| GET    | `/api/market/snapshots`             | Snapshots de todos os pares        |

---

## Admin App — Detalhes

### Funcionalidades

- **Gestao de usuarios**: Listar, buscar, ver detalhes
- **KYC**: Aprovar/rejeitar documentos enviados
- **Depositos**: Visualizar e confirmar depositos pendentes
- **Saques**: Aprovar/rejeitar solicitacoes de saque
- **Pares de trading**: Criar, editar, ativar/desativar pares
- **Providers de mercado**: Configurar Tiingo, Binance, iTick
- **Gateways de pagamento**: Configurar PIX, cartao, crypto
- **Promocoes**: Criar bonus e multiplicadores
- **Branding**: Customizar cores (30+ propriedades), logos, textos
- **Comissoes**: Configurar CPA e RevShare para afiliados
- **Logs de auditoria**: Historico de acoes administrativas
- **Configuracao geral**: Valores minimos, taxas, tolerancias

### Acesso

- **Email**: `admin@<SITE_DOMAIN>` (ex: `admin@localhost`)
- **Senha**: Valor de `ADMIN_PASSWORD` no `.env`
- O admin SUPER_ADMIN e criado automaticamente no seed do banco

---

## Afiliados App — Detalhes

### Funcionalidades

- **Dashboard**: Visao geral de comissoes, cliques, conversoes
- **Links de referral**: Geracao de links com tracking
- **Comissoes**: Historico de CPA e RevShare
- **Postbacks**: Configuracao de webhooks para plataformas (Google, TikTok, Facebook, Kwai)
- **Saques**: Solicitacao de saque de comissoes
- **Pixel tracking**: Setup de eventos de conversao

### Modelos de Comissao

- **CPA (Cost Per Action)**: Valor fixo por deposito do referido
- **RevShare (Revenue Share)**: Percentual da receita gerada pelo referido

---

## Banco de Dados

Todas as apps compartilham o mesmo banco PostgreSQL. O schema e gerenciado pelo Prisma (na app Trading) com migrations incrementais.

### Modelos Principais

| Modelo                  | Descricao                                        |
|-------------------------|--------------------------------------------------|
| `User`                  | Usuarios da plataforma                           |
| `Balance`               | Saldos (demo, real, comissao)                    |
| `TradingPair`           | Pares de trading (forex/crypto)                  |
| `TradeOperation`        | Operacoes executadas                             |
| `OperationSettlementJob`| Jobs de liquidacao agendados                     |
| `Deposit`               | Depositos                                        |
| `Withdrawal`            | Saques                                           |
| `KYC`                   | Documentos de verificacao                        |
| `Affiliate`             | Contas de afiliados                              |
| `AffiliateCommission`   | Comissoes geradas                                |
| `Config`                | Configuracao central da plataforma               |
| `MarketDataProvider`    | Providers de dados de mercado                    |
| `Gateway`               | Gateways de pagamento configurados               |
| `Promotion`             | Promocoes ativas                                 |
| `AuditLog`              | Log de auditoria administrativa                  |
| `Admin`                 | Contas de administradores                        |

---

## Scripts Uteis

### Bootstrap

```bash
# Subir tudo automaticamente (gera .env + docker compose up)
./scripts/docker-up.sh

# Apenas gerar o .env sem subir containers
./scripts/docker-up.sh --env-only

# Regenerar todas as senhas e secrets
./scripts/docker-up.sh --regenerate
```

### Docker

```bash
# Subir servicos
docker compose up -d --build

# Ver logs em tempo real
docker compose logs -f trading
docker compose logs -f admin
docker compose logs -f afiliados

# Reiniciar um servico
docker compose restart trading

# Rebuild apenas um servico
docker compose up -d --build trading

# Parar tudo
docker compose down

# Parar e apagar volumes (CUIDADO: apaga banco e certificados)
docker compose down -v
```

### Banco de Dados

```bash
# Acessar o banco via psql
docker compose exec db psql -U muniz_app -d muniz_platform

# Rodar migrations manualmente
docker compose exec trading npx prisma migrate deploy

# Rodar seed manualmente
docker compose exec trading npx prisma db seed

# Abrir Prisma Studio (interface visual do banco)
docker compose exec trading npx prisma studio
```

### Desenvolvimento Local (sem Docker)

```bash
# Pre-requisitos: Node 18+, PostgreSQL 16, pnpm

# Subir apenas o banco
docker compose up -d db

# Instalar dependencias
cd trading && pnpm install

# Gerar Prisma Client
npx prisma generate

# Rodar migrations
npx prisma migrate deploy

# Seed
npx prisma db seed

# Dev server
npm run dev     # http://localhost:3000
```

---

## Deploy em Producao

### 1. Configurar DNS

Aponte os 3 dominios para o IP publico do servidor:

```
A  app.seudominio.com       -> IP_DO_SERVIDOR
A  admin.seudominio.com     -> IP_DO_SERVIDOR
A  afiliados.seudominio.com -> IP_DO_SERVIDOR
```

### 2. Configurar variaveis

```bash
./scripts/docker-up.sh --env-only
nano .env
```

Editar:
```bash
TRADING_DOMAIN=app.seudominio.com
AFILIADOS_DOMAIN=afiliados.seudominio.com
ADMIN_DOMAIN=admin.seudominio.com
SITE_DOMAIN=seudominio.com
SITE_NAME="Nome da Plataforma"
TIINGO_API_KEY=sua-chave-tiingo
```

### 3. Subir

```bash
docker compose up -d --build
```

O Caddy provisiona certificados SSL automaticamente via Let's Encrypt. Nenhuma configuracao adicional de HTTPS e necessaria.

### 4. Verificar

```bash
# Checar status
docker compose ps

# Checar se SSL foi provisionado
docker compose logs caddy | grep "certificate obtained"

# Acessar
curl -I https://app.seudominio.com
```

---

## Volumes Persistentes

| Volume          | Conteudo                          | Montado em                     |
|-----------------|-----------------------------------|--------------------------------|
| `pg_data`       | Dados do PostgreSQL               | `/var/lib/postgresql/data`     |
| `kyc_uploads`   | Documentos KYC dos usuarios       | Trading: RW / Admin: RO       |
| `admin_uploads` | Uploads do admin (logos, imagens)  | Admin: RW                     |
| `caddy_data`    | Certificados TLS (Let's Encrypt)  | Caddy                         |
| `caddy_config`  | Config runtime do Caddy           | Caddy                         |

---

## Ordem de Inicializacao

1. **PostgreSQL** inicia e fica healthy
2. **Trading** inicia, roda `prisma migrate deploy` + `prisma db seed`, fica healthy
3. **Admin** e **Afiliados** iniciam (dependem do Trading estar healthy)
4. **Caddy** inicia e provisiona SSL para os 3 dominios

> O Trading precisa subir primeiro porque ele roda as migrations que criam as tabelas usadas por todos os apps.

---

## Observacoes

- O branding (cores, logos, nome) e configuravel via painel Admin sem rebuild
- Pares de trading sao configurados via Admin e podem ser ativados/desativados em tempo real
- Providers de mercado (Tiingo, Binance) sao configurados via Admin
- Gateways de pagamento (PIX, crypto) sao configurados via Admin
- O settlement de operacoes e automatico via worker server-side (nao depende do client)
- A plataforma suporta 3 idiomas: Portugues, Ingles e Espanhol
