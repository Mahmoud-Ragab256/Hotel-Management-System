import { Request, Response } from 'express';
import { Guest } from '../../../DB/Models/guest.model.js';
import { IGuest, VipLevel } from '../../../DB/Models/guest.model.js';
import bcrypt from 'bcrypt';


interface CreateGuestBody {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  nationalId: string;
  vipLevel?: VipLevel;
  preferences?: Record<string, unknown>;
}

interface UpdateGuestBody {
  fullName?: string;
  phone?: string;
  nationalId?: string;
  vipLevel?: VipLevel;
  preferences?: Record<string, unknown>;
  avatar?: string;
}

interface LoginGuestBody {
  email: string;
  password: string;
}


interface GuestsData {
  guests: IGuest[];
}

interface GuestData {
  guest: IGuest;
}

interface CreateGuestData {
  guest: {
    id: IGuest['_id'];
    fullName: string;
    email: string;
    phone: string;
    vipLevel: VipLevel;
  };
}

interface LoginGuestData {
  guest: {
    id: IGuest['_id'];
    fullName: string;
    email: string;
    phone: string;
    vipLevel: VipLevel;
  };
}


interface ApiResponse<T = null> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}


export const getAllGuests = async (
  req: Request,
  res: Response<ApiResponse<GuestsData>>
): Promise<void> => {
  try {
    const guests: IGuest[] = await Guest.find().select('-password');

    res.status(200).json({
      success: true,
      count: guests.length,
      data: { guests },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const getGuestById = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<GuestData>>
): Promise<void> => {
  try {
    const guest: IGuest | null = await Guest.findById(req.params.id).select('-password');

    if (!guest) {
      res.status(404).json({
        success: false,
        message: 'Guest not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { guest },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const createGuest = async (
  req: Request<{}, ApiResponse<CreateGuestData>, CreateGuestBody>,
  res: Response<ApiResponse<CreateGuestData>>
): Promise<void> => {
  try {
    const { fullName, email, password, phone, nationalId, vipLevel, preferences } = req.body;

    const existingGuest: IGuest | null = await Guest.findOne({ email });
    if (existingGuest) {
      res.status(400).json({
        success: false,
        message: 'Guest with this email already exists',
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
      vipLevel,
      preferences,
    });

    res.status(201).json({
      success: true,
      message: 'Guest registered successfully',
      data: {
        guest: {
          id: guest._id,
          fullName: guest.fullName,
          email: guest.email,
          phone: guest.phone,
          vipLevel: guest.vipLevel,
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


export const updateGuest = async (
  req: Request<{ id: string }, ApiResponse<GuestData>, UpdateGuestBody>,
  res: Response<ApiResponse<GuestData>>
): Promise<void> => {
  try {
    const updates: UpdateGuestBody = { ...req.body };

    const guest: IGuest | null = await Guest.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!guest) {
      res.status(404).json({
        success: false,
        message: 'Guest not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Guest updated successfully',
      data: { guest },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const deleteGuest = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const guest: IGuest | null = await Guest.findByIdAndDelete(req.params.id);

    if (!guest) {
      res.status(404).json({
        success: false,
        message: 'Guest not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Guest deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const loginGuest = async (
  req: Request<{}, ApiResponse<LoginGuestData>, LoginGuestBody>,
  res: Response<ApiResponse<LoginGuestData>>
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const guest: IGuest | null = await Guest.findOne({ email });
    if (!guest) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    const isMatch: boolean = await bcrypt.compare(`${password}${process.env.PEPPER}`, guest.password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        guest: {
          id: guest._id,
          fullName: guest.fullName,
          email: guest.email,
          phone: guest.phone,
          vipLevel: guest.vipLevel,
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