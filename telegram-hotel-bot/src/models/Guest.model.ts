import mongoose, { Document, Schema } from 'mongoose';

export interface IGuest extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  telegramId?: string;
  telegramUsername?: string;
  language?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GuestSchema = new Schema<IGuest>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  telegramId: { type: String, sparse: true, unique: true },
  telegramUsername: { type: String },
  language: { type: String, default: 'ar' },
}, { 
  timestamps: true,
  collection: 'guests'
});

export const Guest = mongoose.model<IGuest>('Guest', GuestSchema);
