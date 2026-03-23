import mongoose, { Document, Model, Schema, Types } from 'mongoose';


export type RecipientType = 'Guest' | 'Employee';

export type NotificationType = 'Booking' | 'Payment' | 'Service' | 'Review' | 'System' | 'Promotion';


export interface INotification extends Document {
  recipientType: RecipientType;
  recipientId: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}


const notificationSchema = new Schema<INotification>(
  {
    recipientType: {
      type: String,
      enum: ['Guest', 'Employee'] as RecipientType[],
      required: [true, 'Recipient type is required'],
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      required: [true, 'Recipient ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
    },
    type: {
      type: String,
      enum: ['Booking', 'Payment', 'Service', 'Review', 'System', 'Promotion'] as NotificationType[],
      required: [true, 'Type is required'],
    },
    isRead: {
      type: Boolean,
      default: false,
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


export const Notification: Model<INotification> = mongoose.model<INotification>('Notification', notificationSchema);