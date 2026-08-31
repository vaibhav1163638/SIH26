import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Farm } from '@/models/Farm';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    console.log('[LOCATION] authenticated farmer:', user._id);

    const body = await req.json();
    const { source } = body;
    let { latitude, longitude, state, district } = body;
    console.log('[LOCATION] received latitude:', latitude);
    console.log('[LOCATION] received longitude:', longitude);
    
    let city = '';
    let finalState = '';
    let finalDistrict = '';

    if (source === 'manual') {
      if (!state || !district) {
        return NextResponse.json({ error: 'State and District are required for manual entry' }, { status: 400 });
      }
      finalState = state;
      finalDistrict = district;
      city = district;

      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&state=${encodeURIComponent(state)}&city=${encodeURIComponent(district)}&limit=1`;
        const response = await fetch(url, { headers: { 'User-Agent': 'AgroSarthi-SIH-2026' } });
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            latitude = parseFloat(data[0].lat);
            longitude = parseFloat(data[0].lon);
          } else {
            return NextResponse.json({ error: 'Location not found' }, { status: 400 });
          }
        } else {
          return NextResponse.json({ error: 'Geocoding service unavailable' }, { status: 500 });
        }
      } catch (err) {
        return NextResponse.json({ error: 'Geocoding service unavailable' }, { status: 500 });
      }
    } else {
      if (latitude === undefined || longitude === undefined || isNaN(latitude) || isNaN(longitude)) {
        return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 });
      }
      
      latitude = parseFloat(latitude);
      longitude = parseFloat(longitude);
      
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
      }
    }

    await connectDB();

    console.log('[LOCATION API] Request received');
    console.log(`[LOCATION API] Authenticated user:
id: ${user._id}
email: ${user.email}
name: ${user.name}`);

    console.log(`[LOCATION API] Received coordinates:
latitude: ${latitude}
longitude: ${longitude}`);

    console.log('[LOCATION API] Farmer found:\nfarmerId:', user._id);
    
    let farm = await Farm.findOne({ farmerId: user._id });
    
    if (farm) {
      console.log(`[LOCATION API] Farm before update:
farmId: ${farm._id}
existingLatitude: ${farm.location?.latitude}
existingLongitude: ${farm.location?.longitude}`);
    } else {
      console.log('[LOCATION API] No existing farm found, creating new one...');
      farm = new Farm({
        farmerId: user._id,
        farmerName: user.name || 'Unknown',
        location: {
          latitude: null,
          longitude: null,
        }
      });
    }

    console.log('[LOCATION API] Updating Farm...');
    
    if (!farm.location) {
        farm.location = {};
    }
    
    // SAVE GPS CRITICAL DATA FIRST
    farm.location.latitude = latitude;
    farm.location.longitude = longitude;
    farm.location.source = source === 'manual' ? 'manual' : 'gps';
    if (finalState) farm.location.state = finalState;
    if (finalDistrict) farm.location.district = finalDistrict;
    if (city) farm.location.village = city;

    await farm.save();

    console.log(`[LOCATION API] Farm after save:
farmId: ${farm._id}
savedLatitude: ${farm.location.latitude}
savedLongitude: ${farm.location.longitude}`);

    const verifiedFarm = await Farm.findOne({ farmerId: user._id }).lean();
    console.log(`[LOCATION API] Verification query result:
latitude: ${verifiedFarm?.location?.latitude}
longitude: ${verifiedFarm?.location?.longitude}`);

    if (verifiedFarm?.location?.latitude !== latitude || verifiedFarm?.location?.longitude !== longitude) {
      throw new Error("Location was not persisted to MongoDB");
    }

    // OPTIONAL REVERSE GEOCODING AFTER CRITICAL SAVE
    if (source !== 'manual') {
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`;
        const response = await fetch(url, { headers: { 'User-Agent': 'AgroSarthi-SIH-2026' } });
        
        if (response.ok) {
          const data = await response.json();
          if (data.address) {
            city = data.address.city || data.address.town || data.address.village || '';
            finalDistrict = data.address.county || data.address.state_district || city || '';
            finalState = data.address.state || '';
            console.log('[LOCATION] reverse geocoding result:', { city, finalDistrict, finalState });
            
            // Re-fetch, apply, save again so we don't overwrite if parallel modifications occurred
            let rFarm = await Farm.findOne({ farmerId: user._id });
            if (rFarm) {
               rFarm.location.state = finalState;
               rFarm.location.district = finalDistrict;
               rFarm.location.village = city;
               await rFarm.save();
            }
          }
        }
      } catch (geocodeError) {
         console.warn('[LOCATION] Optional reverse geocoding failed, but GPS is safely saved.', geocodeError);
      }
    }

    const finalFarmData = await Farm.findOne({ farmerId: user._id }).lean();

    return NextResponse.json({ 
      success: true, 
      location: {
        latitude: finalFarmData.location.latitude,
        longitude: finalFarmData.location.longitude,
        source: finalFarmData.location.source
      }
    });
  } catch (err) {
    console.error('[LOCATION API]', err);
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
  }
}
