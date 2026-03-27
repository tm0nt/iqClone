import { prisma } from "@/lib/prisma";
import { GatewayHandlerParams } from "./types";

type GatewayMethod = GatewayHandlerParams["method"];
type GatewayDirection = "deposit" | "withdraw";

type GatewaySelectionFieldMap = {
  selectedIdField:
    | "gatewayPixDepositoId"
    | "gatewayPixSaqueId"
    | "creditCardDepositId"
    | "cryptoDepositId"
    | "cryptoSaqueId";
  lastUsedField:
    | "lastPixDepositGatewayId"
    | "lastPixWithdrawalGatewayId"
    | "lastCreditDepositGatewayId"
    | "lastCryptoDepositGatewayId"
    | "lastCryptoWithdrawalGatewayId";
  modeField: "depositGatewayMode" | "withdrawGatewayMode";
};

function getGatewayConfigFields(
  method: GatewayMethod,
  direction: GatewayDirection,
): GatewaySelectionFieldMap {
  if (direction === "deposit") {
    switch (method) {
      case "pix":
        return {
          selectedIdField: "gatewayPixDepositoId",
          lastUsedField: "lastPixDepositGatewayId",
          modeField: "depositGatewayMode",
        };
      case "credit":
        return {
          selectedIdField: "creditCardDepositId",
          lastUsedField: "lastCreditDepositGatewayId",
          modeField: "depositGatewayMode",
        };
      case "crypto":
        return {
          selectedIdField: "cryptoDepositId",
          lastUsedField: "lastCryptoDepositGatewayId",
          modeField: "depositGatewayMode",
        };
    }
  }

  switch (method) {
    case "pix":
      return {
        selectedIdField: "gatewayPixSaqueId",
        lastUsedField: "lastPixWithdrawalGatewayId",
        modeField: "withdrawGatewayMode",
      };
    case "credit":
      return {
        selectedIdField: "creditCardDepositId",
        lastUsedField: "lastCreditDepositGatewayId",
        modeField: "withdrawGatewayMode",
      };
    case "crypto":
      return {
        selectedIdField: "cryptoSaqueId",
        lastUsedField: "lastCryptoWithdrawalGatewayId",
        modeField: "withdrawGatewayMode",
      };
  }
}

export function normalizeGatewayMethod(
  rawMethod: string | null | undefined,
): GatewayMethod | null {
  switch (rawMethod) {
    case "pix":
    case "bank_transfer":
      return "pix";
    case "credit":
    case "credit_card":
      return "credit";
    case "crypto":
    case "cryptocurrency":
    case "usdt":
      return "crypto";
    default:
      return null;
  }
}

export async function resolveGatewayForFlow({
  method,
  direction,
}: {
  method: GatewayMethod;
  direction: GatewayDirection;
}) {
  const fields = getGatewayConfigFields(method, direction);

  return prisma.$transaction(async (tx) => {
    const config = await tx.config.findFirst();
    const gateways = await tx.gateways.findMany({
      where: {
        type: method,
        isActive: true,
      },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    });

    if (gateways.length === 0) {
      return null;
    }

    const selectedId = config?.[fields.selectedIdField] ?? null;
    const mode = config?.[fields.modeField] ?? "manual";

    if (mode === "manual") {
      return gateways.find((gateway) => gateway.id === selectedId) ?? gateways[0];
    }

    if (mode === "random") {
      return gateways[Math.floor(Math.random() * gateways.length)] ?? gateways[0];
    }

    const lastUsedId = config?.[fields.lastUsedField] ?? null;
    const currentIndex = gateways.findIndex((gateway) => gateway.id === lastUsedId);
    const nextGateway = gateways[(currentIndex + 1) % gateways.length] ?? gateways[0];

    if (config?.id) {
      await tx.config.update({
        where: { id: config.id },
        data: {
          [fields.lastUsedField]: nextGateway.id,
        },
      });
    }

    return nextGateway;
  });
}

export async function getGatewayHandler(params: GatewayHandlerParams) {
  const gateway = await prisma.gateways.findUnique({
    where: { id: params.idGateway },
    select: {
      id: true,
      name: true,
      provider: true,
      isActive: true,
    },
  });

  if (!gateway || !gateway.isActive) {
    throw new Error("Nenhum provedor de pagamento ativo encontrado.");
  }

  throw new Error(
    `O provedor ${gateway.provider || gateway.name} ainda não possui integração ativa nesta instalação.`,
  );
}
