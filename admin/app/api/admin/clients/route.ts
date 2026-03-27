import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { updateClient } from "@/db/queries";
import { db } from "@/db";
import { users, balances } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin("SUPER_ADMIN", "ADMIN");
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { userId, ...clientData } = body;

    if (!userId) {
      return NextResponse.json({ error: "ID do cliente não fornecido" }, { status: 400 });
    }

    // Check if client exists
    const currentClient = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!currentClient[0]) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    // Update user fields
    const [updatedClient] = await db
      .update(users)
      .set({
        nome: clientData.nome ?? null,
        email: clientData.email,
        cpf: clientData.cpf,
        telefone: clientData.phone ?? null,
        dataNascimento: clientData.birthDate ? new Date(clientData.birthDate) : null,
        documentoTipo: clientData.documentType ?? null,
        documentoNumero: clientData.documentNumber ?? null,
        nacionalidade: "Brasil",
        ddi: clientData.ddi ?? null,
      })
      .where(eq(users.id, userId))
      .returning();

    // Update balance
    await db
      .update(balances)
      .set({
        saldoReal: clientData.saldoReal,
        saldoDemo: clientData.saldoDemo,
        saldoComissao: clientData.saldoComissao,
      })
      .where(eq(balances.userId, userId));

    return NextResponse.json({
      success: true,
      message: "Cliente atualizado com sucesso",
      client: updatedClient,
    });
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    return NextResponse.json({ error: "Erro interno do servidor ao atualizar cliente" }, { status: 500 });
  }
}
