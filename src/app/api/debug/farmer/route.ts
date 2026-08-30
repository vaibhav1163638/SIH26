import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Farmer } from '@/models/Farmer';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    
    const farmer = await Farmer.findOne({ _id: user._id }).lean();
    
    if (!farmer) {
       return NextResponse.json({ error: 'Farmer not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      userId: user._id, 
      farmerId: farmer._id, 
      language: farmer.language 
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
