/**
 * Prisma seed organizado por domínio.
 * Execute com: npx ts-node prisma/seed.ts
 */
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

// =================== Admin ===================
async function seedAdmins() {
  console.log("Seeding admins...");

  const hashedPassword = await hash("admin123", 10);

  await prisma.admin.upsert({
    where: { email: "admin@admin.com" },
    update: {},
    create: {
      email: "admin@admin.com",
      nome: "Administrador",
      senha: hashedPassword,
      nivel: "SUPER_ADMIN",
    },
  });
}

// =================== Config ===================
async function seedConfig() {
  console.log("Seeding config...");

  const existingConfig = await prisma.config.findFirst();
  if (!existingConfig) {
    await prisma.config.create({
      data: {
        nomeSite: "NextBrokers",
        urlSite: "https://app.example.com/",
        logoUrlDark: "/nextbrokers.png",
        logoUrlWhite: "/nextbrokers.png",
        cpaMin: 30,
        cpaValor: 15,
        revShareFalsoValue: 85,
        revShareValue: 35,
        taxa: 10,
        valorMinimoSaque: 100,
        valorMinimoDeposito: 60,
      },
    });
  }
}

// =================== Users (demo) ===================
async function seedDemoUser() {
  console.log("Seeding demo user...");

  const hashedPassword = await hash("demo123", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@demo.com" },
    update: {},
    create: {
      email: "demo@demo.com",
      nome: "Usuário Demo",
      senha: hashedPassword,
    },
  });

  await prisma.balance.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      saldoDemo: 10000,
      saldoReal: 0,
      saldoComissao: 0,
    },
  });
}

// =================== Main ===================
async function main() {
  console.log("Starting seed...");
  await seedAdmins();
  await seedConfig();
  await seedDemoUser();
  console.log("Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
