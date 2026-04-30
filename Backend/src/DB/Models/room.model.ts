import mongoose, { Document, Model, Schema, Types } from 'mongoose';


export type RoomStatus = 'Available' | 'Occupied' | 'Maintenance';


export interface IMapCoordinates {
  x?: number;
  y?: number;
  lat?: number;
  lng?: number;
}

export interface ISmartDevices {
  tv?: boolean;
  ac?: boolean;
  lights?: boolean;
  curtains?: boolean;
  [key: string]: boolean | undefined;
}


export interface IRoom extends Document {
  roomNumber: string;
  categoryId: Types.ObjectId;
  status: RoomStatus;
  floor: number;
  mapCoordinates: IMapCoordinates;
  smartDevices: ISmartDevices;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}


const roomSchema = new Schema<IRoom>(
  {
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      unique: true,
      trim: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'RoomCategory',
      required: [true, 'Category ID is required'],
    },
    status: {
      type: String,
      enum: ['Available', 'Occupied', 'Maintenance'] as RoomStatus[],
      default: 'Available' as RoomStatus,
    },
    floor: {
      type: Number,
      required: [true, 'Floor number is required'],
    },
    mapCoordinates: {
      type: Object,
      default: {},
    },
    smartDevices: {
      type: Object,
      default: {},
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


export const Room: Model<IRoom> = mongoose.model<IRoom>('Room', roomSchema);