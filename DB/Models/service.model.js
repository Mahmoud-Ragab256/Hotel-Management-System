import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['RoomService', 'Spa', 'Laundry', 'Restaurant', 'Transport', 'Other'],
    required: [true, 'Category is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  maxCapacity: {
    type: Number,
    default: 1
  },
  images: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

export const Service = mongoose.model('Service', serviceSchema);
