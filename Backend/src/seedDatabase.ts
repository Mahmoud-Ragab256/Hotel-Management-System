import bcrypt from 'bcrypt';
import { Booking } from './DB/Models/booking.model.js';
import { Employee } from './DB/Models/employee.model.js';
import type { EmployeeRole, EmployeeShift } from './DB/Models/employee.model.js';
import { Guest } from './DB/Models/guest.model.js';
import type { VipLevel } from './DB/Models/guest.model.js';
import { Invoice } from './DB/Models/invoice.model.js';
import { Notification } from './DB/Models/notification.model.js';
import { Review } from './DB/Models/review.model.js';
import { Room } from './DB/Models/room.model.js';
import type { RoomStatus } from './DB/Models/room.model.js';
import { RoomCategory } from './DB/Models/roomCategory.model.js';
import { Service } from './DB/Models/service.model.js';
import type { ServiceCategory } from './DB/Models/service.model.js';
import { ServiceOrder } from './DB/Models/serviceOrder.model.js';

const getRequiredEnv = (key: string): string => {
  const value = process.env[key]?.trim();

  if (!value) {
    throw new Error(`${key} is missing in .env`);
  }

  return value;
};

const getFirstAdminValue = (key: string): string => {
  return getRequiredEnv(`FIRST_ADMIN_${key}`);
};

const shouldSeedDatabase = async (): Promise<boolean> => {
  const models = [
    Employee,
    Guest,
    RoomCategory,
    Room,
    Booking,
    Invoice,
    Service,
    ServiceOrder,
    Review,
    Notification,
  ];

  const counts = await Promise.all(models.map((model) => model.estimatedDocumentCount()));
  return counts.every((count) => count === 0);
};

