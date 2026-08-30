import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Farm } from '@/models/Farm';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { source } = body;
    let { latitude, longitude, state, district } = body;
    let city = 'Unknown';
    let finalState = 'Unknown';
    let finalDistrict = 'Unknown';

    if (source === 'manual') {
      if (!state || !district) {
        return NextResponse.json({ error: 'State and District are required for manual entry' }, { status: 400 });
      }
      finalState = state;
      finalDistrict = district;
      city = district;

      // Forward geocode to get coordinates for weather
      const url = `https://nominatim.openstreetmap.org/search?format=json&state=${encodeURIComponent(state)}&city=${encodeURIComponent(district)}&limit=1`;
      const response = await fetch(url, { headers: { 'User-Agent': 'CropScan-SIH-2026' } });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          latitude = parseFloat(data[0].lat);
          longitude = parseFloat(data[0].lon);
        } else {
          // Fallback if not found
          latitude = 20.5937; // Center of India
          longitude = 78.9629;
        }
      } else {
        latitude = 20.5937;
        longitude = 78.9629;
      }
    } else {
      if (!latitude || !longitude) {
        return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 });
      }
      // Reverse geocode
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`;
      const response = await fetch(url, { headers: { 'User-Agent': 'CropScan-SIH-2026' } });
      
      if (response.ok) {
        const data = await response.json();
        if (data.address) {
          city = data.address.city || data.address.town || data.address.village || 'Location detected';
          finalDistrict = data.address.county || data.address.state_district || city;
          finalState = data.address.state || 'Unknown';
        }
      }
    }

    await connectDB();

    const locationData = {
      state: finalState,
      district: finalDistrict,
      village: city,
      coordinates: { lat: latitude, lng: longitude },
      source: source === 'manual' ? 'manual' : 'gps'
    };

    const farm = await Farm.findOneAndUpdate(
      { farmerId: user._id },
      { location: locationData },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, location: locationData });
  } catch (err) {
    console.error('[LOCATION API]', err);
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
  }
}
