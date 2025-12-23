// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5001";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email || "").trim().toLowerCase();
        const password = String(credentials?.password || "");

        if (!email || !password) return null;

        const resp = await fetch(`${BACKEND_URL}/engine/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!resp.ok) return null;

        const data = (await resp.json()) as any;
        if (!data?.ok || !data?.user) return null;

        return {
          id: String(data.user.id),
          name: data.user.name,
          email: data.user.email,
          isActive: Boolean(data.user.isActive),
        } as any;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as any).id = (user as any).id;
        (token as any).isActive = (user as any).isActive ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token as any).id;
        (session.user as any).isActive = (token as any).isActive;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
