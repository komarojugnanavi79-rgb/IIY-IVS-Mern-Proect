import mongoose from 'mongoose';

const healthMetricSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['blood_pressure', 'blood_sugar', 'weight', 'note'],
      required: true
    },
    value: { type: String, required: true },
    note: String,
    recordedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model('HealthMetric', healthMetricSchema);

