import { Request, RequestHandler, Response } from 'express';
import { Employee, IEmployee } from '../../../DB/Models/employee.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import crypto from 'crypto';
import sendResetPassEmail from '../../../utils/sendEmail.js';

dotenv.config()


interface RegisterRequestBody {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  nationalId: string;
  preferences?: string[];
}

interface LoginRequestBody {
  email: string;
  password: string;
}

interface ForgotPasswordRequestBody {
  email: string;
}

interface ResetCodeRequestBody {
  email: string;
  resetCode: string;
}

interface ResetPasswordRequestBody {
  email: string;
  newPassword: string;
}


interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data?: T;
  token?: string;
}


export const login: RequestHandler = async (
  req: Request<{}, ApiResponse, LoginRequestBody>,
  res: Response<ApiResponse<Partial<IEmployee>>>
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const employee: IEmployee | null = await Employee.findOne({ email });
    if (!employee) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }
    console.log(password)
    console.log(employee.password)
    const isMatch: boolean = await bcrypt.compare(`${password}${process.env.PEPPER}`, employee.password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    const EmployeeId: string = employee._id.toString();

    const token: string = jwt.sign({ EmployeeId }, process.env.SECRET as string, { expiresIn: process.env.TOKEN_EXPIRE_IN as any });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: employee._id,
        fullName: employee.fullName,
        email: employee.email,
        shift: employee.shift,
        role: employee.role,
      },
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const forgotPassword = async (
  req: Request<{}, ApiResponse, ForgotPasswordRequestBody>,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { email } = req.body;

    const employee: IEmployee | null = await Employee.findOne({ email });
    if (!employee) {
      res.status(404).json({
        success: false,
        message: 'Email not found',
      });
      return;
    }

    const resetCode: string = crypto.randomInt(100000, 999999).toString();
    const hashedResetCode: string = crypto.createHash('sha256').update(resetCode).digest('hex');
    const expireDate: Date = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    employee.passwordResetCode = hashedResetCode;
    employee.passwordResetExpires = expireDate;
    employee.passwordResetVerified = false;
    await employee.save();

    const mailOptions = { email, userName: employee.fullName, resetCode };
    sendResetPassEmail(mailOptions);


    res.status(200).json({
      success: true,
      message: 'Reset code sent to your email',
    });
    return;
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const resetPassCode = async (
  req: Request<{}, ApiResponse, ResetCodeRequestBody>,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { email, resetCode } = req.body;

    const hashedResetCode = crypto.createHash('sha256').update(resetCode).digest('hex');

    const employee: IEmployee | null = await Employee.findOne({
      email,
      passwordResetCode: hashedResetCode,
      passwordResetExpires: { $gte: Date.now() }
    });

    if (!employee) {
      res.status(500).json({
        success: false,
        message: "Reset code is incorrect or expired",
      })
      return;
    }

    employee.passwordResetVerified = true;
    await employee.save();

    res.status(200).json({
      success: true,
      message: 'Reset Code is verified',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    })
  }
}


export const resetPassword = async (
  req: Request<{}, ApiResponse, ResetPasswordRequestBody>,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { email, newPassword } = req.body;

    const employee: IEmployee | null = await Employee.findOne({
      email,
      passwordResetVerified: true
    });
    if (!employee) {
      res.status(404).json({
        success: false,
        message: 'Unable process, please check reset code first',
      });
      return;
    }

    const hashedPassword: string = await bcrypt.hash(`${newPassword}${process.env.PEPPER}`, parseInt(process.env.SALT_ROUNDS as string));

    employee.password = hashedPassword;
    employee.passwordResetCode = undefined;
    employee.passwordResetExpires = undefined;
    employee.passwordResetVerified = false;
    employee.updatedAt = new Date(Date.now())
    await employee.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};