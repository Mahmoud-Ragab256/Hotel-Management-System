import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
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
  role: {
    type: String,
    enum: ['Admin', 'Manager', 'Receptionist', 'Housekeeping', 'Maintenance', 'Service'],
    required: [true, 'Role is required']
  },
  shift: {
    type: String,
    enum: ['Morning', 'Evening', 'Night'],
    required: [true, 'Shift is required']
  },
  salary: {
    type: Number,
    required: [true, 'Salary is required'],
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
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

export const Employee = mongoose.model('Employee', employeeSchema);
