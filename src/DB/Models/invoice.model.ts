import mongoose, { Document, Model, Schema, Types } from 'mongoose';


export type InvoiceStatus = 'Pending' | 'Paid' | 'Cancelled';

export type PaymentMethod = 'Cash' | 'CreditCard' | 'DebitCard' | 'BankTransfer' | 'Mobile';


export interface IInvoice extends Document {
  bookingId: Types.ObjectId;
  employeeId?: Types.ObjectId;
  totalAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
  method: PaymentMethod;
  issuedAt: Date;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}


const invoiceSchema = new Schema<IInvoice>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking ID is required'],
      unique: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Cancelled'] as InvoiceStatus[],
      default: 'Pending' as InvoiceStatus,
    },
    method: {
      type: String,
      enum: ['Cash', 'CreditCard', 'DebitCard', 'BankTransfer', 'Mobile'] as PaymentMethod[],
      required: [true, 'Payment method is required'],
    },
    issuedAt: {
      type: Date,
      default: Date.now,
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


export const Invoice: Model<IInvoice> = mongoose.model<IInvoice>('Invoice', invoiceSchema);