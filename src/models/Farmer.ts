import mongoose, { Schema, Document } from 'mongoose';

export interface IFarmer extends Document {
  name: string;
  phone: string;
  email: string;
  password?: string;
  googleId?: string;
  image?: string;
  location: {
    state: string;
    district: string;
    village: string;
    coordinates?: { lat: number; lng: number };
  };
  language: 'en' | 'hi';
  theme: 'dark' | 'light';
  createdAt: Date;
  updatedAt: Date;
}

const FarmerSchema = new Schema<IFarmer>(
  {
    name: { type: String, required: true },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    password: { type: String, required: false },
    googleId: { type: String },
    image: { type: String },
    location: {
      state: { type: String, required: true },
      district: { type: String, default: '' },
      village: { type: String, default: '' },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    language: { type: String, enum: ['en', 'hi'], default: 'en' },
    theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
  },
  { timestamps: true }
);

export const Farmer = mongoose.models.Farmer || mongoose.model<IFarmer>('Farmer', FarmerSchema);
