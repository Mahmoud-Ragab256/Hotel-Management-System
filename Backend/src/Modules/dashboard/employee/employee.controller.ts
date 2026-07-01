import { Request, Response } from 'express';
import { Employee } from '../../../DB/Models/employee.model.js';
import { IEmployee, EmployeeRole, EmployeeShift } from '../../../DB/Models/employee.model.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { hashPassword, normalizeEmail, verifyPassword } from '../../../utils/password.js';

dotenv.config()


interface CreateEmployeeBody {
  fullName: string;
  email: string;
  password: string;
  role: EmployeeRole;
  shift: EmployeeShift;
  salary: number;
}

interface UpdateEmployeeBody {
  fullName?: string;
  role?: EmployeeRole;
  shift?: EmployeeShift;
  salary?: number;
  isActive?: boolean;
  avatar?: string;
}

interface LoginEmployeeBody {
  email: string;
  password: string;
}


interface EmployeesData {
  employees: IEmployee[];
}

interface EmployeeData {
  employee: IEmployee;
}

interface CreateEmployeeData {
  id: IEmployee['_id'];
  fullName: string;
  email: string;
  role: EmployeeRole;
  shift: EmployeeShift;
}

interface LoginEmployeeData {
  employee: {
    id: IEmployee['_id'];
    fullName: string;
    email: string;
    role: EmployeeRole;
    shift: EmployeeShift;
  };
}


interface ApiResponse<T = null> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}


export const getAllEmployees = async (
  req: Request,
  res: Response<ApiResponse<EmployeesData>>
): Promise<void> => {
  try {
    const employees: IEmployee[] = await Employee.find().select('-password');

    res.status(200).json({
      success: true,
      count: employees.length,
      data: { employees },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const getEmployeeById = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<EmployeeData>>
): Promise<void> => {
  try {
    const employee: IEmployee | null = await Employee.findById(req.params.id).select('-password');

    if (!employee) {
      res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { employee },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const createEmployee = async (
  req: Request<{}, ApiResponse<CreateEmployeeData>, CreateEmployeeBody>,
  res: Response<ApiResponse<CreateEmployeeData>>
): Promise<void> => {
  try {
    const { fullName, password, role, shift, salary } = req.body;
    const email = normalizeEmail(req.body.email);

    const existingEmployee: IEmployee | null = await Employee.findOne({ email });
    if (existingEmployee) {
      res.status(400).json({
        success: false,
        message: 'Employee with this email already exists',
      });
      return;
    }

    const hashedPassword: string = await hashPassword(password);

    const employee: IEmployee = await Employee.create({
      fullName,
      email,
      password: hashedPassword,
      role,
      shift,
      salary,
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: {
        id: employee._id,
        fullName: employee.fullName,
        email: employee.email,
        role: employee.role,
        shift: employee.shift,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const updateEmployee = async (
  req: Request<{ id: string }, ApiResponse<EmployeeData>, UpdateEmployeeBody>,
  res: Response<ApiResponse<EmployeeData>>
): Promise<void> => {
  try {
    const updates: UpdateEmployeeBody = { ...req.body };

    const employee: IEmployee | null = await Employee.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!employee) {
      res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
      return;
    }

    if (req.file) {
      const file = req.file as Express.Multer.File;
      employee.avatar = file.path;
    };

    await employee.save();

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: { employee },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const getProfileImage = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<String>>
): Promise<void> => {
  try {
    const employee: IEmployee | null = await Employee.findOne({ _id: req.params.id });

    if (!employee || !employee.avatar) {
      res.status(500).json({
        success: false,
        message: "Image or employee not found!",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: employee.avatar,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const deleteEmployee = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const employee: IEmployee | null = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const loginEmployee = async (
  req: Request<{}, ApiResponse<LoginEmployeeData>, LoginEmployeeBody>,
  res: Response<ApiResponse<LoginEmployeeData>>
): Promise<void> => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    const employee: IEmployee | null = await Employee.findOne({ email });
    if (!employee) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    if (!employee.isActive) {
      res.status(401).json({
        success: false,
        message: 'Account is inactive',
      });
      return;
    }

    const { matched, needsRehash } = await verifyPassword(password, employee.password);
    if (!matched) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    if (needsRehash) {
      employee.password = await hashPassword(password);
      await employee.save();
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        employee: {
          id: employee._id,
          fullName: employee.fullName,
          email: employee.email,
          role: employee.role,
          shift: employee.shift,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};