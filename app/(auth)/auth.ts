import { compare } from 'bcrypt-ts';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import Discord from 'next-auth/providers/discord';
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from '@/lib/db/queries';
import { user, account, session, verificationToken } from '@/lib/db/schema';

import { getUser } from '@/lib/db/queries';
import { authConfig } from './auth.config';

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role?: string; // Add this line
    }
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db, {
    usersTable: user,
    accountsTable: account,
    sessionsTable: session,
    verificationTokensTable: verificationToken,
  }),
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: '/login',
    error: '/error',
  },
  providers: [
    Credentials({
      async authorize(credentials: any) {
        const { email, password } = credentials;
        const users = await getUser(email);
        if (users.length === 0) return null;
        const user = users[0];
        if (!user.password) return null;
        const passwordsMatch = await compare(password, user.password);
        if (!passwordsMatch) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (user) return true;
      return false;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
});
