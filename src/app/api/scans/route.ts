import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Scan } from '@/models/Scan';
import { Farm } from '@/models/Farm';
import { getUserFromRequest } from '@/lib/auth';
import { analyzeImage } from '@/lib/ai';
import { getWeather } from '@/lib/weather';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const scans = await Scan.find({ farmerId: user._id }).sort({ scanDate: -1 });
    return NextResponse.json(scans);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch scans' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('image') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // Save file locally to public/uploads
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    // Analyze image
    const aiResult = await analyzeImage(buffer, filename, file.type);
    const prediction = aiResult.prediction || aiResult;

    await connectDB();
    const farm = await Farm.findOne({ farmerId: user._id });
    if (!farm) {
       return NextResponse.json({ error: 'Please set up your farm profile first.' }, { status: 400 });
    }

    // Get weather context using real coordinates if available
    let weather;
    if (farm.location?.coordinates?.lat && farm.location?.coordinates?.lng) {
      weather = await getWeather(farm.location.coordinates.lat, farm.location.coordinates.lng);
    } else {
      // Fallback if no location is set
      weather = { current: { temperature: 0, humidity: 0, rainProbability: 0, conditions: 'Unknown' } };
    }

    // Build treatment recommendations
    const treatment = {
      immediate: [
        prediction.disease === 'Healthy'
          ? 'No immediate action required. Continue regular monitoring.'
          : `Begin treatment for ${prediction.disease} as soon as weather permits.`,
      ],
      organic: [
        'Apply neem oil spray as a preventive/curative measure',
        'Use compost tea as a foliar spray to boost plant immunity',
      ],
      chemical: [
        'Consult your local agricultural extension officer for approved products',
        'Always follow product label instructions for application rates',
      ],
      prevention: [
        'Maintain proper plant spacing for air circulation',
        'Use mulch to prevent soil splash',
        'Practice crop rotation',
      ],
      avoid: [
        'Do not overhead water — use drip irrigation',
        'Do not compost diseased plant material',
        'Avoid working with plants when foliage is wet',
      ],
    };

    const scanData = {
      farmerId: user._id,
      farmId: farm._id,
      crop: farm.crop || 'Unknown',
      imageUrl: `/uploads/${filename}`,
      disease: prediction.disease,
      confidence: prediction.confidence,
      severity: prediction.severity,
      affectedArea: prediction.affected_area || prediction.severity * 0.85,
      riskLevel: prediction.risk_level,
      explanation: prediction.explanation,
      recommendations: aiResult.recommendations || [],
      treatment,
      weatherContext: {
        temperature: weather.current.temperature,
        humidity: weather.current.humidity,
        rainProbability: weather.current.rainProbability,
        conditions: weather.current.conditions,
      },
      isDemo: false,
      scanDate: new Date(),
    };

    const scan = new Scan(scanData);
    await scan.save();
    return NextResponse.json({ ...scan.toObject(), id: scan._id });
  } catch (err) {
    console.error('[SCAN] Error:', err);
    return NextResponse.json({ error: 'Failed to process scan' }, { status: 500 });
  }
}
