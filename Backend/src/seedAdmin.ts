import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { Employee, EmployeeShift } from './DB/Models/employee.model.js';

dotenv.config();

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

const allowedShifts: EmployeeShift[] = ['Morning', 'Evening', 'Night'];

const runSeedAdmin = async (): Promise<void> => {
  const mongoUri = getRequiredEnv('MONGODB_URI');
  const pepper = getRequiredEnv('PEPPER');
  const saltRounds = Number(getRequiredEnv('SALT_ROUNDS'));

  const adminFullName = getFirstAdminValue('FULL_NAME');
  const adminEmail = getFirstAdminValue('EMAIL').toLowerCase();
  const adminPassword = getFirstAdminValue('PASSWORD');
  const adminShift = getFirstAdminValue('SHIFT') as EmployeeShift;
  const adminSalary = Number(getFirstAdminValue('SALARY'));

  if (!Number.isInteger(saltRounds) || saltRounds < 1) {
    throw new Error('SALT_ROUNDS must be a positive number in .env');
  }

  if (!allowedShifts.includes(adminShift)) {
    throw new Error('FIRST_ADMIN_SHIFT must be one of: Morning, Evening, Night');
  }

  if (!Number.isFinite(adminSalary) || adminSalary < 0) {
    throw new Error('FIRST_ADMIN_SALARY must be a valid positive number in .env');
  }

  if (adminPassword.length < 6) {
    throw new Error('FIRST_ADMIN_PASSWORD must be at least 6 characters');
  }

  await mongoose.connect(mongoUri);
  console.log('MongoDB connected successfully');

  const existingEmployeeWithSameEmail = await Employee.findOne({ email: adminEmail });

  if (existingEmployeeWithSameEmail) {
    console.log(`Employee already exists with this email: ${adminEmail}`);
    console.log('No changes were made. Change FIRST_ADMIN_EMAIL in .env to a new email, then run seed again.');
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(`${adminPassword}${pepper}`, saltRounds);

  await Employee.create({
    fullName: adminFullName,
    email: adminEmail,
    password: hashedPassword,
    role: 'Admin',
    shift: adminShift,
    salary: adminSalary,
    isActive: true,
  });

  console.log(`New Admin created successfully: ${adminEmail}`);
  console.log('Login credentials loaded from .env:');
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);

  await mongoose.disconnect();
};

runSeedAdmin().catch(async (error: Error) => {
  console.error('Seed admin failed:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});
