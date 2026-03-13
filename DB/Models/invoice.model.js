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
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: 0
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
