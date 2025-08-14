import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: { user: any, account: any, profile?: any }) {
      // Only allow sign in if the user's GitHub username is 'chwhox3-0309'
      if (profile?.login === 'chwhox3-0309') {
        return true;
      } else {
        // Return false to deny sign in
        return false;
      }
    },
    async session({ session, token, user }: { session: any, token: any, user: any }) {
      // Add GitHub username to the session object
      if (token.provider === 'github') {
        session.user.githubUsername = token.username;
      }
      return session;
    },
    async jwt({ token, user, account, profile }: { token: any, user: any, account?: any, profile?: any }) {
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
