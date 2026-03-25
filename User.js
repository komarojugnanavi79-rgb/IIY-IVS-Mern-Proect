import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const notificationPreferenceSchema = new mongoose.Schema(
  {
    email: { type: Boolean, default: true },
    browser: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    voice: { type: Boolean, default: false }
  },
  { _id: false }
);

const pushSubscriptionSchema = new mongoose.Schema(
  {
    endpoint: String,
    expirationTime: String,
    keys: {
      auth: String,
      p256dh: String
    }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    avatar: String,
    phone: String,
    caregiverEmail: String,
    caregiverPhone: String,
    familyCode: { type: String, default: () => Math.random().toString(36).slice(2, 8).toUpperCase() },
    familyMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    notifications: { type: notificationPreferenceSchema, default: () => ({}) },
    pushSubscription: pushSubscriptionSchema
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function matchPassword(password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);
