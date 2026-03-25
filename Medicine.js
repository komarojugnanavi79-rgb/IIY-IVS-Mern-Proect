import mongoose from 'mongoose';

const intakeSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['scheduled', 'taken', 'missed', 'snoozed'],
      default: 'scheduled'
    },
    scheduledAt: { type: Date, required: true },
    takenAt: Date,
    snoozedUntil: Date,
    note: String,
    notifiedAt: Date
  },
  { _id: false }
);

const medicineSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    instructions: String,
    form: { type: String, default: 'Tablet' },
    times: [{ type: String, required: true }],
    frequency: {
      type: String,
      enum: ['daily', 'alternate', 'weekly', 'weekdays', 'monthly', 'custom'],
      default: 'daily'
    },
    mealTiming: {
      type: String,
      enum: ['before_meals', 'after_meals', 'with_meals', 'empty_stomach', 'bedtime', 'anytime'],
      default: 'anytime'
    },
    durationDays: { type: Number, required: true },
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    stock: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    lastLowStockAlertAt: Date,
    reminderWindowMinutes: { type: Number, default: 5 },
    isActive: { type: Boolean, default: true },
    adherence: [intakeSchema]
  },
  { timestamps: true }
);

export default mongoose.model('Medicine', medicineSchema);
