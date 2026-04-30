import mongoose, { Document, Model, Schema } from 'mongoose';


export type ServiceCategory = 'RoomService' | 'Spa' | 'Laundry' | 'Restaurant' | 'Transport' | 'Other';


export interface IService extends Document {
  name: string;
  category: ServiceCategory;
  price: number;
  isAvailable: boolean;
  maxCapacity: number;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}


const serviceSchema = new Schema<IService>(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['RoomService', 'Spa', 'Laundry', 'Restaurant', 'Transport', 'Other'] as ServiceCategory[],
      required: [true, 'Category is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    maxCapacity: {
      type: Number,
      default: 1,
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


export const Service: Model<IService> = mongoose.model<IService>('Service', serviceSchema);