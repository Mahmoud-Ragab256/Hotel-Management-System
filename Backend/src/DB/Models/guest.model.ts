import mongoose, { Document, Model, Schema } from 'mongoose';


export type VipLevel = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export interface IGuest extends Document {
  fullName: string;
  email: string;
  password: string;
  passwordResetCode: string | undefined;
  passwordResetExpires: Date | undefined;
  passwordResetVerified: Boolean;
  phone: string;
  nationalId: string;
  vipLevel: VipLevel;
  preferences: Record<string, unknown>;
  avatar: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}


const guestSchema = new Schema<IGuest>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    passwordResetCode: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    passwordResetVerified: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
    },
    nationalId: {
      type: String,
      required: [true, 'National ID is required'],
    },
    vipLevel: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum'] as VipLevel[],
      default: 'Bronze' as VipLevel,
    },
    preferences: {
      type: Object,
      default: {},
    },
    avatar: {
      type: String,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);


export const Guest: Model<IGuest> = mongoose.model<IGuest>('Guest', guestSchema);