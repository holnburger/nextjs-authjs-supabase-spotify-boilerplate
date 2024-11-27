import NextAuth from "next-auth";
import type { DefaultSession, Session } from "next-auth";
import spotifyProfile, { refreshAccessToken } from "./SpotifyProfile";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import jwt from "jsonwebtoken";

export type AuthUser = DefaultSession["user"] & {
  access_token: string;
  token_type: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  scope: string;
  id: string;
  supabaseAccessToken?: string;
};

declare module "next-auth" {
  interface Session {
    user: AuthUser;
    error?: string;
  }
}

const createSupabaseToken = (sub: string, email: string | null) => {
  if (!process.env.SUPABASE_JWT_SECRET) return undefined;

  return jwt.sign(
    {
      aud: "authenticated",
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      sub,
      email,
      role: "authenticated",
    },
    process.env.SUPABASE_JWT_SECRET
  );
};

export const { handlers, auth } = NextAuth({
  providers: [spotifyProfile],
  adapter: SupabaseAdapter({
    url: process.env.SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, account }) {
      if (token.sub) {
        token.supabaseAccessToken = createSupabaseToken(
          token.sub,
          token.email as string
        );
      }

      if (account) {
        const now = Math.floor(Date.now() / 1000);
        return {
          ...token,
          access_token: account.access_token,
          token_type: account.token_type,
          expires_at: now + (account.expires_in ?? 3600),
          expires_in: account.expires_in ?? 3600,
          refresh_token: account.refresh_token,
          scope: account.scope,
          id: account.providerAccountId,
        };
      }

      const now = Math.floor(Date.now() / 1000);
      if ((token.expires_at as number) <= now) {
        const refreshedToken = await refreshAccessToken(token);
        return refreshedToken.error
          ? { ...token, error: refreshedToken.error as string }
          : refreshedToken;
      }

      return { ...token, expires_in: (token.expires_at as number) - now };
    },

    async session({ session, token }): Promise<Session> {
      return {
        ...session,
        user: {
          ...session.user,
          access_token: token.access_token as string,
          token_type: token.token_type as string,
          expires_at: token.expires_at as number,
          expires_in: token.expires_in as number,
          refresh_token: token.refresh_token as string,
          scope: token.scope as string,
          id: token.id as string,
          supabaseAccessToken: token.supabaseAccessToken as string | undefined,
        } as AuthUser,
        error: token.error as string | undefined,
      };
    },
  },
  pages: { signIn: "/login" },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
});
