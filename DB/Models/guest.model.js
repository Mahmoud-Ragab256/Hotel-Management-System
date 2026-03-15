import mongoose from 'mongoose';

const guestSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  phone: {
    type: String,
    required: [true, 'Phone is required']
  },
  nationalId: {
    type: String,
    required: [true, 'National ID is required']
  },
  vipLevel: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
    default: 'Bronze'
  },
  preferences: {
    type: Object,
    default: {}
  },
  avatar: {
    type: String,
    default: ''
  },
  images: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

export const Guest = mongoose.model('Guest', guestSchema);
