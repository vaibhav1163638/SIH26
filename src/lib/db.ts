import mongoose from 'mongoose';
import { Farmer } from '../models/Farmer';
import { Farm } from '../models/Farm';
import { Scan } from '../models/Scan';
import { Alert, RegionalReport } from '../models/Alert';
import { demoFarmer, demoFarm, demoScans, demoAlerts, demoRegionalReports } from './demoData';

let isConnected = false;
let isDemoMode = true;

declare global {
  var mongoose: any;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function seedDatabase() {
  try {
    await Farmer.updateOne({ _id: demoFarmer._id }, { $set: demoFarmer }, { upsert: true });
    await Farm.updateOne({ _id: demoFarm._id }, { $set: demoFarm }, { upsert: true });
    for (const scan of demoScans) {
      await Scan.updateOne({ _id: scan._id }, { $set: scan }, { upsert: true });
    }
    for (const alert of demoAlerts) {
      await Alert.updateOne({ _id: alert._id }, { $set: alert }, { upsert: true });
    }
    for (const report of demoRegionalReports) {
      await RegionalReport.updateOne({ _id: report._id }, { $set: report }, { upsert: true });
    }
    console.log('[DB] Demo data successfully seeded/verified in MongoDB.');
  } catch (err) {
    console.error('[DB] Failed to seed database:', err);
  }
}

export async function connectDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.log('[DB] No MONGODB_URI set. Running in DEMO MODE with in-memory data.');
    isDemoMode = true;
    return false;
  }

  if (cached.conn) {
    isConnected = true;
    isDemoMode = false;
    return true;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      dbName: 'sih131',
      serverSelectionTimeoutMS: 5000,
    }).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    isConnected = true;
    isDemoMode = false;
    const dbName = mongoose.connection.name;
    console.log(`[DB] MongoDB: Connected`);
    console.log(`[DB] Database: ${dbName}`);
    
    // Attempt seed, but don't fail connection if it errors
    seedDatabase().catch(err => console.error('[DB] Seed error:', err));
    
    return true;
  } catch (err) {
    console.log('[DB] Failed to connect to MongoDB. Running in DEMO MODE fallback.', err);
    cached.promise = null;
    isDemoMode = true;
    return false;
  }
}

export function getIsConnected(): boolean {
  return isConnected;
}

export function getIsDemoMode(): boolean {
  return isDemoMode;
}
