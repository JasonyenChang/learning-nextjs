import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import type { User } from '@/app/lib/definitions';
// import bcrypt from 'bcrypt';
 
async function getUser(email: string): Promise<User | undefined> {
  try {
    console.log('## get user credentials ##');
    const user = [{ id: "001", name: "Jason Chang", email: "jason@engineerforce.io", password: "123456" }]
    return user[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}
 
export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);
 
          if (parsedCredentials.success) {
            const { email, password } = parsedCredentials.data;
            const user = await getUser(email);
            if (!user) return null;
            // const passwordsMatch = await bcrypt.compare(password, user.password);
            // console.log("## passwordsMatch ##", passwordsMatch)
   
            if (password === user.password) return user;
          }
   
          console.log('## Invalid credentials ##');
          return null;
      },
    }),
  ],
});