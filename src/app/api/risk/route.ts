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
        riskScore: 0,
        riskLevel: 'Low',
        factors: [
          { name: 'Crop History', impact: 'low', description: 'Complete your first crop scan to calculate disease-specific risk.' }
        ]
      });
    }

    const farm = await Farm.findOne({ farmerId: user._id });

    // Calculate dynamic risk based on real data
    const severity = latestScan.severity || 0;
    const diseaseScore = latestScan.disease !== 'Healthy' ? severity * 0.5 : 0;
    
    // Add 10 for any crop as baseline
    const cropScore = farm?.crop ? 10 : 0;
    
    const totalScore = Math.min(100, Math.round(diseaseScore + cropScore));
    let level = 'Low';
    if (totalScore > 70) level = 'High';
    else if (totalScore > 40) level = 'Moderate';

    const factors = [
      {
        name: 'Current Disease Activity',
        impact: diseaseScore > 30 ? 'high' : (diseaseScore > 10 ? 'moderate' : 'low'),
        description: `Based on your latest scan showing ${latestScan.disease} (${Math.round(severity)}% severity).`,
      },
      {
        name: 'Growth Stage Vulnerability',
        impact: 'moderate',
        description: `Your crop is currently at the ${farm?.growthStage || 'unknown'} stage.`,
      }
    ];

    return NextResponse.json({
      riskScore: totalScore,
      riskLevel: level,
      factors
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to calculate risk' }, { status: 500 });
  }
}
