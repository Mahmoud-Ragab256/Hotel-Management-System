import mongoose from 'mongoose';

const serviceOrderSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking ID is required']
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service ID is required']
  },
  assignedEmployeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: 1,
    default: 1
  },
  totalCost: {
    type: Number,
    required: [true, 'Total cost is required'],
    min: 0
  },
  status: {
    type: String,
    enum: ['Pending', 'InProgress', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  orderTime: {
    type: Date,
    default: Date.now
  },
  deliveryTime: {
    type: Date
  },
  images: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

export const ServiceOrder = mongoose.model('ServiceOrder', serviceOrderSchema);
