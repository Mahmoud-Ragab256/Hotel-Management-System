
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel_management';
    
    await mongoose.connect(mongoUri);
    
    console.log('✅ Connected to MongoDB');
    
    // تحميل جميع الـ Models بعد الاتصال
    await import('../models/Room');
    await import('../models/Guest.model');
    await import('../models/Booking');
    await import('../models/Employee.model');
    await import('../models/SystemSettings.model');
    
    console.log('✅ All models loaded successfully');
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

// للتعامل مع إغلاق الاتصال بشكل صحيح
export const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
    throw error;
  }
};
