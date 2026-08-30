import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Scan } from '@/models/Scan';
import { Farm } from '@/models/Farm';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    
    // Fetch latest scan
    const latestScan = await Scan.findOne({ farmerId: user._id }).sort({ scanDate: -1 });

    if (!latestScan) {
      return NextResponse.json({
        crop: "Unknown",
        disease: "None",
        severity: 0,
        recommendations: ["Upload a crop image to receive disease-specific guidance."]
      });
    }

    const farm = await Farm.findOne({ farmerId: user._id });
    
    return NextResponse.json({
      crop: farm?.crop || 'Unknown',
      disease: latestScan.disease,
      severity: latestScan.severity,
      recommendations: latestScan.recommendations || []
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}
