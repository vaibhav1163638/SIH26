import mongoose, { Schema, Document } from 'mongoose';

export interface IScan extends Document {
  farmerId: mongoose.Types.ObjectId;
  farmId: mongoose.Types.ObjectId;
  crop: string;
  imageUrl: string;
  disease: string;
  confidence: number;
  severity: number;
  affectedArea: number;
  riskLevel: string;
  explanation: string;
  recommendations: string[];
  treatment: {
    immediate: string[];
    organic: string[];
    chemical: string[];
    prevention: string[];
    avoid: string[];
  };
  weatherContext: {
    temperature: number;
    humidity: number;
    rainProbability: number;
    conditions: string;
  };
  isDemo: boolean;
  scanDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ScanSchema = new Schema<IScan>(
  {
    farmerId: { type: Schema.Types.ObjectId, ref: 'Farmer', required: true },
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    crop: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    disease: { type: String, required: true },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    severity: { type: Number, required: true, min: 0, max: 100 },
    affectedArea: { type: Number, default: 0, min: 0, max: 100 },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'],
      required: true,
    },
    explanation: { type: String, default: '' },
    recommendations: [{ type: String }],
    treatment: {
      immediate: [{ type: String }],
      organic: [{ type: String }],
      chemical: [{ type: String }],
      prevention: [{ type: String }],
      avoid: [{ type: String }],
    },
    weatherContext: {
      temperature: { type: Number },
      humidity: { type: Number },
      rainProbability: { type: Number },
      conditions: { type: String },
    },
    isDemo: { type: Boolean, default: true },
    scanDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Scan = mongoose.models.Scan || mongoose.model<IScan>('Scan', ScanSchema);
