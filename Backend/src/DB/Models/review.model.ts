import mongoose, { Document, Model, Schema, Types } from 'mongoose';


export type ReviewStatus = 'Pending' | 'Approved' | 'Rejected';


export interface IReview extends Document {
  guestId: Types.ObjectId;
  roomId: Types.ObjectId;
  bookingId: Types.ObjectId;
  rating: number;
  comment?: string;
  images: string[];
  status: ReviewStatus;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}


const reviewSchema = new Schema<IReview>(
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
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking ID is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'] as ReviewStatus[],
      default: 'Pending' as ReviewStatus,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);


export const Review: Model<IReview> = mongoose.model<IReview>('Review', reviewSchema);