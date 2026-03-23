import { Request, Response } from 'express';
import { Guest } from '../../../DB/Models/guest.model.js';
import { Booking } from '../../../DB/Models/booking.model.js';
import { Review } from '../../../DB/Models/review.model.js';
import { IGuest } from '../../../DB/Models/guest.model.js';
import { IBooking } from '../../../DB/Models/booking.model.js';
import { IReview } from '../../../DB/Models/review.model.js';


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
    const guest: IGuest | null = res.locals.guest
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
  req: Request<{ id: string }, ApiResponse<ProfileData>, UpdateProfileBody>,
  res: Response<ApiResponse<ProfileData>>
): Promise<void> => {
  try {
    const updates: UpdateProfileBody = { ...req.body };

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


export const getBookingHistory = async (
  req: Request<{ id: string }>,
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
  req: Request<{ id: string }>,
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