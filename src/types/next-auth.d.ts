import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user?: {
      githubUsername?: string;
    } & DefaultSession['user'];
  }
}