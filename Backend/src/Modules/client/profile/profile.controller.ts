import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { Guest } from '../../../DB/Models/guest.model.js';
import { Booking } from '../../../DB/Models/booking.model.js';
import { Review } from '../../../DB/Models/review.model.js';
import { IGuest } from '../../../DB/Models/guest.model.js';
import { IBooking } from '../../../DB/Models/booking.model.js';
import { IReview } from '../../../DB/Models/review.model.js';

dotenv.config();


interface ProfileData {
  guest: IGuest;
}

interface BookingHistoryData {
  bookings: IBooking[];
}

interface UserReviewsData {
  reviews: IReview[];
}


interface UpdateProfileBody {
  fullName?: string;
  phone?: string;
  nationalId?: string;
  preferences?: Record<string, unknown>;
}

interface changePasswordBody {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface UpdateProfileImageBody {
  avatar?: string;
}


interface ApiResponse<T = null> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}


export const getProfile = async (
  req: Request,
  res: Response<ApiResponse<ProfileData>>
): Promise<void> => {
  try {
    const guest: IGuest | null = res.locals.user
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


export const updateProfile = async (
  req: Request<{}, ApiResponse<ProfileData>, UpdateProfileBody>,
  res: Response<ApiResponse<ProfileData>>
): Promise<void> => {
  try {
    const updates: UpdateProfileBody = { ...req.body };

    const guest: IGuest | null = await Guest.findByIdAndUpdate(
      res.locals.user.id,
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

    await guest.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { guest },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const changeMyPassword = async (
  req: Request<{}, ApiResponse<ProfileData>, changePasswordBody>,
  res: Response<ApiResponse<ProfileData>>
): Promise<void> => {
  try {
    const { currentPassword, newPassword, confirmPassword }: changePasswordBody = { ...req.body };

    if (!currentPassword || !newPassword || !confirmPassword) {
      res.status(400).json({
        success: false,
        message: 'Please provide current, new, and confirm passwords',
      });
      return;
    };

    const guest: IGuest | null = await Guest.findById(res.locals.user.id).select('password');

    if (!guest) {
      res.status(404).json({
        success: false,
        message: 'Guest not found',
      });
      return;
    }

    const isPasswordMatch: boolean = await bcrypt.compare(`${currentPassword}${process.env.PEPPER}`, guest.password);
    if (!isPasswordMatch) {
      res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
      return;
    } else if (newPassword !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: 'New password and confirm password do not match',
      });
      return;
    }

    const hashedNewPassword: string = await bcrypt.hash(`${newPassword}${process.env.PEPPER}`, parseInt(process.env.SALT_ROUNDS as string));

    guest.password = hashedNewPassword;

    await guest.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { guest },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const getProfileImage = async (
  req: Request,
  res: Response<ApiResponse<{ avatar: string }>>
): Promise<void> => {
  try {
    const guest: IGuest | null = res.locals.user;
    console.log(res.locals.user);
    if (!guest || !guest.avatar) {
      res.status(500).json({
        success: false,
        message: "Image not found!",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { avatar: guest.avatar },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const updateProfileImage = async (
  req: Request<{}, ApiResponse<{ avatar: string }>, UpdateProfileImageBody>,
  res: Response<ApiResponse<{ avatar: string }>>
): Promise<void> => {
  try {

    const guest: IGuest | null = await Guest.findById(
      res.locals.user.id
    ).select('-password');

    if (!guest) {
      res.status(404).json({
        success: false,
        message: 'Guest not found',
      });
      return;
    }

    if (req.file) {
      const file = req.file as Express.Multer.File;
      guest.avatar = file.path;
    };

    await guest.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { avatar: guest.avatar },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const removeProfileImage = async (
  req: Request,
  res: Response<ApiResponse<{ avatar: string }>>
): Promise<void> => {
  try {
    const guest: IGuest | null = await Guest.findById(res.locals.user.id).select('avatar');
    console.log(res.locals.user);
    if (!guest || !guest.avatar) {
      res.status(500).json({
        success: false,
        message: "Image or guest not found!",
      });
      return;
    }
    guest.avatar = "https://res.cloudinary.com/dqssohz9k/image/upload/v1782656034/rooms/1782656032950-blank-profile-picture-973460_960_720.webp.webp";
    await guest.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { avatar: guest.avatar },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const getBookingHistory = async (
  req: Request,
  res: Response<ApiResponse<BookingHistoryData>>
): Promise<void> => {
  try {
    const bookings: IBooking[] = await Booking.find({ guestId: req.params.id })
      .populate('roomId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: { bookings },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const getUserReviews = async (
  req: Request,
  res: Response<ApiResponse<UserReviewsData>>
): Promise<void> => {
  try {
    const reviews: IReview[] = await Review.find({ guestId: req.params.id })
      .populate('bookingId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: { reviews },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};