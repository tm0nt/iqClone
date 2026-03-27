import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  users,
  balances,
  userLogs,
  userActivities,
  deposits,
  withdrawals,
  tradeOperations,
  auditLogs,
  affiliates,
  affiliateCommissions,
  clickEvents,
  pixelEvents,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin("SUPER_ADMIN", "ADMIN");
  if (auth.error) return auth.error;

  let userId: string;
  try {
    const body = await request.json();
    userId = body.userId;
    if (!userId) throw new Error("ID do usuário não fornecido");
  } catch {
    return NextResponse.json(
      { error: "ID do usuário inválido ou não fornecido" },
      { status: 400 }
    );
  }

  try {
    const [userExists] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userExists) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Registro de auditoria
    await db.insert(auditLogs).values({
      userId: auth.adminId,
      entidade: "User",
      entidadeId: userId,
      acao: "delete",
      valoresAntigos: userExists,
    });

    // Deletar relações na ordem correta via transação
    await db.transaction(async (tx) => {
      await tx.delete(tradeOperations).where(eq(tradeOperations.userId, userId));
      await tx.delete(userLogs).where(eq(userLogs.userId, userId));
      await tx.delete(userActivities).where(eq(userActivities.userId, userId));
      await tx.delete(deposits).where(eq(deposits.userId, userId));
      await tx.delete(withdrawals).where(eq(withdrawals.userId, userId));

      // Afiliado: buscar e deletar comissões, clicks, pixels
      const [affiliate] = await tx
        .select({ id: affiliates.id })
        .from(affiliates)
        .where(eq(affiliates.userId, userId))
        .limit(1);

      if (affiliate) {
        await tx.delete(affiliateCommissions).where(eq(affiliateCommissions.affiliateId, affiliate.id));
        await tx.delete(clickEvents).where(eq(clickEvents.affiliateId, affiliate.id));
        await tx.delete(pixelEvents).where(eq(pixelEvents.affiliateId, affiliate.id));
        await tx.delete(affiliates).where(eq(affiliates.userId, userId));
      }

      await tx.delete(balances).where(eq(balances.userId, userId));
      await tx.delete(users).where(eq(users.id, userId));
    });

    return NextResponse.json(
      { message: "Usuário deletado com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor ao deletar usuário" },
      { status: 500 }
    );
  }
}
