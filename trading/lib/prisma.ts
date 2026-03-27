import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Singleton do PrismaClient com proteção contra múltiplas instâncias no hot-reload.
 *
 * - Em dev: log de queries para debug
 * - Em prod: log apenas de queries lentas (> 500ms) e erros
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "production"
        ? [
            { emit: "event", level: "error" },
            { emit: "event", level: "warn" },
          ]
        : [
            { emit: "event", level: "query" },
            { emit: "event", level: "error" },
            { emit: "event", level: "warn" },
          ],
  });

// Middleware: log de queries lentas em produção (> 500ms)
prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();
  const duration = after - before;

  if (duration > 500) {
    console.warn(
      `[Prisma Slow Query] ${params.model}.${params.action} took ${duration}ms`,
    );
  }

  return result;
});

// Configura timezone na conexão
prisma.$connect().then(() => {
  prisma.$executeRaw`SET TIMEZONE TO 'America/Sao_Paulo'`;
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
