import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Farm } from '@/models/Farm';
import { getUserFromRequest } from '@/lib/auth';
import { getWeather } from '@/lib/weather';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const farm = await Farm.findOne({ farmerId: user._id });

    if (!farm || !farm.location || !farm.location.coordinates) {
      return NextResponse.json({
        success: false,
        source: 'none',
        error: 'Location not set in farm profile',
      }, { status: 400 });
    }

    const { lat, lng } = farm.location.coordinates;
    const weatherData = await getWeather(lat, lng);

    return NextResponse.json({
      success: true,
      source: 'openweather',
      location: {
        latitude: lat,
        longitude: lng,
        city: farm.location.district || 'Unknown',
        state: farm.location.state || 'Unknown',
      },
      weather: weatherData.current
    });
  } catch (err: any) {
    console.error('[WEATHER API]', err);
    return NextResponse.json({
      success: false,
      source: 'openweather',
      error: err.message || 'Live weather unavailable'
    }, { status: 500 });
  }
}
