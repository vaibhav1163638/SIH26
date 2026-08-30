import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Scan } from '@/models/Scan';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resolvedParams = await params;
    const { id } = resolvedParams;
    await connectDB();
    
    const scan = await Scan.findOne({ _id: id, farmerId: user._id });
    if (scan) {
      return NextResponse.json(scan);
    }
    
    return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch scan' }, { status: 500 });
  }
}
