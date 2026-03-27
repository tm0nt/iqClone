"use server"

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { webhookConfigs, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAffiliateAuth } from "@/lib/auth";

// DELETE route to remove a webhook
export async function DELETE(request: NextRequest) {
  const auth = await requireAffiliateAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.userId;

  try {
    const { id } = await request.json(); // Expect webhook ID in request body

    // Validate webhook ID
    if (!id) {
      return NextResponse.json({ error: 'Webhook ID not provided' }, { status: 400 });
    }

    // Check if webhook exists and belongs to the user
    const [webhook] = await db
      .select()
      .from(webhookConfigs)
      .where(eq(webhookConfigs.id, id))
      .limit(1);

    if (!webhook || webhook.userId !== userId) {
      return NextResponse.json({ error: 'Webhook not found or does not belong to user' }, { status: 404 });
    }

    // Delete the webhook
    await db.delete(webhookConfigs).where(eq(webhookConfigs.id, id));

    // Log the deletion in audit log
    await db.insert(auditLogs).values({
      userId,
      entidade: 'WebhookConfig',
      entidadeId: id,
      acao: 'delete',
      valoresAntigos: JSON.stringify(webhook),
    });

    return NextResponse.json({ message: 'Webhook deleted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error deleting webhook' }, { status: 500 });
  }
}
