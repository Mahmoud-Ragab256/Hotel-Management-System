import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking ID is required'],
    unique: true
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: 0
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Cancelled'],
    default: 'Pending'
  },
  method: {
    type: String,
    enum: ['Cash', 'CreditCard', 'DebitCard', 'BankTransfer', 'Mobile'],
    required: [true, 'Payment method is required']
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  attachments: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

export const Invoice = mongoose.model('Invoice', invoiceSchema);