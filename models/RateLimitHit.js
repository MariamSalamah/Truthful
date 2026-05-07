import mongoose from 'mongoose';

const rateLimitHitSchema = new mongoose.Schema({
  key: { type: String, required: true },
  windowStart: { type: Date, required: true },
  count: { type: Number, default: 1 },
});

rateLimitHitSchema.index({ key: 1, windowStart: 1 }, { unique: true });
rateLimitHitSchema.index({ windowStart: 1 }, { expireAfterSeconds: 3600 });

export default mongoose.model('RateLimitHit', rateLimitHitSchema);
