import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { KYCStatus, KYCType } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { writeFile } from "fs/promises";
import path from "path";
import { mkdir } from "fs/promises";
import { requireAuth } from "@/lib/auth/session";

const PRIVATE_KYC_STORAGE_DIR = path.join(process.cwd(), "private", "kyc");
const MAX_KYC_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_KYC_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "application/pdf",
]);

function validateFile(file: File, label: string) {
  if (file.size <= 0) {
    throw new Error(`Arquivo ${label} vazio`);
  }

  if (!ALLOWED_KYC_MIME_TYPES.has(file.type)) {
    throw new Error(`Formato inválido para ${label}`);
  }

  if (file.size > MAX_KYC_FILE_SIZE_BYTES) {
    throw new Error(`Arquivo ${label} excede o limite de 5 MB`);
  }
}

function resolveFileExtension(file: File) {
  const ext = path.extname(file.name);
  if (ext) {
    return ext.toLowerCase();
  }

  if (file.type === "application/pdf") return ".pdf";
  if (file.type === "image/jpeg" || file.type === "image/jpg") return ".jpg";
  if (file.type === "image/png") return ".png";

  return ".bin";
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.userId;

  try {
    const formData = await request.formData();
    const documentType = formData.get("documentType") as string;
    const front = formData.get("front") as File;
    const back = formData.get("back") as File | null;
    const selfie = formData.get("selfie") as File | null;
    const cpf = formData.get("cpf") as string | null;

    if (!front) {
      return NextResponse.json(
        { error: "Arquivo principal do documento é obrigatório" },
        { status: 400 },
      );
    }

    let kycType: KYCType;
    if (documentType === "rg" || documentType === "state_id") {
      kycType = KYCType.RG;
    } else if (documentType === "cnh" || documentType === "drivers_license") {
      kycType = KYCType.CNH;
    } else if (documentType === "passaporte" || documentType === "passport") {
      kycType = KYCType.PASSAPORTE;
    } else {
      return NextResponse.json({ error: "Tipo de documento inválido" }, { status: 400 });
    }

    const requiresBack = kycType !== KYCType.PASSAPORTE;
    const requiresSelfie = true;

    if (requiresBack && !back) {
      return NextResponse.json(
        { error: "O verso do documento é obrigatório" },
        { status: 400 },
      );
    }

    if (requiresSelfie && !selfie) {
      return NextResponse.json(
        { error: "A selfie com o documento é obrigatória" },
        { status: 400 },
      );
    }

    validateFile(front, "frente");
    if (back) validateFile(back, "verso");
    if (selfie) validateFile(selfie, "selfie");

    const userUploadDir = path.join(
      PRIVATE_KYC_STORAGE_DIR,
      userId,
    );

    try {
      await mkdir(userUploadDir, { recursive: true });
    } catch (err) {
      console.error("Erro ao criar diretório:", err);
      return NextResponse.json(
        { error: "Erro ao preparar armazenamento" },
        { status: 500 }
      );
    }

    const saveFile = async (file: File, suffix: string) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${uuidv4()}_${suffix}${resolveFileExtension(file)}`;
      const filePath = path.join(userUploadDir, filename);
      await writeFile(filePath, buffer);
      return path.posix.join(userId, filename);
    };

    const paths: Record<string, string> = {};

    paths.front = await saveFile(front, "front");
    if (back) {
      paths.back = await saveFile(back, "back");
    }
    if (selfie) {
      paths.selfie = await saveFile(selfie, "selfie");
    }

    const kyc = await prisma.$transaction(async (tx) => {
      const created = await tx.kYC.create({
        data: {
          userId,
          status: KYCStatus.PENDING,
          type: kycType,
          paths,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          kyc: KYCStatus.PENDING,
          ...(cpf ? { cpf } : {}),
        },
      });

      return created;
    });

    return NextResponse.json({
      success: true,
      kyc: {
        id: kyc.id,
        status: kyc.status,
        type: kyc.type,
        createdAt: kyc.createdAt,
        updatedAt: kyc.updatedAt,
      },
      message: "Documentos enviados com sucesso para verificação"
    });
  } catch (error) {
    console.error("Erro no upload de KYC:", error);
    if (error instanceof Error) {
      const message = error.message.trim();
      if (
        message.includes("Formato inválido") ||
        message.includes("excede o limite") ||
        message.includes("vazio")
      ) {
        return NextResponse.json({ error: message }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: "Erro ao processar documentos" },
      { status: 500 }
    );
  }
}
