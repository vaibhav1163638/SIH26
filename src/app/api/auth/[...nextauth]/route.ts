import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { connectDB } from '@/lib/db';
import { Farmer } from '@/models/Farmer';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID as string,
      clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
    }),
  ],
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await connectDB();
          
          const existingFarmer = await Farmer.findOne({ email: user.email });
          
          if (!existingFarmer) {
            const newFarmer = new Farmer({
              name: user.name,
              email: user.email,
              image: user.image,
              googleId: user.id,
              location: { state: 'Unknown', district: 'Unknown', village: 'Unknown' },
            });
            await newFarmer.save();
          } else {
            // Update image and googleId if they don't exist
            let updated = false;
            if (!existingFarmer.googleId) {
              existingFarmer.googleId = user.id;
              updated = true;
            }
            if (!existingFarmer.image && user.image) {
              existingFarmer.image = user.image;
              updated = true;
            }
            if (updated) {
              await existingFarmer.save();
            }
          }
          return true;
        } catch (error) {
          console.error('[NEXTAUTH] Error in signIn callback:', error);
          return false;
        }
      }
      return false;
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        await connectDB();
        const farmer = await Farmer.findOne({ email: user.email });
        if (farmer) {
          token.farmerId = farmer._id.toString();
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.farmerId) {
        (session.user as any).farmerId = token.farmerId;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
