import { DefaultSession } from 'next-auth';
import { JWT as NextAuthJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user?: {
      githubUsername?: string;
    } & DefaultSession['user'];
  }

  interface JWT extends NextAuthJWT {
    username?: string;
    provider?: string;
  }
}