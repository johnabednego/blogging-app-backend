import { Schema, model, Document } from 'mongoose';

interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  country: string;
  city: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  emailVerificationOTP?: string;
  emailVerificationExpires?: Date;
  resetPasswordOTP?: string;
  resetPasswordExpires?: Date;
}

const userSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  country: { type: String, required: true },
  city: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  emailVerificationOTP: { type: String },
  emailVerificationExpires: { type: Date },
  resetPasswordOTP: { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true });

export const User = model<IUser>('User', userSchema);
