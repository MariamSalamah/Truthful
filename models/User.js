import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 20,
      match: /^[a-zA-Z0-9_]+$/,
      immutable: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    passwordHash: { type: String, required: true },
    displayName: { type: String, required: true, minlength: 1, maxlength: 50 },
    bio: { type: String, default: '', maxlength: 200 },
    avatarUrl: { type: String, default: '' },
    acceptingQuestions: { type: Boolean, default: true },
    tags: {
      type: [String],
      default: [],
      validate: [(v) => v.length <= 10, 'Max 10 tags'],
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.passwordHash;
    return ret;
  },
});

export default mongoose.model('User', userSchema);
