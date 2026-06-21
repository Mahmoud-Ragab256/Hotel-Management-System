import mongoose, { Document, Model, Schema } from 'mongoose';


export interface ICapacity {
  adults: number;
  children: number;
}


export interface IRoomCategory extends Document {
  name: string;
  basePrice: number;
  capacity: ICapacity;
  amenities: string[];
  images: string[];
  description: string;
  createdAt: Date;
  updatedAt: Date;
}


const roomCategorySchema = new Schema<IRoomCategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: 0,
    },
    capacity: {
      type: Object,
      default: {
        adults: 2,
        children: 1,
      } as ICapacity,
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);


export const RoomCategory: Model<IRoomCategory> = mongoose.model<IRoomCategory>('RoomCategory', roomCategorySchema);