import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Scan } from '@/models/Scan';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    
    // Fetch all scans for the user, sorted by date (newest first)
    const dbScans = await Scan.find({ farmerId: user._id }).sort({ scanDate: -1 });
    
    if (dbScans.length === 0) {
      return NextResponse.json({ scans: [], summary: { totalScans: 0 } });
    }

    // Convert MongoDB documents to timeline items
    const timelineScans = dbScans.map(scan => ({
      _id: scan._id,
      imageUrl: scan.imageUrl || '/images/demo/tomato-healthy.jpg',
      disease: scan.disease,
      severity: scan.severity,
      scanDate: scan.scanDate.toISOString(),
      recommendations: scan.recommendations || []
    }));

    return NextResponse.json({ 
      scans: timelineScans, 
      summary: { totalScans: timelineScans.length } 
    });
  } catch (err) {
    console.error('[TIMELINE] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch timeline' }, { status: 500 });
  }
}
