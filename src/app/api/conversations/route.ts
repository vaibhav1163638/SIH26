import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { Conversation } from '@/models/Conversation';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    const conversations = await Conversation.find({ farmerId: user._id })
      .select('_id title createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({ success: true, conversations });
  } catch (err: any) {
    console.error('[CONVERSATIONS ERROR]', err);
    return NextResponse.json({ success: false, error: 'Failed to retrieve conversations' }, { status: 500 });
  }
}
