const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/sih131');
  console.log('Connected to DB');

  const Schema = mongoose.Schema;
  const FarmSchema = new Schema(
    {
      farmerId: { type: Schema.Types.ObjectId, ref: 'Farmer', required: true },
      farmerName: { type: String, required: true },
      location: {
        latitude: { type: Number, default: 0 },
        longitude: { type: Number, default: 0 },
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

  const Farm = mongoose.models.Farm || mongoose.model('Farm', FarmSchema);

  try {
    const farm = new Farm({
      farmerId: new mongoose.Types.ObjectId(),
      farmerName: 'Test Farmer',
    });
    await farm.save();
    console.log('Saved successfully:', farm);
  } catch (err) {
    console.error('Save error:', err.message, err.stack);
  }
  process.exit(0);
}
run();
