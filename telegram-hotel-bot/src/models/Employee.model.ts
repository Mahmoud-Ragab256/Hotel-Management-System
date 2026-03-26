import mongoose, { Document, Schema } from 'mongoose';

export interface IEmployee extends Document {
  name: string;
  email: string;
  password: string;
  role: 'Admin' | 'Receptionist' | 'Housekeeping' | 'Service' | 'Manager';
  phone: string;
  telegramId?: string;
  telegramUsername?: string;
  language?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Admin', 'Receptionist', 'Housekeeping', 'Service', 'Manager'],
    default: 'Receptionist'
  },
  phone: { type: String, required: true },
  telegramId: { type: String, sparse: true, unique: true },
  telegramUsername: { type: String },
  language: { type: String, default: 'ar' },
  isActive: { type: Boolean, default: true }
}, { 
  timestamps: true,
  collection: 'employees'
});

export const Employee = mongoose.model<IEmployee>('Employee', EmployeeSchema);
