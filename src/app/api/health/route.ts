import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';

export async function GET() {
  try {
    await connectDB();
    const dbState = mongoose.connection.readyState;
    const isConnected = dbState === 1;

    return NextResponse.json({
      status: 'ok',
      database: isConnected ? 'connected' : 'disconnected',
      demoMode: false,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      database: 'disconnected',
      demoMode: false,
      error: 'Failed to connect to database'
    }, { status: 503 });
  }
}
