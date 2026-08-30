import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { Conversation } from '@/models/Conversation';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(req);
    const resolvedParams = await params;
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    const conversation = await Conversation.findOne({ _id: resolvedParams.id, farmerId: user._id }).lean();
    if (!conversation) {
      return NextResponse.json({ success: false, error: 'Conversation not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true, conversation });
  } catch (err: any) {
    console.error('[CONVERSATION ERROR]', err);
    return NextResponse.json({ success: false, error: 'Failed to retrieve conversation' }, { status: 500 });
  }
}
