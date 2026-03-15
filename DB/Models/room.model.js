import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    unique: true,
    trim: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RoomCategory',
    required: [true, 'Category ID is required']
  },
  status: {
    type: String,
    enum: ['Available', 'Occupied', 'Maintenance'],
    default: 'Available'
  },
  floor: {
    type: Number,
    required: [true, 'Floor number is required']
  },
  mapCoordinates: {
    type: Object,
    default: {}
  },
  smartDevices: {
    type: Object,
    default: {}
  },
  images: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

export const Room = mongoose.model('Room', roomSchema);
