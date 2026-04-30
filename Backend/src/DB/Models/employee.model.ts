import mongoose, { Document, Model, Schema } from 'mongoose';


export type EmployeeRole = 'Admin' | 'Manager' | 'Receptionist' | 'Service';

export type EmployeeShift = 'Morning' | 'Evening' | 'Night';


export interface IEmployee extends Document {
  fullName: string;
  email: string;
  password: string;
  passwordResetCode: string | undefined;
  passwordResetExpires: Date | undefined;
  passwordResetVerified: Boolean;
  role: EmployeeRole;
  shift: EmployeeShift;
  salary: number;
  isActive: boolean;
  avatar: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}


const employeeSchema = new Schema<IEmployee>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    passwordResetCode: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    passwordResetVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ['Admin', 'Manager', 'Receptionist', 'Service'] as EmployeeRole[],
      required: [true, 'Role is required'],
    },
    shift: {
      type: String,
      enum: ['Morning', 'Evening', 'Night'] as EmployeeShift[],
      required: [true, 'Shift is required'],
    },
    salary: {
      type: Number,
      required: [true, 'Salary is required'],
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);


export const Employee: Model<IEmployee> = mongoose.model<IEmployee>('Employee', employeeSchema);