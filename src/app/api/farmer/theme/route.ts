import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Farmer } from '@/models/Farmer';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { theme } = await req.json();
    if (!['dark', 'light'].includes(theme)) {
      return NextResponse.json({ error: 'Invalid theme value' }, { status: 400 });
    }

    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    const updateResult = await Farmer.updateOne(
      { _id: user._id },
      { $set: { theme } },
    );

    console.log('[THEME] farmer before update:', { farmerId: user._id, theme });
    console.log('[THEME] MongoDB update result:', updateResult);

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json({ error: 'Theme not updated' }, { status: 500 });
    }

    return NextResponse.json({ success: true, theme });
  } catch (err) {
    console.error('[THEME] error:', err);
    return NextResponse.json({ error: 'Failed to update theme' }, { status: 500 });
  }
}
