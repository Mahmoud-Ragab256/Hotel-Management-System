import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Employee } from './DB/Models/employee.model.js';
import { Guest } from './DB/Models/guest.model.js';
import { hashPassword, normalizeEmail } from './utils/password.js';

dotenv.config();

const getRequiredEnv = (key: string): string => {
  const value = process.env[key]?.trim();

  if (!value) {
    throw new Error(`${key} is missing in .env`);
  }

  return value;
};

const upsertEmployee = async ({
  fullName,
  email,
  password,
  role,
  shift,
  salary,
}: {
  fullName: string;
  email: string;
  password: string;
  role: 'Admin' | 'Manager' | 'Receptionist' | 'Service';
  shift: 'Morning' | 'Evening' | 'Night';
  salary: number;
}) => {
  const normalizedEmail = normalizeEmail(email);
  const hashedPassword = await hashPassword(password);

  await Employee.findOneAndUpdate(
    { email: normalizedEmail },
    {
      $set: {
        fullName,
        email: normalizedEmail,
        password: hashedPassword,
        role,
        shift,
        salary,
        isActive: true,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`Employee ready: ${normalizedEmail} / ${password}`);
};

const upsertGuest = async ({
  fullName,
  email,
  password,
  phone,
  nationalId,
}: {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  nationalId: string;
}) => {
  const normalizedEmail = normalizeEmail(email);
  const hashedPassword = await hashPassword(password);

  await Guest.findOneAndUpdate(
    { email: normalizedEmail },
    {
      $set: {
        fullName,
        email: normalizedEmail,
        password: hashedPassword,
        phone,
        nationalId,
        vipLevel: 'Bronze',
        preferences: {},
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`Guest ready: ${normalizedEmail} / ${password}`);
};

const run = async (): Promise<void> => {
  await mongoose.connect(getRequiredEnv('MONGODB_URI'));
  console.log('MongoDB connected successfully');

  const defaultPassword = process.env.FIRST_ADMIN_PASSWORD?.trim() || '123456';
  const firstAdminEmail = process.env.FIRST_ADMIN_EMAIL?.trim() || 'admin12@hotel.com';
  const firstAdminName = process.env.FIRST_ADMIN_FULL_NAME?.trim() || 'Admin User';

  await upsertEmployee({
    fullName: firstAdminName,
    email: firstAdminEmail,
    password: defaultPassword,
    role: 'Admin',
    shift: 'Morning',
    salary: 10000,
  });

  await upsertEmployee({
    fullName: 'Karim Mohamed',
    email: 'karim.mohamed.admin@gmail.com',
    password: '123456',
    role: 'Admin',
    shift: 'Morning',
    salary: 10000,
  });

  await upsertEmployee({ fullName: 'Sarah Manager', email: 'manager@hotel.com', password: '123456', role: 'Manager', shift: 'Morning', salary: 8500 });
  await upsertEmployee({ fullName: 'Omar Receptionist', email: 'reception@hotel.com', password: '123456', role: 'Receptionist', shift: 'Evening', salary: 6000 });
  await upsertEmployee({ fullName: 'Mona Service', email: 'service@hotel.com', password: '123456', role: 'Service', shift: 'Night', salary: 5000 });
  await upsertEmployee({ fullName: 'Karim Receptionist', email: 'reception2@hotel.com', password: '123456', role: 'Receptionist', shift: 'Morning', salary: 6200 });

  await upsertGuest({ fullName: 'Guest 1', email: 'guest1@hotel.com', password: '123456', phone: '01000000001', nationalId: '29801010000001' });
  await upsertGuest({ fullName: 'Guest 2', email: 'guest2@hotel.com', password: '123456', phone: '01000000002', nationalId: '29801010000002' });
  await upsertGuest({ fullName: 'Guest 3', email: 'guest3@hotel.com', password: '123456', phone: '01000000003', nationalId: '29801010000003' });

  await mongoose.disconnect();
  console.log('Login accounts are ready.');
};

run().catch(async (error: Error) => {
  console.error('Seed login accounts failed:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});
