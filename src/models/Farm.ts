import mongoose, { Schema, Document } from 'mongoose';

export interface IFarm extends Document {
  farmerId: mongoose.Types.ObjectId;
  farmerName: string;
  location: {
    latitude: number;
    longitude: number;
    state: string;
    district: string;
    village: string;
    country: string;
    source: string;
  };
  crop: string;
  cropVariety: string;
  farmArea: number;
  farmAreaUnit: string;
  plantingDate: Date;
  cropAge: number;
  growthStage: string;
  irrigationMethod: string;
  soilType: string;
  previousDiseases: string[];
  previousTreatments: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const FarmSchema = new Schema<IFarm>(
  {
    farmerId: { type: Schema.Types.ObjectId, ref: 'Farmer', required: true },
    farmerName: { type: String, required: true },
    location: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      state: { type: String, default: '' },
      district: { type: String, default: '' },
      village: { type: String, default: '' },
      country: { type: String, default: 'India' },
      source: { type: String, enum: ['gps', 'manual'], default: 'manual' },
    },
    crop: { type: String, default: '' },
    cropVariety: { type: String, default: '' },
    farmArea: { type: Number, default: 0 },
    farmAreaUnit: { type: String, default: 'acres' },
    plantingDate: { type: Date, default: null },
    cropAge: { type: Number, default: 0 },
    growthStage: {
      type: String,
      enum: ['seedling', 'vegetative', 'flowering', 'fruiting', 'maturity', 'harvest'],
      default: 'vegetative',
    },
    irrigationMethod: {
      type: String,
      enum: ['drip', 'sprinkler', 'flood', 'rainfed', 'furrow'],
      default: 'drip',
    },
    soilType: { type: String, default: 'loamy' },
    previousDiseases: [{ type: String }],
    previousTreatments: [{ type: String }],
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

// Virtual to calculate crop age
FarmSchema.pre('save', function(this: IFarm) {
  if (this.plantingDate) {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.plantingDate.getTime());
    this.cropAge = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
});

export const Farm = mongoose.models.Farm || mongoose.model<IFarm>('Farm', FarmSchema);
