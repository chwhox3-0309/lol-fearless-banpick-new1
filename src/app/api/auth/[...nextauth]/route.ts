import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import type { Account, Profile, Session, User } from 'next-auth/core/types';
import type { JWT } from 'next-auth/jwt';

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: { user: User, account: Account, profile?: Profile }) {
      // Only allow sign in if the user's GitHub username is 'chwhox3-0309'
      if (profile?.login === 'chwhox3-0309') {
        return true;
      } else {
        // Return false to deny sign in
        return false;
      }
    },
    async session({ session, token, user }: { session: Session, token: JWT, user: User }) {
      // Add GitHub username to the session object
      if (token.provider === 'github') {
        session.user.githubUsername = token.username;
      }
      return session;
    },
    async jwt({ token, user, account, profile }: { token: JWT, user?: User, account?: Account, profile?: Profile }) {
      // Add GitHub username to the JWT token
      if (account?.provider === 'github') {
        token.username = profile?.login;
        token.provider = account.provider;
      }
      return token;
    },
  },
  pages: {
    signIn: '/api/auth/signin', // Custom sign-in page (optional)
    error: '/api/auth/error', // Custom error page (optional)
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
