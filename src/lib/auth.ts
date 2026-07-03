import type { NextAuthOptions } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { mapGoogleProfile } from "@/lib/auth/google-profile";
import { prisma } from "@/lib/db";

const credentialsSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8),
});

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        expectedRole: { label: "Expected Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email).toLowerCase();
        const password = String(credentials.password);
        const expectedRole = credentials.expectedRole;

        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user?.isActive || !user.passwordHash) {
          return null;
        }
        if (!user.isApproved) {
          return null;
        }
        if (expectedRole && user.role !== expectedRole) {
          return null;
        }

        const isValid = await bcrypt.compare(
          password,
          user.passwordHash,
        );
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
    ...(googleClientId && googleClientSecret
      ? [
          GoogleProvider({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            allowDangerousEmailAccountLinking: true,
            profile: mapGoogleProfile,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider === "google") {
        if (profile && "email_verified" in profile && profile.email_verified === false) {
          return false;
        }

        if (!user.email) return false;
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email.toLowerCase() },
          select: { id: true, isActive: true, isApproved: true, emailVerified: true },
        });
        if (dbUser && !dbUser.isActive) return false;
        if (dbUser && !dbUser.isApproved) return false;
        if (dbUser && !dbUser.emailVerified) {
          await prisma.user.update({
            where: { id: dbUser.id },
            data: { emailVerified: new Date() },
          });
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email.toLowerCase() },
          select: { id: true, role: true, emailVerified: true },
        });
        token.id = dbUser?.id ?? user.id;
        token.role = dbUser?.role ?? user.role;
        token.emailVerified = dbUser?.emailVerified?.toISOString() ?? null;
      } else if (token.email && (!token.id || !token.role)) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email.toLowerCase() },
          select: { id: true, role: true, emailVerified: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.emailVerified = dbUser.emailVerified?.toISOString() ?? null;
        }
      } else if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id && token.role) {
        session.user.id = String(token.id);
        session.user.role = token.role;
        session.user.emailVerified = token.emailVerified
          ? new Date(String(token.emailVerified))
          : null;
      }
      return session;
    },
  },
};
