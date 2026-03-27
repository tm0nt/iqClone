"use server"

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { webhookConfigs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAffiliateAuth } from "@/lib/auth";

// Função GET: Listar webhooks
export async function GET(request: NextRequest) {
  const auth = await requireAffiliateAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.userId;

  try {
    // Buscar webhooks do usuário
    const webhooks = await db
      .select({
        id: webhookConfigs.id,
        url: webhookConfigs.url,
        eventType: webhookConfigs.eventType,
        active: webhookConfigs.active,
        notes: webhookConfigs.notes,
        createdAt: webhookConfigs.createdAt,
        updatedAt: webhookConfigs.updatedAt,
      })
      .from(webhookConfigs)
      .where(eq(webhookConfigs.userId, userId));

    // Transformar eventType de string para array
    const formattedWebhooks = webhooks.map((webhook) => ({
      ...webhook,
      events: webhook.eventType.split(','),
    }));

    return NextResponse.json(formattedWebhooks);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao listar webhooks' }, { status: 500 });
  }
}
