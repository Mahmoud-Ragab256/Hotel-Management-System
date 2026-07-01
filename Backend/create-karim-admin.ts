import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { connectDB } from "./src/DB/connection.js";
import { Employee } from "./src/DB/Models/employee.model.js";

dotenv.config();

const adminData = {
  fullName: "Karim Mohamed",
  email: "karim.mohamed.admin@gmail.com",
  password: "123456",
  role: "Admin",
  shift: "Morning",
  salary: 15000,
  isActive: true
};

async function run() {
  await connectDB();

  const pepper = process.env.PEPPER?.trim() || "";
  const saltRounds = Number(process.env.SALT_ROUNDS || 10);

  const hashedPassword = await bcrypt.hash(adminData.password + pepper, saltRounds);

  const admin = await Employee.findOneAndUpdate(
    { email: adminData.email.toLowerCase() },
    {
      fullName: adminData.fullName,
      email: adminData.email.toLowerCase(),
      password: hashedPassword,
      role: adminData.role,
      shift: adminData.shift,
      salary: adminData.salary,
      isActive: adminData.isActive
    },
    { upsert: true, new: true, runValidators: true }
  );

  console.log("Admin created/updated successfully ✅");
  console.log("Name:", admin.fullName);
  console.log("Email:", adminData.email);
  console.log("Password:", adminData.password);

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error("Failed ❌");
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
