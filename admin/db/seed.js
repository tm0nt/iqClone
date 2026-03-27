// @ts-check
/**
 * Seed completo para o banco de dados do admin.
 * Executa com: node apps/admin/db/seed.js
 *
 * Requer DATABASE_URL no ambiente. Exemplo:
 *   DATABASE_URL="postgresql://brx:Qw3RtY77@localhost:5432/trading" node apps/admin/db/seed.js
 */

const postgres = require("postgres");
const { drizzle } = require("drizzle-orm/postgres-js");
const { randomUUID } = require("crypto");
const bcrypt = require("bcryptjs");

// ---------------------------------------------------------------------------
// Conexão
// ---------------------------------------------------------------------------
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌  DATABASE_URL não definida.");
  process.exit(1);
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

// ---------------------------------------------------------------------------
// SQL helpers (raw, sem schema importado — evita TypeScript / ESM issues)
// ---------------------------------------------------------------------------
const sql = client;

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------
async function seed() {
  console.log("🌱  Iniciando seed...\n");

  // ─── 1. Admin ────────────────────────────────────────────────────────────
  console.log("👤  Criando admin...");
  const senhaHash = await bcrypt.hash("admin", 12);
  console.log("   Hash gerado:", senhaHash);

  // Verificar se o hash funciona
  const hashOk = await bcrypt.compare("admin", senhaHash);
  console.log("   Verificação do hash:", hashOk ? "OK ✓" : "FALHOU ✗");

  // Deletar admin existente para evitar problemas com ON CONFLICT
  await sql`DELETE FROM "Admin" WHERE email = 'admin@admin.com'`;

  const [adminRow] = await sql`
    INSERT INTO "Admin" (id, email, senha, nome, nivel, "dataCriacao")
    VALUES (
      gen_random_uuid(),
      'admin@admin.com',
      ${senhaHash},
      'Super Admin',
      'SUPER_ADMIN'::"Role",
      NOW()
    )
    RETURNING id, email, senha
  `;
  const adminId = adminRow.id;

  // Verificar se o hash salvo no banco está correto
  const [dbAdmin] = await sql`SELECT senha FROM "Admin" WHERE email = 'admin@admin.com'`;
  const dbHashOk = await bcrypt.compare("admin", dbAdmin.senha);
  console.log("   Verificação do hash no DB:", dbHashOk ? "OK ✓" : "FALHOU ✗");
  console.log("   ✓ admin@admin.com  /  senha: admin  /  nível: SUPER_ADMIN");

  // ─── 2. Gateway PIX ──────────────────────────────────────────────────────
  console.log("\n🏦  Criando gateway de exemplo...");
  const [gateway] = await sql`
    INSERT INTO "Gateways" (name, endpoint, "tokenPublico", "tokenPrivado", split, "splitValue", type)
    VALUES (
      'Gateway PIX Principal',
      'https://api.gateway-exemplo.com/',
      'pub_token_exemplo',
      'priv_token_exemplo',
      NULL,
      NULL,
      'pix'
    )
    ON CONFLICT DO NOTHING
    RETURNING id
  `;

  const gatewayId = gateway?.id ?? null;

  if (gatewayId) {
    console.log(`   ✓ Gateway criado (id: ${gatewayId})`);
  } else {
    // buscar o existente
    const [existing] = await sql`SELECT id FROM "Gateways" WHERE name = 'Gateway PIX Principal' LIMIT 1`;
    console.log(`   ℹ Gateway já existia (id: ${existing?.id})`);
  }

  const resolvedGatewayId = gatewayId ?? (
    await sql`SELECT id FROM "Gateways" WHERE name = 'Gateway PIX Principal' LIMIT 1`
  ).then(r => r[0]?.id);

  // ─── 3. Config ───────────────────────────────────────────────────────────
  console.log("\n⚙️   Criando configuração do site...");
  const gid = gateway?.id ?? (await sql`SELECT id FROM "Gateways" LIMIT 1`.then(r => r[0]?.id));

  await sql`
    INSERT INTO "Config" (
      "nomeSite", "urlSite", "logoUrlDark", "logoUrlWhite",
      "cpaMin", "cpaValor", "revShareFalsoValue", "revShareNegativo", "revShareValue",
      taxa, "valorMinimoSaque", "valorMinimoDeposito",
      "postbackUrl", "criadoEm",
      "gatewayPixDepositoId", "gatewayPixSaqueId"
    )
    SELECT
      'Minha Plataforma',
      'https://app.minhaplatforma.com/',
      '/logo-dark.png',
      '/logo-white.png',
      30, 15, 85, NULL, 35,
      10, 100, 60,
      NULL, NOW(),
      ${gid}, ${gid}
    WHERE NOT EXISTS (SELECT 1 FROM "Config" LIMIT 1)
  `;
  console.log("   ✓ Config criada (ou já existia)");

  // ─── 4. Usuários de teste ─────────────────────────────────────────────────
  console.log("\n👥  Criando usuários de teste...");
  const senhaUsuario = await bcrypt.hash("senha123", 10);

  const testUsers = [
    { nome: "João Silva", email: "joao@teste.com", cpf: "111.111.111-11", telefone: "11999991111" },
    { nome: "Maria Souza", email: "maria@teste.com", cpf: "222.222.222-22", telefone: "11999992222" },
    { nome: "Carlos Lima", email: "carlos@teste.com", cpf: "333.333.333-33", telefone: "11999993333" },
  ];

  const userIds = [];
  for (const u of testUsers) {
    const uid = randomUUID();
    await sql`
      INSERT INTO "User" (id, email, nome, senha, cpf, telefone, "createdAt", "updatedAt")
      VALUES (${uid}, ${u.email}, ${u.nome}, ${senhaUsuario}, ${u.cpf}, ${u.telefone}, NOW(), NOW())
      ON CONFLICT (email) DO NOTHING
    `;

    const [row] = await sql`SELECT id FROM "User" WHERE email = ${u.email} LIMIT 1`;
    if (row) {
      userIds.push(row.id);
      console.log(`   ✓ ${u.nome} (${u.email})`);
    }
  }

  // ─── 5. Saldos ───────────────────────────────────────────────────────────
  console.log("\n💰  Criando saldos...");
  for (const uid of userIds) {
    await sql`
      INSERT INTO "Balance" (id, "userId", "saldoReal", "saldoDemo", "saldoComissao", "updatedAt")
      VALUES (${randomUUID()}, ${uid}, 250.00, 10000.00, 0.00, NOW())
      ON CONFLICT ("userId") DO NOTHING
    `;
  }
  console.log(`   ✓ ${userIds.length} saldos criados`);

  // ─── 6. Depósitos ────────────────────────────────────────────────────────
  console.log("\n📥  Criando depósitos...");
  const depositStatuses = ["concluido", "concluido", "pendente", "cancelado"];
  for (const uid of userIds) {
    for (let i = 0; i < 3; i++) {
      const status = depositStatuses[i % depositStatuses.length];
      const dataPagamento = status === "concluido" ? new Date(Date.now() - i * 86400000) : null;
      await sql`
        INSERT INTO "Deposit" (id, "transactionId", "userId", tipo, valor, status, "dataCriacao", "dataPagamento")
        VALUES (
          ${randomUUID()}, ${randomUUID()}, ${uid},
          'pix', ${100 + i * 50}, ${status}, NOW(), ${dataPagamento}
        )
      `;
    }
  }
  console.log(`   ✓ ${userIds.length * 3} depósitos criados`);

  // ─── 7. Saques ───────────────────────────────────────────────────────────
  console.log("\n📤  Criando saques...");
  const withdrawalStatuses = ["concluido", "pendente", "processando"];
  for (const uid of userIds) {
    for (let i = 0; i < 2; i++) {
      const status = withdrawalStatuses[i % withdrawalStatuses.length];
      const dataPagamento = status === "concluido" ? new Date(Date.now() - i * 86400000) : null;
      await sql`
        INSERT INTO "Withdrawal" (
          id, "userId", "dataPedido", "dataPagamento",
          "tipoChave", chave, tipo, status, valor, taxa
        )
        VALUES (
          ${randomUUID()}, ${uid}, NOW(), ${dataPagamento},
          'CPF', '111.111.111-11', 'usuario',
          ${status}, ${80 + i * 30}, 10
        )
      `;
    }
  }
  console.log(`   ✓ ${userIds.length * 2} saques criados`);

  // ─── 8. Operações de trade ───────────────────────────────────────────────
  console.log("\n📊  Criando operações de trade...");
  const ativos = ["EURUSD", "BTCUSDT", "GBPUSD", "XAUUSD"];
  const resultados = ["ganho", "perda", "ganho", "pendente"];
  for (const uid of userIds) {
    for (let i = 0; i < 5; i++) {
      const resultado = resultados[i % resultados.length];
      const receita = resultado === "ganho" ? 150 : resultado === "perda" ? 0 : 0;
      await sql`
        INSERT INTO "TradeOperation" (
          id, "userId", tipo, data, ativo, tempo, previsao,
          vela, abertura, fechamento, valor, estornado,
          executado, status, receita, resultado
        )
        VALUES (
          ${randomUUID()}, ${uid}, 'real',
          ${new Date(Date.now() - i * 3600000)},
          ${ativos[i % ativos.length]}, '1m', 'call',
          'verde', ${1.0850 + i * 0.001}, ${1.0870 + i * 0.001},
          100, false, true,
          ${resultado === "pendente" ? "aberto" : "fechado"},
          ${receita}, ${resultado}
        )
      `;
    }
  }
  console.log(`   ✓ ${userIds.length * 5} operações criadas`);

  // ─── 9. Logs de auditoria ────────────────────────────────────────────────
  console.log("\n📋  Criando logs de auditoria...");
  await sql`
    INSERT INTO "AuditLog" (id, "userId", entidade, "entidadeId", acao, "valoresAntigos", "valoresNovos", "createdAt")
    VALUES (${randomUUID()}, ${adminId}, 'Admin', ${adminId}, 'create', NULL, '{"acao":"seed"}', NOW())
  `;
  console.log("   ✓ Log de auditoria criado");

  // ─── Resumo ──────────────────────────────────────────────────────────────
  console.log(`
╔══════════════════════════════════════════╗
║           SEED CONCLUÍDO ✅              ║
╠══════════════════════════════════════════╣
║  Admin:     admin@admin.com              ║
║  Senha:     admin                        ║
║  Nível:     SUPER_ADMIN                  ║
╠══════════════════════════════════════════╣
║  Usuários:  ${testUsers.length} criados                     ║
║  Depósitos: ${userIds.length * 3} criados                     ║
║  Saques:    ${userIds.length * 2} criados                      ║
║  Trades:    ${userIds.length * 5} criados                    ║
╚══════════════════════════════════════════╝
  `);

  await client.end();
}

seed().catch((err) => {
  console.error("❌  Erro no seed:", err);
  client.end();
  process.exit(1);
});
