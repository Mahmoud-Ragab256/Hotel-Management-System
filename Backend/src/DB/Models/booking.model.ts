import mongoose, { Document, Model, Schema, Types } from 'mongoose';


export type BookingStatus = 'Pending' | 'Confirmed' | 'CheckedIn' | 'CheckedOut' | 'Cancelled';

export type PaymentStatus = 'Pending' | 'Paid' | 'Refunded';


export interface IExtra {
  name: string;
  price: number;
  quantity?: number;
}


export interface IBooking extends Document {
  guestId: Types.ObjectId;
  roomId: Types.ObjectId;
  checkInDate: Date;
  checkOutDate: Date;
  status: BookingStatus;
  totalPrice: number;
  paymentStatus: PaymentStatus;
  extras: IExtra[];
  specialRequests: string;
  cancelledAt?: Date;
  cancelReason?: string;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}


const bookingSchema = new Schema<IBooking>(
  {
    guestId: {
      type: Schema.Types.ObjectId,
      ref: 'Guest',
      required: [true, 'Guest ID is required'],
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room ID is required'],
    },
    checkInDate: {
      type: Date,
      required: [true, 'Check-in date is required'],
    },
    checkOutDate: {
      type: Date,
      required: [true, 'Check-out date is required'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled'] as BookingStatus[],
      default: 'Pending' as BookingStatus,
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Refunded'] as PaymentStatus[],
      default: 'Pending' as PaymentStatus,
    },
    extras: {
      type: [Object],
      default: [],
    },
    specialRequests: {
      type: String,
      default: '',
    },
    cancelledAt: {
      type: Date,
    },
    cancelReason: {
      type: String,
    },
    attachments: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);


export const Booking: Model<IBooking> = mongoose.model<IBooking>('Booking', bookingSchema);