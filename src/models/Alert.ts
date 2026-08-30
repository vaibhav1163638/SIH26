import mongoose, { Schema, Document } from 'mongoose';

export interface IAlert extends Document {
  farmerId: mongoose.Types.ObjectId;
  type: 'disease_risk' | 'weather_risk' | 'follow_up' | 'treatment_window' | 'regional_outbreak';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  titleHi: string;
  messageHi: string;
  isRead: boolean;
  relatedScanId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema = new Schema<IAlert>(
  {
    farmerId: { type: Schema.Types.ObjectId, ref: 'Farmer', required: true },
    type: {
      type: String,
      enum: ['disease_risk', 'weather_risk', 'follow_up', 'treatment_window', 'regional_outbreak'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'info',
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    titleHi: { type: String, default: '' },
    messageHi: { type: String, default: '' },
    isRead: { type: Boolean, default: false },
    relatedScanId: { type: Schema.Types.ObjectId, ref: 'Scan' },
  },
  { timestamps: true }
);

export const Alert = mongoose.models.Alert || mongoose.model<IAlert>('Alert', AlertSchema);


export interface IRegionalReport extends Document {
  region: string;
  state: string;
  district: string;
  disease: string;
  reportCount: number;
  severity: string;
  coordinates: { lat: number; lng: number };
  isDemo: boolean;
  reportDate: Date;
  createdAt: Date;
}

const RegionalReportSchema = new Schema<IRegionalReport>(
  {
    region: { type: String, required: true },
    state: { type: String, required: true },
    district: { type: String, default: '' },
    disease: { type: String, required: true },
    reportCount: { type: Number, required: true },
    severity: { type: String, enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'], default: 'MODERATE' },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    isDemo: { type: Boolean, default: true },
    reportDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const RegionalReport = mongoose.models.RegionalReport || mongoose.model<IRegionalReport>('RegionalReport', RegionalReportSchema);