export const seedDatabaseIfEmpty = async (): Promise<void> => {
  const shouldSeed = await shouldSeedDatabase();

  if (!shouldSeed) {
    console.log('Auto seed skipped: database already has data.');
    return;
  }

  const pepper = getRequiredEnv('PEPPER');
  const saltRounds = Number(getRequiredEnv('SALT_ROUNDS'));

  if (!Number.isInteger(saltRounds) || saltRounds < 1) {
    throw new Error('SALT_ROUNDS must be a positive number in .env');
  }

  const adminFullName = getFirstAdminValue('FULL_NAME');
  const adminEmail = getFirstAdminValue('EMAIL').toLowerCase();
  const adminPassword = getFirstAdminValue('PASSWORD');
  const adminShift = getFirstAdminValue('SHIFT') as EmployeeShift;
  const adminSalary = Number(getFirstAdminValue('SALARY'));

  const allowedShifts: EmployeeShift[] = ['Morning', 'Evening', 'Night'];

  if (!allowedShifts.includes(adminShift)) {
    throw new Error('FIRST_ADMIN_SHIFT must be one of: Morning, Evening, Night');
  }

  if (!Number.isFinite(adminSalary) || adminSalary < 0) {
    throw new Error('FIRST_ADMIN_SALARY must be a valid positive number in .env');
  }

  if (adminPassword.length < 6) {
    throw new Error('FIRST_ADMIN_PASSWORD must be at least 6 characters');
  }

  const samplePasswordHash = await bcrypt.hash(`${adminPassword}${pepper}`, saltRounds);

  const employees = await Employee.insertMany([
    {
      fullName: adminFullName,
      email: adminEmail,
      password: samplePasswordHash,
      role: 'Admin' as EmployeeRole,
      shift: adminShift,
      salary: adminSalary,
      isActive: true,
    },
    {
      fullName: 'Sarah Manager',
      email: 'manager@hotel.com',
      password: samplePasswordHash,
      role: 'Manager' as EmployeeRole,
      shift: 'Morning' as EmployeeShift,
      salary: 8500,
      isActive: true,
    },
    {
      fullName: 'Omar Receptionist',
      email: 'reception@hotel.com',
      password: samplePasswordHash,
      role: 'Receptionist' as EmployeeRole,
      shift: 'Evening' as EmployeeShift,
      salary: 6000,
      isActive: true,
    },
    {
      fullName: 'Mona Service',
      email: 'service@hotel.com',
      password: samplePasswordHash,
      role: 'Service' as EmployeeRole,
      shift: 'Night' as EmployeeShift,
      salary: 5000,
      isActive: true,
    },
    {
      fullName: 'Karim Receptionist',
      email: 'reception2@hotel.com',
      password: samplePasswordHash,
      role: 'Receptionist' as EmployeeRole,
      shift: 'Morning' as EmployeeShift,
      salary: 6200,
      isActive: true,
    },
  ]);

  const guestLevels: VipLevel[] = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Bronze'];
  const guests = await Guest.insertMany(
    Array.from({ length: 5 }, (_, index) => ({
      fullName: `Guest ${index + 1}`,
      email: `guest${index + 1}@hotel.com`,
      password: samplePasswordHash,
      phone: `0100000000${index + 1}`,
      nationalId: `2980101000000${index + 1}`,
      vipLevel: guestLevels[index],
      preferences: {
        bed: index % 2 === 0 ? 'King' : 'Twin',
        view: index % 2 === 0 ? 'Sea' : 'City',
      },
    }))
  );

  const roomCategories = await RoomCategory.insertMany([
    {
      name: 'Standard Room',
      basePrice: 900,
      capacity: { adults: 2, children: 1 },
      amenities: ['Wi-Fi', 'TV', 'Air Conditioning'],
      description: 'Comfortable standard room for short stays.',
    },
    {
      name: 'Deluxe Room',
      basePrice: 1400,
      capacity: { adults: 2, children: 2 },
      amenities: ['Wi-Fi', 'Smart TV', 'Mini Bar'],
      description: 'Spacious deluxe room with premium facilities.',
    },
    {
      name: 'Family Suite',
      basePrice: 2200,
      capacity: { adults: 4, children: 2 },
      amenities: ['Wi-Fi', 'Kitchenette', 'Living Area'],
      description: 'Large suite designed for families.',
    },
    {
      name: 'Executive Suite',
      basePrice: 3200,
      capacity: { adults: 2, children: 1 },
      amenities: ['Wi-Fi', 'Workspace', 'Coffee Machine'],
      description: 'Executive suite for business travelers.',
    },
    {
      name: 'Presidential Suite',
      basePrice: 6000,
      capacity: { adults: 4, children: 2 },
      amenities: ['Wi-Fi', 'Private Lounge', 'Jacuzzi'],
      description: 'Luxury presidential suite with VIP service.',
    },
  ]);

  const roomStatuses: RoomStatus[] = ['Available', 'Available', 'Occupied', 'Maintenance', 'Available'];
  const rooms = await Room.insertMany(
    roomCategories.map((category, index) => ({
      roomNumber: `${index + 1}0${index + 1}`,
      categoryId: category._id,
      status: roomStatuses[index],
      floor: index + 1,
      mapCoordinates: {
        x: 10 + index * 4,
        y: 20 + index * 3,
      },
      smartDevices: {
        tv: true,
        ac: true,
        lights: true,
        curtains: index % 2 === 0,
      },
    }))
  );

  const bookings = await Booking.insertMany(
    Array.from({ length: 5 }, (_, index) => {
      const checkInDate = new Date();
      checkInDate.setDate(checkInDate.getDate() + index + 1);

      const checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(checkOutDate.getDate() + 2);

      return {
        guestId: guests[index]!._id,
        roomId: rooms[index]!._id,
        checkInDate,
        checkOutDate,
        status: index === 0 ? 'Pending' : 'Confirmed',
        totalPrice: roomCategories[index]!.basePrice * 2,
        paymentStatus: index % 2 === 0 ? 'Pending' : 'Paid',
        extras: [
          {
            name: 'Breakfast',
            price: 150,
            quantity: 2,
          },
        ],
        specialRequests: index % 2 === 0 ? 'Late check-in requested.' : 'No special requests.',
      };
    })
  );

  await Invoice.insertMany(
    bookings.map((booking, index) => ({
      bookingId: booking._id,
      employeeId: employees[index % employees.length]!._id,
      totalAmount: booking.totalPrice,
      paidAmount: index % 2 === 0 ? 0 : booking.totalPrice,
      status: index % 2 === 0 ? 'Pending' : 'Paid',
      method: index % 2 === 0 ? 'Cash' : 'CreditCard',
      issuedAt: new Date(),
    }))
  );

  const services = await Service.insertMany([
    {
      name: 'Room Cleaning',
      category: 'RoomService' as ServiceCategory,
      price: 120,
      isAvailable: true,
      maxCapacity: 1,
    },
    {
      name: 'Spa Session',
      category: 'Spa' as ServiceCategory,
      price: 500,
      isAvailable: true,
      maxCapacity: 2,
    },
    {
      name: 'Laundry Package',
      category: 'Laundry' as ServiceCategory,
      price: 250,
      isAvailable: true,
      maxCapacity: 5,
    },
    {
      name: 'Dinner Reservation',
      category: 'Restaurant' as ServiceCategory,
      price: 700,
      isAvailable: true,
      maxCapacity: 4,
    },
    {
      name: 'Airport Transfer',
      category: 'Transport' as ServiceCategory,
      price: 900,
      isAvailable: true,
      maxCapacity: 3,
    },
  ]);

  await ServiceOrder.insertMany(
    bookings.map((booking, index) => ({
      bookingId: booking._id,
      serviceId: services[index]!._id,
      assignedEmployeeId: employees[(index + 1) % employees.length]!._id,
      quantity: index + 1,
      totalPrice: services[index]!.price * (index + 1),
      status: index === 0 ? 'Pending' : index === 4 ? 'Completed' : 'InProgress',
      notes: `Sample service order ${index + 1}`,
      orderTime: new Date(),
    }))
  );

  await Review.insertMany(
    bookings.map((booking, index) => ({
      guestId: guests[index]!._id,
      roomId: rooms[index]!._id,
      bookingId: booking._id,
      rating: Math.min(5, index + 1),
      comment: `Sample review ${index + 1}`,
      status: index % 2 === 0 ? 'Pending' : 'Approved',
      isApproved: index % 2 !== 0,
    }))
  );

  await Notification.insertMany([
    {
      recipientType: 'Employee',
      recipientId: employees[0]!._id,
      title: 'New booking created',
      message: 'A sample booking has been created automatically.',
      type: 'Booking',
      isRead: false,
    },
    {
      recipientType: 'Guest',
      recipientId: guests[0]!._id,
      title: 'Booking confirmation',
      message: 'Your sample booking is waiting for confirmation.',
      type: 'Booking',
      isRead: false,
    },
    {
      recipientType: 'Employee',
      recipientId: employees[1]!._id,
      title: 'Payment pending',
      message: 'A sample invoice is pending payment.',
      type: 'Payment',
      isRead: false,
    },
    {
      recipientType: 'Guest',
      recipientId: guests[1]!._id,
      title: 'Service order update',
      message: 'Your sample service order is in progress.',
      type: 'Service',
      isRead: true,
    },
    {
      recipientType: 'Employee',
      recipientId: employees[2]!._id,
      title: 'System seed completed',
      message: 'Initial hotel data has been inserted automatically.',
      type: 'System',
      isRead: false,
    },
  ]);

  console.log('Auto seed completed: inserted 5 records for each main collection.');
  console.log('Default admin credentials loaded from .env:');
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
};
