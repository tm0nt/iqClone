import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { users, deposits } from "@/db/schema";
import { count, sum, gte, lte, and, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin("SUPER_ADMIN", "ADMIN");
  if (auth.error) return auth.error;

  try {
    const dataAtual = new Date();
    const dataUltimos30Dias = new Date(dataAtual);
    dataUltimos30Dias.setDate(dataAtual.getDate() - 30);
    const data60DiasAtras = new Date(dataAtual);
    data60DiasAtras.setDate(dataAtual.getDate() - 60);

    const [
      [totalClientesResult],
      [depositosUltimos30DiasResult],
      [depositosPeriodoAnteriorResult],
      [clientesUltimos30DiasResult],
      [clientesPeriodoAnteriorResult],
      [depositosPendentesCountResult],
      [totalDepositosPendentesResult],
      [novosClientesResult],
    ] = await Promise.all([
      db.select({ total: count() }).from(users),
      db
        .select({ total: sum(deposits.valor) })
        .from(deposits)
        .where(gte(deposits.dataPagamento, dataUltimos30Dias)),
      db
        .select({ total: sum(deposits.valor) })
        .from(deposits)
        .where(
          and(
            gte(deposits.dataPagamento, data60DiasAtras),
            lte(deposits.dataPagamento, dataUltimos30Dias)
          )
        ),
      db
        .select({ total: count() })
        .from(users)
        .where(gte(users.createdAt, dataUltimos30Dias)),
      db
        .select({ total: count() })
        .from(users)
        .where(
          and(
            gte(users.createdAt, data60DiasAtras),
            lte(users.createdAt, dataUltimos30Dias)
          )
        ),
      db
        .select({ total: count() })
        .from(deposits)
        .where(eq(deposits.status, "pendente")),
      db
        .select({ total: sum(deposits.valor) })
        .from(deposits)
        .where(eq(deposits.status, "pendente")),
      db
        .select({ total: count() })
        .from(users)
        .where(gte(users.createdAt, dataUltimos30Dias)),
    ]);

    const totalClientes = totalClientesResult!.total;
    const depositosSum30 = Number(depositosUltimos30DiasResult!.total) || 0;
    const depositosSumAnterior = Number(depositosPeriodoAnteriorResult!.total) || 0;
    const clientesCount30 = clientesUltimos30DiasResult!.total || 1;
    const clientesCountAnterior = clientesPeriodoAnteriorResult!.total || 1;

    const valorMedioAtual = depositosSum30 / clientesCount30;
    const valorMedioAnterior = depositosSumAnterior / clientesCountAnterior;

    let variacaoPercentual = 0;
    if (valorMedioAnterior > 0) {
      variacaoPercentual = ((valorMedioAtual - valorMedioAnterior) / valorMedioAnterior) * 100;
    } else if (valorMedioAtual > 0) {
      variacaoPercentual = 100;
    }

    const resposta = {
      totalClientes,
      valorMedioDeposito: valorMedioAtual,
      variacaoMediaDeposito: Math.round(variacaoPercentual * 100) / 100,
      totalDepositosPendentes: depositosPendentesCountResult!.total,
      depositoPendenteValor: Number(totalDepositosPendentesResult!.total) || 0,
      novosClientes: novosClientesResult!.total,
    };

    return NextResponse.json(resposta);
  } catch (err) {
    console.error("Erro ao buscar dados:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
