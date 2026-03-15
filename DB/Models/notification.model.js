import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipientType: {
    type: String,
    enum: ['Guest', 'Employee'],
    required: [true, 'Recipient type is required']
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Recipient ID is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required']
  },
  message: {
    type: String,
    required: [true, 'Message is required']
  },
  type: {
    type: String,
    enum: ['Booking', 'Payment', 'Service', 'Review', 'System', 'Promotion'],
    required: [true, 'Type is required']
  },
  isRead: {
    type: Boolean,
    default: false
  },
  images: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

export const Notification = mongoose.model('Notification', notificationSchema);