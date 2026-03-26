import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// استيراد الموديلز (Models) الخاصة بك
import { Guest } from './DB/Models/guest.model.js';
import { Employee } from './DB/Models/employee.model.js';
import { RoomCategory } from './DB/Models/roomCategory.model.js';
import { Room } from './DB/Models/room.model.js';
import { Service } from './DB/Models/service.model.js';
import { Booking } from './DB/Models/booking.model.js';
import { Invoice } from './DB/Models/invoice.model.js';
import { ServiceOrder } from './DB/Models/serviceOrder.model.js';
import { Review } from './DB/Models/review.model.js';
import { Notification } from './DB/Models/notification.model.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    // 1. الاتصال بقاعدة البيانات
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel-management';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB...');

    // 2. مسح البيانات القديمة لتجنب تكرار البيانات (اختياري ولكن مفيد للتجربة)
    console.log('🗑️  Clearing old data...');
    await Promise.all([
      Guest.deleteMany(), Employee.deleteMany(), RoomCategory.deleteMany(),
      Room.deleteMany(), Service.deleteMany(), Booking.deleteMany(),
      Invoice.deleteMany(), ServiceOrder.deleteMany(), Review.deleteMany(),
      Notification.deleteMany()
    ]);

    const pepper = process.env.PEPPER || 'default_pepper';
    const saltRounds = parseInt(process.env.SALT_ROUNDS as string) || 10;
    const hashedPassword = await bcrypt.hash(`password123${pepper}`, saltRounds);

    // 3. إنشاء 5 فئات غرف (Room Categories)
    console.log('🌱 Seeding Room Categories...');
    const categories = await RoomCategory.insertMany([
      { name: 'Standard Room', basePrice: 100, capacity: { adults: 2, children: 1 }, amenities: ['WiFi', 'TV'], images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=800'], description: 'A cozy standard room.' },
      { name: 'Deluxe Room', basePrice: 200, capacity: { adults: 2, children: 2 }, amenities: ['WiFi', 'TV', 'Mini Bar'], images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800'], description: 'Spacious deluxe room with great view.' },
      { name: 'Executive Suite', basePrice: 350, capacity: { adults: 2, children: 2 }, amenities: ['WiFi', 'TV', 'Mini Bar', 'Bathtub'], images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800'], description: 'Executive suite for premium comfort.' },
      { name: 'Family Suite', basePrice: 400, capacity: { adults: 4, children: 3 }, amenities: ['WiFi', 'TV', 'Kitchenette'], images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=800'], description: 'Large suite perfect for families.' },
      { name: 'Presidential Suite', basePrice: 1000, capacity: { adults: 2, children: 0 }, amenities: ['WiFi', 'TV', 'Jacuzzi', 'Private Pool'], images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=800'], description: 'Ultimate luxury experience.' },
    ]);

    // 4. إنشاء 5 غرف (Rooms)
    console.log('🌱 Seeding Rooms...');
    const rooms = await Room.insertMany([
      { roomNumber: '101', categoryId: categories[0]!._id, status: 'Available', floor: 1, images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=800'] },
      { roomNumber: '201', categoryId: categories[1]!._id, status: 'Available', floor: 2, images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800'] },
      { roomNumber: '301', categoryId: categories[2]!._id, status: 'Available', floor: 3, images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800'] },
      { roomNumber: '401', categoryId: categories[3]!._id, status: 'Available', floor: 4, images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=800'] },
      { roomNumber: '501', categoryId: categories[4]!._id, status: 'Available', floor: 5, images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=800'] },
    ]);

    // 5. إنشاء 5 ضيوف (Guests)
    console.log('🌱 Seeding Guests...');
    const guests = await Guest.insertMany([
      { fullName: 'Ahmed Ali', email: 'ahmed@example.com', password: hashedPassword, phone: '01012345678', nationalId: '29912345678901', vipLevel: 'Bronze', avatar: 'https://i.pravatar.cc/150?img=11' },
      { fullName: 'Sara Hassan', email: 'sara@example.com', password: hashedPassword, phone: '01112345678', nationalId: '29912345678902', vipLevel: 'Silver', avatar: 'https://i.pravatar.cc/150?img=5' },
      { fullName: 'Omar Fathy', email: 'omar@example.com', password: hashedPassword, phone: '01212345678', nationalId: '29912345678903', vipLevel: 'Gold', avatar: 'https://i.pravatar.cc/150?img=15' },
      { fullName: 'Mona Youssef', email: 'mona@example.com', password: hashedPassword, phone: '01512345678', nationalId: '29912345678904', vipLevel: 'Platinum', avatar: 'https://i.pravatar.cc/150?img=9' },
      { fullName: 'Karim Mostafa', email: 'karim@example.com', password: hashedPassword, phone: '01098765432', nationalId: '29912345678905', vipLevel: 'Bronze', avatar: 'https://i.pravatar.cc/150?img=13' },
    ]);

    // 6. إنشاء 5 موظفين (Employees)
    console.log('🌱 Seeding Employees...');
    const employees = await Employee.insertMany([
      { fullName: 'Admin User', email: 'admin@hotel.com', password: hashedPassword, role: 'Admin', shift: 'Morning', salary: 15000, avatar: 'https://i.pravatar.cc/150?img=50' },
      { fullName: 'Manager Yasser', email: 'manager@hotel.com', password: hashedPassword, role: 'Manager', shift: 'Evening', salary: 10000, avatar: 'https://i.pravatar.cc/150?img=52' },
      { fullName: 'Ali Receptionist', email: 'ali@hotel.com', password: hashedPassword, role: 'Receptionist', shift: 'Morning', salary: 5000, avatar: 'https://i.pravatar.cc/150?img=53' },
      { fullName: 'Nour Receptionist', email: 'nour@hotel.com', password: hashedPassword, role: 'Receptionist', shift: 'Night', salary: 5000, avatar: 'https://i.pravatar.cc/150?img=40' },
      { fullName: 'Tarek Service', email: 'tarek@hotel.com', password: hashedPassword, role: 'Service', shift: 'Morning', salary: 4000, avatar: 'https://i.pravatar.cc/150?img=60' },
    ]);

    // 7. إنشاء 5 خدمات (Services)
    console.log('🌱 Seeding Services...');
    const services = await Service.insertMany([
      { name: 'Room Breakfast', category: 'RoomService', price: 50, images: ['https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=800'] },
      { name: 'Spa Massage', category: 'Spa', price: 150, images: ['https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800'] },
      { name: 'Airport Transfer', category: 'Transport', price: 200, images: ['https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=800'] },
      { name: 'Laundry Service', category: 'Laundry', price: 30, images: ['https://images.unsplash.com/photo-1582735689369-4fe89db7114c?q=80&w=800'] },
      { name: 'Gym Access', category: 'Other', price: 20, images: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800'] },
    ]);

    // 8. إنشاء 5 حجوزات (Bookings)
    console.log('🌱 Seeding Bookings...');
    const checkIn = new Date();
    const checkOut = new Date(new Date().setDate(checkIn.getDate() + 3)); // الحجز لمدة 3 أيام
    const bookings = await Booking.insertMany([
      { guestId: guests[0]!._id, roomId: rooms[0]!._id, checkInDate: checkIn, checkOutDate: checkOut, status: 'Confirmed', totalPrice: 300, paymentStatus: 'Paid' },
      { guestId: guests[1]!._id, roomId: rooms[1]!._id, checkInDate: checkIn, checkOutDate: checkOut, status: 'CheckedIn', totalPrice: 600, paymentStatus: 'Paid' },
      { guestId: guests[2]!._id, roomId: rooms[2]!._id, checkInDate: checkIn, checkOutDate: checkOut, status: 'Pending', totalPrice: 1050, paymentStatus: 'Pending' },
      { guestId: guests[3]!._id, roomId: rooms[3]!._id, checkInDate: checkIn, checkOutDate: checkOut, status: 'CheckedOut', totalPrice: 1200, paymentStatus: 'Paid' },
      { guestId: guests[4]!._id, roomId: rooms[4]!._id, checkInDate: checkIn, checkOutDate: checkOut, status: 'Cancelled', totalPrice: 3000, paymentStatus: 'Refunded' },
    ]);

    // 9. إنشاء 5 فواتير (Invoices)
    console.log('🌱 Seeding Invoices...');
    const invoices = await Invoice.insertMany([
      { bookingId: bookings[0]!._id, employeeId: employees[2]!._id, totalAmount: 300, paidAmount: 300, status: 'Paid', method: 'CreditCard' },
      { bookingId: bookings[1]!._id, employeeId: employees[2]!._id, totalAmount: 600, paidAmount: 600, status: 'Paid', method: 'Cash' },
      { bookingId: bookings[2]!._id, employeeId: employees[3]!._id, totalAmount: 1050, paidAmount: 0, status: 'Pending', method: 'BankTransfer' },
      { bookingId: bookings[3]!._id, employeeId: employees[3]!._id, totalAmount: 1200, paidAmount: 1200, status: 'Paid', method: 'CreditCard' },
      { bookingId: bookings[4]!._id, employeeId: employees[2]!._id, totalAmount: 3000, paidAmount: 0, status: 'Cancelled', method: 'DebitCard' },
    ]);

    // 10. إنشاء 5 طلبات خدمة (Service Orders)
    console.log('🌱 Seeding Service Orders...');
    const serviceOrders = await ServiceOrder.insertMany([
      { bookingId: bookings[0]!._id, serviceId: services[0]!._id, assignedEmployeeId: employees[4]!._id, quantity: 2, totalPrice: 100, status: 'Completed' },
      { bookingId: bookings[1]!._id, serviceId: services[1]!._id, assignedEmployeeId: employees[4]!._id, quantity: 1, totalPrice: 150, status: 'InProgress' },
      { bookingId: bookings[2]!._id, serviceId: services[2]!._id, assignedEmployeeId: employees[4]!._id, quantity: 1, totalPrice: 200, status: 'Pending' },
      { bookingId: bookings[3]!._id, serviceId: services[3]!._id, assignedEmployeeId: employees[4]!._id, quantity: 3, totalPrice: 90, status: 'Completed' },
      { bookingId: bookings[1]!._id, serviceId: services[0]!._id, assignedEmployeeId: employees[4]!._id, quantity: 1, totalPrice: 50, status: 'Pending' },
    ]);

    // 11. إنشاء 5 تقييمات (Reviews)
    console.log('🌱 Seeding Reviews...');
    const reviews = await Review.insertMany([
      { guestId: guests[0]!._id, roomId: rooms[0]!._id, bookingId: bookings[0]!._id, rating: 5, comment: 'Amazing stay! Highly recommended.', status: 'Approved', isApproved: true },
      { guestId: guests[1]!._id, roomId: rooms[1]!._id, bookingId: bookings[1]!._id, rating: 4, comment: 'Very good, but the AC was a bit noisy.', status: 'Approved', isApproved: true },
      { guestId: guests[2]!._id, roomId: rooms[2]!._id, bookingId: bookings[2]!._id, rating: 5, comment: 'Perfect location and perfect service.', status: 'Pending', isApproved: false },
      { guestId: guests[3]!._id, roomId: rooms[3]!._id, bookingId: bookings[3]!._id, rating: 3, comment: 'Average experience. Expected more from the family suite.', status: 'Approved', isApproved: true },
      { guestId: guests[4]!._id, roomId: rooms[4]!._id, bookingId: bookings[4]!._id, rating: 1, comment: 'I had to cancel, so no real experience.', status: 'Rejected', isApproved: false },
    ]);

    // 12. إنشاء 5 إشعارات (Notifications)
    console.log('🌱 Seeding Notifications...');
    const notifications = await Notification.insertMany([
      { recipientType: 'Guest', recipientId: guests[0]!._id, title: 'Booking Confirmed', message: 'Your booking has been confirmed successfully.', type: 'Booking', isRead: false },
      { recipientType: 'Guest', recipientId: guests[1]!._id, title: 'Welcome to the Hotel', message: 'Enjoy your stay with us.', type: 'System', isRead: true },
      { recipientType: 'Employee', recipientId: employees[4]!._id, title: 'New Service Order', message: 'You have a new room service order to deliver.', type: 'Service', isRead: false },
      { recipientType: 'Employee', recipientId: employees[2]!._id, title: 'Payment Received', message: 'Payment for booking has been successfully processed.', type: 'Payment', isRead: true },
      { recipientType: 'Guest', recipientId: guests[3]!._id, title: 'Please Review Your Stay', message: 'We hope you enjoyed your stay. Please leave a review.', type: 'Review', isRead: false },
    ]);

    console.log('🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();