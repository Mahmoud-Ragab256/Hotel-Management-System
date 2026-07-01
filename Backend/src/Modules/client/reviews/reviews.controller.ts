import { Request, Response } from 'express';
import { Booking } from '../../../DB/Models/booking.model.js';
import { Review } from '../../../DB/Models/review.model.js';

interface CreateReviewBody {
  bookingId: string;
  roomId: string;
  rating: number;
  comment?: string;
}

interface ApiResponse<T = null> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}

export const getClientReviews = async (
  req: Request,
  res: Response<ApiResponse<{ reviews: unknown[] }>>
): Promise<void> => {
  try {
    const reviews = await Review.find({ $or: [{ isApproved: true }, { status: 'Approved' }] })
      .populate('guestId', 'fullName avatar')
      .populate('roomId', 'roomNumber')
      .select('rating comment createdAt guestId roomId status isApproved')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: { reviews }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message
    });
  }
};

export const createClientReview = async (
  req: Request<{}, ApiResponse<{ review: unknown }>, CreateReviewBody>,
  res: Response<ApiResponse<{ review: unknown }>>
): Promise<void> => {
  try {
    const guest = res.locals.user;
    const { bookingId, roomId, comment = '' } = req.body;
    const rating = Number(req.body.rating);

    if (!bookingId || !roomId || !rating) {
      res.status(400).json({ success: false, message: 'Booking, room, and rating are required' });
      return;
    }

    if (rating < 1 || rating > 5) {
      res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
      return;
    }

    const booking = await Booking.findOne({ _id: bookingId, guestId: guest._id, roomId });
    if (!booking || booking.status === 'Cancelled') {
      res.status(400).json({ success: false, message: 'Valid booking not found for this review' });
      return;
    }

    const existing = await Review.findOne({ guestId: guest._id, bookingId: booking._id });
    if (existing) {
      res.status(400).json({ success: false, message: 'You already reviewed this booking' });
      return;
    }

    const review = await Review.create({
      guestId: guest._id,
      bookingId: booking._id,
      roomId,
      rating,
      comment,
      status: 'Pending',
      isApproved: false
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully and waiting for approval',
      data: { review }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message
    });
  }
};
