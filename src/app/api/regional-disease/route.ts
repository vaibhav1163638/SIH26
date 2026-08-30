import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { Farm } from '@/models/Farm';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    
    // Check if RegionalDiseaseReport model exists
    if (!mongoose.models.RegionalDiseaseReport) {
        return NextResponse.json([]);
    }
    
    const farm = await Farm.findOne({ farmerId: user._id });
    const RegionalDiseaseReport = mongoose.models.RegionalDiseaseReport;

    // If no location is set, don't show any reports
    if (!farm || !farm.location || !farm.location.state) {
      return NextResponse.json([]);
    }

    let query: any = { 'location.state': farm.location.state };

    // Fetch reports for the state
    let reports = await RegionalDiseaseReport.find(query).sort({ reportDate: -1 }).limit(20);
    
    // Sort so same district comes first
    if (farm.location.district) {
      reports = reports.sort((a, b) => {
        const aIsDistrict = a.location?.district === farm.location.district ? -1 : 1;
        const bIsDistrict = b.location?.district === farm.location.district ? -1 : 1;
        return aIsDistrict - bIsDistrict;
      });
    }

    return NextResponse.json(reports.slice(0, 10));
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch regional disease reports' }, { status: 500 });
  }
}
