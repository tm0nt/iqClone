import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { KYCStatus, KYCType } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { writeFile } from "fs/promises";
import path from "path";
import { mkdir } from "fs/promises";
import { requireAuth } from "@/lib/auth/session";

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.userId;

  try {
    const host = request.headers.get("host")?.replace(/^www\./, "") || "localhost";
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

    const userUploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      userId,
      "kyc",
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
      const filename = `${uuidv4()}_${suffix}${path.extname(file.name)}`;
      const filePath = path.join(userUploadDir, filename);
      await writeFile(filePath, buffer);
      return `${request.headers.get("x-forwarded-proto") || "https"}://${host}/uploads/${userId}/kyc/${filename}`;
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
      kyc,
      message: "Documentos enviados com sucesso para verificação" 
    });
  } catch (error) {
    console.error("Erro no upload de KYC:", error);
    return NextResponse.json(
      { error: "Erro ao processar documentos" },
      { status: 500 }
    );
  }
}
