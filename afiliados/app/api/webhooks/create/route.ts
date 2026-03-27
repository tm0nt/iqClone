"use server"

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { webhookConfigs, auditLogs } from "@/db/schema";
import { requireAffiliateAuth } from "@/lib/auth";

// Função POST: Registrar um webhook
export async function POST(request: NextRequest) {
  const auth = await requireAffiliateAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.userId;

  try {
    const body = await request.json();
    const { url, eventType } = body;

    // Validação dos dados
    if (!url || !eventType) {
      return NextResponse.json(
        { error: 'URL e tipo de evento são obrigatórios' },
        { status: 400 }
      );
    }

    // Função para normalizar os eventos
    const normalizeEvent = (event: string) => {
      return event
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .toLowerCase() // Converte para minúsculas
        .trim();
    };

    // Converter eventType para array normalizado
    const eventsArray = (typeof eventType === 'string'
      ? eventType.split(',')
      : Array.isArray(eventType)
        ? eventType
        : []);

    const normalizedEvents = eventsArray
      .map((e: string) => normalizeEvent(e))
      .filter((e: string) => e); // Remove strings vazias

    if (normalizedEvents.length === 0) {
      return NextResponse.json(
        { error: 'Pelo menos um evento válido deve ser especificado' },
        { status: 400 }
      );
    }

    // Criar o webhook no banco de dados
    const [webhook] = await db.insert(webhookConfigs).values({
      userId,
      url,
      eventType: normalizedEvents.join(','),
      active: 'ACTIVE',
      notes: body.notes || '',
    }).returning();

    // Registrar no audit log
    await db.insert(auditLogs).values({
      userId,
      entidade: 'WebhookConfig',
      entidadeId: webhook.id,
      acao: 'create',
      valoresNovos: JSON.stringify(webhook),
    });

    return NextResponse.json({
      id: webhook.id,
      url: webhook.url,
      events: normalizedEvents,
      active: webhook.active,
      createdAt: webhook.createdAt
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Erro ao criar webhook: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
