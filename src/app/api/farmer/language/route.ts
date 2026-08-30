import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Farmer } from '@/models/Farmer';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { language } = body;

    console.log(`[LANGUAGE] authenticated user ID:`, user._id);
    console.log(`[LANGUAGE] authenticated email:`, user.email);
    console.log(`[LANGUAGE] requested language:`, language);

    if (!language || (language !== 'en' && language !== 'hi')) {
      return NextResponse.json({ error: 'Invalid language code' }, { status: 400 });
    }

    await connectDB();

    const farmer = await Farmer.findOne({ _id: user._id });
    if (!farmer) {
       return NextResponse.json({ error: 'Farmer not found' }, { status: 404 });
    }

    console.log(`[LANGUAGE] farmer ID:`, farmer._id);
    console.log(`[LANGUAGE] farmer language BEFORE:`, farmer.language);

    const updatedFarmer = await Farmer.findOneAndUpdate(
      { _id: user._id },
      { $set: { language: language } },
      { new: true, runValidators: true }
    );

    if (!updatedFarmer) {
      return NextResponse.json({ error: 'Failed to update language' }, { status: 500 });
    }

    console.log(`[LANGUAGE] farmer language AFTER:`, updatedFarmer.language);

    // Verify
    const verifyFarmer = await Farmer.findOne({ _id: user._id }).lean();
    
    console.log(`[LANGUAGE VERIFY] farmerId:`, verifyFarmer?._id);
    console.log(`[LANGUAGE VERIFY] requested language:`, language);
    console.log(`[LANGUAGE VERIFY] database language:`, verifyFarmer?.language);

    if (verifyFarmer?.language !== language) {
       return NextResponse.json({ error: 'Language was not persisted to MongoDB' }, { status: 500 });
    }

    return NextResponse.json({ success: true, language: verifyFarmer.language });
  } catch (err) {
    console.error('[LANGUAGE API ERROR]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
