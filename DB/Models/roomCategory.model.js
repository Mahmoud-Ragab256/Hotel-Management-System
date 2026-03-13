import mongoose from 'mongoose';

const roomCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true
  },
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: 0
  },
  capacity: {
    type: Object,
    default: {
      adults: 2,
      children: 1
    }
  },
  amenities: {
    type: [String],
    default: []
  },
  images: {
    type: [String],
    default: []
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export const RoomCategory = mongoose.model('RoomCategory', roomCategorySchema);
