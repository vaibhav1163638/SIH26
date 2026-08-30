import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Farm } from '@/models/Farm';
import { getUserFromRequest } from '@/lib/auth';
import { getWeather } from '@/lib/weather';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    console.log('[WEATHER] farmerId:', user._id);

    await connectDB();
    const farm = await Farm.findOne({ farmerId: user._id });

    if (!farm) {
      console.error('[WEATHER] No farm found for farmerId:', user._id);
      return NextResponse.json({ success: false, error: 'Farm not found' }, { status: 404 });
    }

    console.log('[WEATHER] farmId:', farm._id);

    if (!farm.location || farm.location.latitude == null || farm.location.longitude == null) {
      console.error('[WEATHER] Location missing for farmId:', farm._id);
      return NextResponse.json({
        success: false,
        source: 'none',
        error: 'Location not set in farm profile',
      }, { status: 400 });
    }

    const lat = farm.location.latitude;
    const lng = farm.location.longitude;
    console.log('[WEATHER] MongoDB coordinates:', { lat, lng });

    console.log('[WEATHER] Requesting OpenWeather API for:', { lat, lng });
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
