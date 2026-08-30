import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Farm } from '@/models/Farm';
import { getUserFromRequest } from '@/lib/auth';
import { getWeather } from '@/lib/weather';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    console.log('[WEATHER] farmer:', user._id);

    await connectDB();
    const farm = await Farm.findOne({ farmerId: user._id });

    if (!farm || !farm.location || typeof farm.location.latitude !== 'number' || typeof farm.location.longitude !== 'number' || (farm.location.latitude === 0 && farm.location.longitude === 0)) {
      return NextResponse.json({
        success: false,
        source: 'none',
        error: 'Location not set in farm profile',
      }, { status: 400 });
    }

    const lat = farm.location.latitude;
    const lng = farm.location.longitude;
    console.log('[WEATHER] latitude from MongoDB:', lat);
    console.log('[WEATHER] longitude from MongoDB:', lng);

    const weatherData = await getWeather(lat, lng);

    return NextResponse.json(weatherData);
  } catch (err: any) {
    console.error('[WEATHER API]', err);
    return NextResponse.json({
      success: false,
      source: 'openweather',
      error: err.message || 'Live weather unavailable'
    }, { status: 500 });
  }
}
