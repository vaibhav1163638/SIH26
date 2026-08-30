import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { Farm } from '@/models/Farm';
// Assuming we have an Alert model, if not, we can return an empty array for now
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    
    // Check if Alert model exists
    if (!mongoose.models.Alert) {
        return NextResponse.json([]);
    }
    
    const Alert = mongoose.models.Alert;
    const alerts = await Alert.find({ farmerId: user._id }).sort({ createdAt: -1 });

    return NextResponse.json(alerts);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}
