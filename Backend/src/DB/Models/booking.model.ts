import mongoose, { Document, Model, Schema, Types } from 'mongoose';


export type BookingStatus = 'Pending' | 'Confirmed' | 'CheckedIn' | 'CheckedOut' | 'Cancelled';

export type PaymentStatus = 'Pending' | 'Paid' | 'Refunded';


export interface IExtra {
  name: string;
  price: number;
  quantity?: number;
}


export interface IBooking extends Document {
  bookingNumber?: string;
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

const BOOKING_NUMBER_MIN = 1000;
const BOOKING_NUMBER_MAX = 9999;
const BOOKING_NUMBER_ATTEMPTS = 80;

const createRandomBookingNumber = (): string => {
  return String(Math.floor(BOOKING_NUMBER_MIN + Math.random() * (BOOKING_NUMBER_MAX - BOOKING_NUMBER_MIN + 1)));
};

const generateUniqueBookingNumberForModel = async (
  model: Model<IBooking>,
  excludeId?: Types.ObjectId | string
): Promise<string> => {
  for (let attempt = 0; attempt < BOOKING_NUMBER_ATTEMPTS; attempt += 1) {
    const candidate = createRandomBookingNumber();
    const query: Record<string, unknown> = { bookingNumber: candidate };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const exists = await model.exists(query as any);
    if (!exists) return candidate;
  }

  throw new Error('Could not generate a unique 4-digit booking number. Please try again.');
};


const bookingSchema = new Schema<IBooking>(
  {
    bookingNumber: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      match: [/^\d{4}$/, 'Booking number must be exactly 4 digits'],
    },
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

bookingSchema.pre('validate', async function (next) {
  try {
    if (!this.bookingNumber) {
      const BookingModel = this.constructor as Model<IBooking>;
      this.bookingNumber = await generateUniqueBookingNumberForModel(BookingModel, this._id as Types.ObjectId);
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});


export const Booking: Model<IBooking> = mongoose.model<IBooking>('Booking', bookingSchema);

export const generateUniqueBookingNumber = async (excludeId?: Types.ObjectId | string): Promise<string> => {
  return generateUniqueBookingNumberForModel(Booking, excludeId);
};

export const ensureBookingNumber = async (booking: IBooking | null): Promise<IBooking | null> => {
  if (!booking || booking.bookingNumber) return booking;

  booking.bookingNumber = await generateUniqueBookingNumber(booking._id as Types.ObjectId);
  await booking.save();

  return booking;
};

export const backfillMissingBookingNumbers = async (): Promise<void> => {
  const bookings = await Booking.find({ $or: [{ bookingNumber: { $exists: false } }, { bookingNumber: '' }, { bookingNumber: null }] });

  for (const booking of bookings) {
    await ensureBookingNumber(booking);
  }
};
