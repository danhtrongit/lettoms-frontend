import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe auth config (no DB / argon2 imports).
 * Used by middleware and extended by the full config in auth.ts.
 */
export const authConfig = {
  pages: {
    signIn: "/dang-nhap",
  },
  session: { strategy: "jwt" },
  providers: [], // real providers added in auth.ts
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "customer";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? "customer";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
