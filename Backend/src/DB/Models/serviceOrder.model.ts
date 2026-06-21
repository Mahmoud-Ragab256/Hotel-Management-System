import mongoose, { Document, Model, Schema, Types } from 'mongoose';


export type ServiceOrderStatus = 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';


export interface IServiceOrder extends Document {
  bookingId: Types.ObjectId;
  serviceId: Types.ObjectId;
  assignedEmployeeId?: Types.ObjectId;
  quantity: number;
  totalPrice: number;
  status: ServiceOrderStatus;
  notes: string;
  orderTime: Date;
  deliveryTime?: Date;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}


const serviceOrderSchema = new Schema<IServiceOrder>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking ID is required'],
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service ID is required'],
    },
    assignedEmployeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: 1,
      default: 1,
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'InProgress', 'Completed', 'Cancelled'] as ServiceOrderStatus[],
      default: 'Pending' as ServiceOrderStatus,
    },
    notes: {
      type: String,
      default: '',
    },
    orderTime: {
      type: Date,
      default: Date.now,
    },
    deliveryTime: {
      type: Date,
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


export const ServiceOrder: Model<IServiceOrder> = mongoose.model<IServiceOrder>('ServiceOrder', serviceOrderSchema);