import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    // --- Google OAuth ---
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // --- Compte admin ---
    Credentials({
      id: "admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminEmail || !adminPassword) return null;
        if (credentials?.email === adminEmail && credentials?.password === adminPassword) {
          return { id: "admin", name: "Admin", email: adminEmail, role: "admin" };
        }
        return null;
      },
    }),

    // --- Compte artisan email/password ---
    Credentials({
      id: "artisan",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Bloquer le compte admin de ce provider
        if (String(credentials.email) === process.env.ADMIN_EMAIL) return null;

        const artisan = await prisma.artisan.findFirst({
          where: { email: String(credentials.email), deletedAt: null },
        });
        if (!artisan?.passwordHash) return null;

        const valid = await bcrypt.compare(String(credentials.password), artisan.passwordHash);
        if (!valid) return null;

        const draft = artisan.draftData as Record<string, unknown> | null;
        const isParticulier = draft?.isParticulier === true;

        return {
          id: artisan.id,
          name: artisan.raisonSociale ?? `${artisan.prenom} ${artisan.nom}`,
          email: artisan.email,
          role: isParticulier ? "particulier" : "artisan",
        };
      },
    }),
  ],

  pages: {
    signIn: "/connexion",
  },

  callbacks: {
    async signIn({ user, account }) {
      // OAuth Google — créer ou retrouver l'artisan
      if (account?.provider === "google" && user.email) {
        let artisan = await prisma.artisan.findFirst({
          where: { email: user.email, deletedAt: null },
          select: {
            id: true,
            prenom: true,
            nom: true,
            status: true,
            draftData: true,
            metiers: { take: 1 },
          },
        });

        let isNew = false;
        if (!artisan) {
          const [prenom = "", ...rest] = (user.name ?? "").split(" ");
          const nom = rest.join(" ") || "—";
          artisan = await prisma.artisan.create({
            data: {
              email: user.email,
              prenom,
              nom,
              // Google a déjà vérifié l'email → fiche directement publiable
              status: "VALIDE",
            },
            select: {
              id: true,
              prenom: true,
              nom: true,
              status: true,
              draftData: true,
              metiers: { take: 1 },
            },
          });
          isNew = true;
        }

        // Artisan Google existant encore EN_ATTENTE (cas de migration) → auto-valider
        if (!isNew && artisan.status === "EN_ATTENTE") {
          await prisma.artisan.update({
            where: { id: artisan.id },
            data: { status: "VALIDE" },
          });
          artisan = { ...artisan, status: "VALIDE" };
        }

        // Lier le compte OAuth s'il ne l'est pas encore
        const existing = await prisma.oAuthAccount.findUnique({
          where: {
            provider_providerAccountId: {
              provider: "google",
              providerAccountId: account.providerAccountId,
            },
          },
        });
        if (!existing) {
          await prisma.oAuthAccount.create({
            data: {
              artisanId: artisan.id,
              provider: "google",
              providerAccountId: account.providerAccountId,
              access_token: account.access_token ?? null,
              refresh_token: account.refresh_token ?? null,
              expires_at: account.expires_at ?? null,
            },
          });
        }

        // Injecter id + role dans le user pour le JWT
        user.id = artisan.id;
        // Si ce compte a déjà été marqué comme particulier, on conserve ce rôle
        const draft = artisan.draftData as Record<string, unknown> | null;
        if (draft?.isParticulier === true) {
          (user as { role?: string }).role = "particulier";
        } else {
          (user as { role?: string }).role = "artisan";
          // needsSetup uniquement pour les vrais nouveaux comptes Google.
          // Les artisans existants avec profil incomplet accèdent à mon-espace directement.
          if (isNew) (user as { needsSetup?: boolean }).needsSetup = true;
        }
      }
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        if (user.id) token.sub = user.id;
        if ((user as { needsSetup?: boolean }).needsSetup) token.needsSetup = true;
      }
      // Effacement du flag après choix de profil côté client
      if (trigger === "update" && (session as { clearSetup?: boolean })?.clearSetup) {
        delete token.needsSetup;
      }
      // Passage en mode particulier
      if (trigger === "update" && (session as { becomeParticulier?: boolean })?.becomeParticulier) {
        token.role = "particulier";
        delete token.needsSetup;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { id?: string }).id = token.sub;
        (session.user as { needsSetup?: boolean }).needsSetup = token.needsSetup as
          | boolean
          | undefined;
      }
      return session;
    },
  },

  session: { strategy: "jwt" },
});
