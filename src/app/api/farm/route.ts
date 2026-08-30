import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Farm } from '@/models/Farm';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    
    // Use findOneAndUpdate with upsert to guarantee idempotency and avoid duplicate farms
    // during concurrent requests on first login.
    let farm = await Farm.findOneAndUpdate(
      { farmerId: user._id },
      {
        $setOnInsert: {
          farmerName: user.name || 'Unknown',
        }
      },
      { 
        new: true, 
        upsert: true, 
        setDefaultsOnInsert: true,
        sort: { createdAt: -1 } 
      }
    );
    
    return NextResponse.json(farm);
  } catch (err: any) {
    console.error('GET /api/farm ERROR:', err.message, err.stack);
    return NextResponse.json({ error: 'Failed to fetch farm' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    await connectDB();

    const farm = await Farm.findOneAndUpdate(
      { farmerId: user._id },
      body,
      { new: true, upsert: true }
    );
    return NextResponse.json(farm);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update farm profile' }, { status: 500 });
  }
}
