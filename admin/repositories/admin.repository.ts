import { db } from "@/db";
import { admins } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * Repository para operações de Admin no banco de dados.
 */
export const adminRepository = {
  async findByEmail(email: string) {
    return db.query.admins.findFirst({
      where: eq(admins.email, email),
      columns: {
        id: true,
        email: true,
        nome: true,
        senha: true,
        nivel: true,
        telefone: true,
      },
    });
  },

  async findById(id: string) {
    return db.query.admins.findFirst({
      where: eq(admins.id, id),
      columns: {
        id: true,
        email: true,
        nome: true,
        nivel: true,
        telefone: true,
        dataCriacao: true,
      },
    });
  },

  async findAll() {
    return db.query.admins.findMany({
      columns: {
        id: true,
        email: true,
        nome: true,
        nivel: true,
        telefone: true,
        dataCriacao: true,
      },
      orderBy: [desc(admins.dataCriacao)],
    });
  },

  async create(data: {
    email: string;
    nome: string;
    senha: string;
    nivel: "SUPER_ADMIN" | "ADMIN" | "ASSISTANT_ADMIN";
    telefone?: string;
  }) {
    const [admin] = await db
      .insert(admins)
      .values(data)
      .returning({
        id: admins.id,
        email: admins.email,
        nome: admins.nome,
        nivel: admins.nivel,
      });
    return admin;
  },

  async update(
    id: string,
    data: Partial<{
      nome: string;
      email: string;
      telefone: string;
      nivel: "SUPER_ADMIN" | "ADMIN" | "ASSISTANT_ADMIN";
    }>,
  ) {
    const [admin] = await db
      .update(admins)
      .set(data)
      .where(eq(admins.id, id))
      .returning({
        id: admins.id,
        email: admins.email,
        nome: admins.nome,
        nivel: admins.nivel,
      });
    return admin;
  },

  async delete(id: string) {
    const [admin] = await db
      .delete(admins)
      .where(eq(admins.id, id))
      .returning();
    return admin;
  },

  async updatePassword(id: string, hashedPassword: string) {
    const [admin] = await db
      .update(admins)
      .set({ senha: hashedPassword })
      .where(eq(admins.id, id))
      .returning({ id: admins.id });
    return admin;
  },
};
