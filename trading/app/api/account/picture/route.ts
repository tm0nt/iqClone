// app/api/account/picture/route.ts
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/prisma";
import sharp from "sharp";
import { requireAuth } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;
    const userId = session.userId;

    // 2. Obter dados do formulário
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 },
      );
    }

    // 3. Validar tipo e tamanho do arquivo
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Apenas imagens são permitidas" },
        { status: 400 },
      );
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Tamanho máximo do arquivo é 5MB" },
        { status: 400 },
      );
    }

    // 4. Criar estrutura de pastas
    const uploadDir = join(process.cwd(), "public", "profile", userId);
    await mkdir(uploadDir, { recursive: true });

    // 5. Processar imagem
    const bytes = await file.arrayBuffer();
    const filename = "profile.jpg";
    const path = join(uploadDir, filename);

    await sharp(bytes)
      .resize({
        width: 100,
        height: 100,
        fit: "cover", // cobre a área mantendo proporções
        position: "center", // centraliza a imagem
      })
      .jpeg({
        quality: 80, // qualidade de 80% (ajuste conforme necessário)
        mozjpeg: true, // otimização avançada
      })
      .toFile(path);

    // 6. Atualizar URL no banco de dados
    const profileUrl = `/profile/${userId}/${filename}?t=${Date.now()}`; // Adiciona timestamp para evitar cache
    await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: profileUrl },
    });

    // 7. Retornar resposta
    return NextResponse.json({
      success: true,
      url: profileUrl,
      message: "Foto de perfil atualizada com sucesso",
    });
  } catch (error) {
    console.error("Erro no upload da imagem:", error);
    return NextResponse.json(
      { error: "Erro ao processar imagem" },
      { status: 500 },
    );
  }
}
