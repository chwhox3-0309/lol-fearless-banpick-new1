import type { Account, Profile, Session, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import GithubProvider from 'next-auth/providers/github';

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user: _user, account, profile }: { user: User, account: Account | null, profile?: Profile }) {
      // Only allow sign in if the user's GitHub username is 'chwhox3-0309'
      if ((profile as any)?.login === 'chwhox3-0309') {
        return true;
      } else {
        // Return false to deny sign in
        return false;
      }
    },
    async session({ session, token, user: _user }: { session: Session, token: JWT, user: User }) {
      // Add GitHub username to the session object
      if (session.user && token.provider === 'github') {
        session.user.githubUsername = token.username as string;
      }
      return session;
    },
    async jwt({ token, user: _user, account, profile }: { token: JWT, user?: User, account?: Account | null, profile?: Profile }) {
      // Add GitHub username to the JWT token
      if (account?.provider === 'github') {
        token.username = (profile as any)?.login;
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