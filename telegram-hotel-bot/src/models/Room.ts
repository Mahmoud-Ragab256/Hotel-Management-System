
import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
  roomNumber: string;
  type: string;
  price: number;
  status: 'available' | 'occupied' | 'maintenance';
  floor: number;
  amenities: string[];
}

const roomSchema: Schema = new Schema({
  roomNumber: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  price: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['available', 'occupied', 'maintenance'],
    default: 'available' 
  },
  floor: { type: Number, required: true },
  amenities: [{ type: String }]
}, {
  timestamps: true
});

// تأكد من أن الـ Model لا يتم تسجيله مرتين
export default mongoose.models.Room || mongoose.model<IRoom>('Room', roomSchema);
