import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextRequest } from 'next/server';

export async function getUserFromRequest(req?: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (session && session.user && (session.user as any).farmerId) {
    return {
      _id: (session.user as any).farmerId,
      name: session.user.name,
      email: session.user.email,
    };
  }
  
  return null;
}
