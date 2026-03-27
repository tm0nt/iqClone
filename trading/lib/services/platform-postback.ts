import { getPlatformConfig } from "@/lib/config/site-config";

type PlatformPostbackEvent = "register" | "deposit" | "withdraw";

export async function sendPlatformPostback(
  event: PlatformPostbackEvent,
  payload: Record<string, unknown>,
) {
  try {
    const config = await getPlatformConfig();
    if (!config.postbackUrl) {
      return;
    }

    await fetch(config.postbackUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event,
        timestamp: new Date().toISOString(),
        source: "trading",
        payload,
      }),
      signal: AbortSignal.timeout(5_000),
    });
  } catch (error) {
    console.error(`Erro ao enviar postback ${event}:`, error);
  }
}
