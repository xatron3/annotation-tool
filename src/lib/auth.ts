// lib/auth.ts
import NextAuth, { NextAuthOptions, Session } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  // ─── Persist Users & Accounts via Prisma ───
  adapter: PrismaAdapter(prisma),

  // ─── Use JWTs for session, not DB rows ───
  session: { strategy: "jwt" },

  // ─── One OAuth provider ───
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: { params: { scope: "read:user user:email" } },
    }),
  ],

  // ─── Required to sign your tokens ───
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    // 1) On first sign-in, NextAuth (via the adapter) creates your User & Account.
    //    Here we grab `user.id` and stash it into the JWT payload.
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    // 2) Whenever you call getSession/useSession, read `id` back out of the JWT
    //    and stick it on session.user.id
    async session({ session, token }) {
      // token.id will always be set by the jwt() callback above
      session.user.id = token.id as string;
      return session as Session;
    },
  },
};
export default NextAuth(authOptions);
