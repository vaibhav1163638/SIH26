import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Farm } from '@/models/Farm';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const farm = await Farm.findOne({ farmerId: user._id }).lean();

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found for this user' }, { status: 404 });
    }

    return NextResponse.json({
      farmerId: user._id,
      farmId: farm._id.toString(),
      location: {
        latitude: farm.location?.latitude,
        longitude: farm.location?.longitude,
        state: farm.location?.state,
        district: farm.location?.district,
        village: farm.location?.village,
        country: farm.location?.country,
        source: farm.location?.source
      }
    });
  } catch (err: any) {
    console.error('Debug location error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
