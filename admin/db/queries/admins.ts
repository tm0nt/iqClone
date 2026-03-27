import { db } from "@/db";
import { admins } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getAdmins() {
  return db
    .select({
      id: admins.id,
      email: admins.email,
      nome: admins.nome,
      nivel: admins.nivel,
      telefone: admins.telefone,
      dataCriacao: admins.dataCriacao,
    })
    .from(admins)
    .orderBy(desc(admins.dataCriacao));
}

export async function getAdminById(id: string) {
  const rows = await db
    .select({
      id: admins.id,
      email: admins.email,
      nome: admins.nome,
      nivel: admins.nivel,
      telefone: admins.telefone,
      dataCriacao: admins.dataCriacao,
    })
    .from(admins)
    .where(eq(admins.id, id))
    .limit(1);

  return rows[0] ?? null;
}

export async function getAdminByEmail(email: string) {
  const rows = await db
    .select({
      id: admins.id,
      email: admins.email,
      nome: admins.nome,
      senha: admins.senha,
      nivel: admins.nivel,
      telefone: admins.telefone,
    })
    .from(admins)
    .where(eq(admins.email, email))
    .limit(1);

  return rows[0] ?? null;
}

export async function createAdmin(data: {
  email: string;
  nome: string;
  senha: string;
  nivel: "SUPER_ADMIN" | "ADMIN" | "ASSISTANT_ADMIN";
  telefone?: string;
}) {
  const rows = await db
    .insert(admins)
    .values(data)
    .returning({
      id: admins.id,
      email: admins.email,
      nome: admins.nome,
      nivel: admins.nivel,
    });

  return rows[0]!;
}

export async function updateAdmin(
  id: string,
  data: Partial<{
    nome: string;
    email: string;
    telefone: string;
    nivel: "SUPER_ADMIN" | "ADMIN" | "ASSISTANT_ADMIN";
  }>,
) {
  const rows = await db
    .update(admins)
    .set(data)
    .where(eq(admins.id, id))
    .returning({
      id: admins.id,
      email: admins.email,
      nome: admins.nome,
      nivel: admins.nivel,
    });

  return rows[0] ?? null;
}

export async function deleteAdmin(id: string) {
  return db.delete(admins).where(eq(admins.id, id));
}

export async function updateAdminPassword(id: string, hashedPassword: string) {
  return db
    .update(admins)
    .set({ senha: hashedPassword })
    .where(eq(admins.id, id));
}
