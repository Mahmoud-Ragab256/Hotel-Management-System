import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { connectDatabase as connectDB } from './config/database';
import { Guest } from './models/Guest.model';
import { Employee } from './models/Employee.model';
import { SystemSettings } from './models/SystemSettings.model';

dotenv.config();

// Import models from main system
const Room = mongoose.model('Room');
const RoomCategory = mongoose.model('RoomCategory');
const Booking = mongoose.model('Booking');
 
async function seed() {
  try {
    await connectDB();

    console.log('🌱 Starting seed...');

    // Clear existing data
    console.log('Clearing existing data...');
    await Guest.deleteMany({});
    await Employee.deleteMany({});
    await SystemSettings.deleteMany({});

    // Create System Settings
    console.log('Creating system settings...');
    await SystemSettings.create({
      aiModel: 'gpt-4o-mini',
      defaultLanguage: 'ar'
    });

    // Create Admin Employee
    console.log('Creating admin employee...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    await Employee.create({
      name: 'أحمد المدير',
      email: 'admin@hotel.com',
      password: adminPassword,
      role: 'Admin',
      phone: '+201234567890',
      language: 'ar',
      isActive: true
    });

    // Create Receptionist
    const receptionistPassword = await bcrypt.hash('reception123', 10);
    await Employee.create({
      name: 'فاطمة الاستقبال',
      email: 'reception@hotel.com',
      password: receptionistPassword,
      role: 'Receptionist',
      phone: '+201234567891',
      language: 'ar',
      isActive: true
    });

    // Create Housekeeping
    const housekeepingPassword = await bcrypt.hash('cleaning123', 10);
    await Employee.create({
      name: 'محمد التنظيف',
      email: 'housekeeping@hotel.com',
      password: housekeepingPassword,
      role: 'Housekeeping',
      phone: '+201234567892',
      language: 'ar',
      isActive: true
    });

    // Create Service Employee
    const servicePassword = await bcrypt.hash('service123', 10);
    await Employee.create({
      name: 'سارة الخدمات',
      email: 'service@hotel.com',
      password: servicePassword,
      role: 'Service',
      phone: '+201234567893',
      language: 'ar',
      isActive: true
    });

    // Create Sample Guests
    console.log('Creating sample guests...');
    const guestPassword = await bcrypt.hash('guest123', 10);
    
    await Guest.create([
      {
        name: 'محمد علي',
        email: 'mohamed@example.com',
        password: guestPassword,
        phone: '+201111111111',
        language: 'ar'
      },
      {
        name: 'Sara Ahmed',
        email: 'sara@example.com',
        password: guestPassword,
        phone: '+201222222222',
        language: 'en'
      },
      {
        name: 'خالد حسن',
        email: 'khaled@example.com',
        password: guestPassword,
        phone: '+201333333333',
        language: 'ar'
      }
    ]);

    console.log('✅ Seed completed successfully!');
    console.log('\n📋 Created Accounts:');
    console.log('\n👔 Employees:');
    console.log('   Admin:        admin@hotel.com / admin123');
    console.log('   Receptionist: reception@hotel.com / reception123');
    console.log('   Housekeeping: housekeeping@hotel.com / cleaning123');
    console.log('   Service:      service@hotel.com / service123');
    console.log('\n👤 Guests:');
    console.log('   Guest 1:      mohamed@example.com / guest123');
    console.log('   Guest 2:      sara@example.com / guest123');
    console.log('   Guest 3:      khaled@example.com / guest123');
    console.log('\n💡 Use these credentials to login to the bot!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
