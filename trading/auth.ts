import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import authConfig, { authCallbacks } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { getAuthSessionSecrets } from "@/lib/auth/session-secret";
import { getRuntimeConfig } from "@/lib/config/runtime-config";

async function buildProviders(): Promise<Provider[]> {
  const runtimeConfig = await getRuntimeConfig();
  const googleEnabled = Boolean(
    runtimeConfig.googleClientId && runtimeConfig.googleClientSecret,
  );

  return [
    ...(googleEnabled
      ? [
          Google({
            clientId: runtimeConfig.googleClientId!,
            clientSecret: runtimeConfig.googleClientSecret!,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim()
            : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            senha: true,
            nome: true,
            name: true,
            avatarUrl: true,
            image: true,
          },
        });

        if (!user?.senha) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.senha);
        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.nome ?? user.email,
          image: user.image ?? user.avatarUrl,
        };
      },
    }),
  ];
}

async function ensureUserDependencies(input: {
  userId: string;
  name?: string | null;
  image?: string | null;
  emailVerifiedAt?: Date | null;
}) {
  await prisma.$transaction(async (tx) => {
    const currentUser = await tx.user.findUnique({
      where: { id: input.userId },
      select: {
        nome: true,
        name: true,
        avatarUrl: true,
        image: true,
        emailVerified: true,
      },
    });

    if (!currentUser) {
      return;
    }

    const nextName = input.name?.trim() || null;
    const nextImage = input.image?.trim() || null;

    const userUpdates: {
      nome?: string;
      name?: string;
      avatarUrl?: string;
      image?: string;
      emailVerified?: Date;
    } = {};

    if (!currentUser.nome && nextName) {
      userUpdates.nome = nextName;
    }

    if (!currentUser.name && nextName) {
      userUpdates.name = nextName;
    }

    if (!currentUser.avatarUrl && nextImage) {
      userUpdates.avatarUrl = nextImage;
    }

    if (!currentUser.image && nextImage) {
      userUpdates.image = nextImage;
    }

    if (!currentUser.emailVerified && input.emailVerifiedAt) {
      userUpdates.emailVerified = input.emailVerifiedAt;
    }

    if (Object.keys(userUpdates).length > 0) {
      await tx.user.update({
        where: { id: input.userId },
        data: userUpdates,
      });
    }

    await tx.balance.upsert({
      where: { userId: input.userId },
      update: {},
      create: {
        userId: input.userId,
        saldoDemo: 10000,
        saldoReal: 0,
      },
    });

    const existingAffiliate = await tx.affiliate.findUnique({
      where: { userId: input.userId },
      select: { id: true },
    });

    if (!existingAffiliate) {
      await tx.affiliate.create({
        data: {
          userId: input.userId,
          tipoComissao: null,
        },
      });
    }
  });
}

export const providerMap = [{ id: "google", name: "Google" }];

export const { auth, handlers, signIn, signOut } = NextAuth(
  async () => {
    const runtimeConfig = await getRuntimeConfig();
    const providers = await buildProviders();

    return {
      ...authConfig,
      adapter: PrismaAdapter(prisma),
      session: { strategy: "jwt" },
      // The session secret must stay readable by middleware, so we use
      // a synchronous stable secret there and keep the DB value only as
      // a backward-compatible fallback during rotation.
      secret: getAuthSessionSecrets(runtimeConfig.authSecret),
      providers,
      callbacks: {
        ...authCallbacks,
        async signIn({ user, account, profile }) {
          if (!user.id) {
            return false;
          }

          const googleProfile = profile as
            | { email_verified?: boolean; name?: string; picture?: string }
            | undefined;

          if (
            account?.provider === "google" &&
            googleProfile?.email_verified === false
          ) {
            return false;
          }

          await ensureUserDependencies({
            userId: user.id,
            name: user.name ?? googleProfile?.name ?? null,
            image: user.image ?? googleProfile?.picture ?? null,
            emailVerifiedAt:
              account?.provider === "google" && googleProfile?.email_verified
                ? new Date()
                : null,
          });

          return true;
        },
      },
    };
  },
);
