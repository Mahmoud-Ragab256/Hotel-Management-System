import { Request, RequestHandler, Response } from 'express';
import { Guest, IGuest } from '../../../DB/Models/guest.model.js';
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


export const register: RequestHandler = async (
  req: Request<{}, ApiResponse, RegisterRequestBody>,
  res: Response<ApiResponse<Partial<IGuest>>>
): Promise<void> => {
  try {
    const { fullName, email, password, phone, nationalId, preferences } = req.body;

    const existingGuest: IGuest | null = await Guest.findOne({ email });
    if (existingGuest) {
      res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
      return;
    }

    const hashedPassword: string = await bcrypt.hash(`${password}${process.env.PEPPER}`, parseInt(process.env.SALT_ROUNDS as string));

    const guest: IGuest = await Guest.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
      nationalId,
      preferences,
    });

    const guestId: string = guest._id.toString();

    if (!process.env.SECRET && process.env.TOKEN_EXPIRE_IN) throw new Error("Secret or Token expire in isn't defined");

    const token: string = jwt.sign({ guestId }, process.env.SECRET as string, { expiresIn: process.env.TOKEN_EXPIRE_IN as any });


    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        id: guest._id,
        fullName: guest.fullName,
        email: guest.email,
        phone: guest.phone,
        vipLevel: guest.vipLevel
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

export const login: RequestHandler = async (
  req: Request<{}, ApiResponse, LoginRequestBody>,
  res: Response<ApiResponse<Partial<IGuest>>>
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const guest: IGuest | null = await Guest.findOne({ email });
    if (!guest) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }
    const isMatch: boolean = await bcrypt.compare(`${password}${process.env.PEPPER}`, guest.password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    const guestId: string = guest._id.toString();

    const token: string = jwt.sign({ guestId }, process.env.SECRET as string, { expiresIn: process.env.TOKEN_EXPIRE_IN as any });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: guest._id,
        fullName: guest.fullName,
        email: guest.email,
        phone: guest.phone,
        vipLevel: guest.vipLevel,
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

    const guest: IGuest | null = await Guest.findOne({ email });
    if (!guest) {
      res.status(404).json({
        success: false,
        message: 'Email not found',
      });
      return;
    }

    const resetCode: string = crypto.randomInt(100000, 999999).toString();
    const hashedResetCode: string = crypto.createHash('sha256').update(resetCode).digest('hex');
    const expireDate: Date = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    guest.passwordResetCode = hashedResetCode;
    guest.passwordResetExpires = expireDate;
    guest.passwordResetVerified = false;
    await guest.save();

    const mailOptions = { email, userName: guest.fullName, resetCode };
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

    const guest: IGuest | null = await Guest.findOne({
      email,
      passwordResetCode: hashedResetCode,
      passwordResetExpires: { $gte: Date.now() }
    });

    if (!guest) {
      res.status(500).json({
        success: false,
        message: "Reset code is incorrect or expired",
      })
      return;
    }

    guest.passwordResetVerified = true;
    await guest.save();

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

    const guest: IGuest | null = await Guest.findOne({
      email,
      passwordResetVerified: true
    });
    if (!guest) {
      res.status(404).json({
        success: false,
        message: 'Unable process, please check reset code first',
      });
      return;
    }

    const hashedPassword: string = await bcrypt.hash(`${newPassword}${process.env.PEPPER}`, parseInt(process.env.SALT_ROUNDS as string));

    guest.password = hashedPassword;
    guest.passwordResetCode = undefined;
    guest.passwordResetExpires = undefined;
    guest.passwordResetVerified = false;
    guest.updatedAt = new Date(Date.now())
    await guest.save();

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