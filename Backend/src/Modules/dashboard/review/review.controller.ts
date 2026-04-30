import { Request, Response } from 'express';
import { Review } from '../../../DB/Models/review.model.js';
import { IReview, ReviewStatus } from '../../../DB/Models/review.model.js';
import { Types } from 'mongoose';


interface CreateReviewBody {
  guestId: Types.ObjectId;
  roomId: Types.ObjectId;
  bookingId: Types.ObjectId;
  rating: number;
  comment?: string;
  images?: string[];
}

interface UpdateReviewBody {
  rating?: number;
  comment?: string;
  images?: string[];
  status?: ReviewStatus;
}


interface ReviewsData {
  reviews: IReview[];
}

interface ReviewData {
  review: IReview;
}


interface ApiResponse<T = null> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}


export const getAllReviews = async (
  req: Request,
  res: Response<ApiResponse<ReviewsData>>
): Promise<void> => {
  try {
    const reviews: IReview[] = await Review.find()
      .populate('guestId', 'fullName email')
      .populate('roomId', 'roomNumber')
      .populate('bookingId');

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


export const getReviewById = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<ReviewData>>
): Promise<void> => {
  try {
    const review: IReview | null = await Review.findById(req.params.id)
      .populate('guestId')
      .populate('roomId')
      .populate('bookingId');

    if (!review) {
      res.status(404).json({
        success: false,
        message: 'Review not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { review },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const getApprovedReviews = async (
  req: Request,
  res: Response<ApiResponse<ReviewsData>>
): Promise<void> => {
  try {
    const reviews: IReview[] = await Review.find({ status: 'Approved' as ReviewStatus })
      .populate('guestId', 'fullName')
      .populate('roomId', 'roomNumber');

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


export const createReview = async (
  req: Request<{}, ApiResponse<ReviewData>, CreateReviewBody>,
  res: Response<ApiResponse<ReviewData>>
): Promise<void> => {
  try {
    const review: IReview = await Review.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: { review },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const updateReview = async (
  req: Request<{ id: string }, ApiResponse<ReviewData>, UpdateReviewBody>,
  res: Response<ApiResponse<ReviewData>>
): Promise<void> => {
  try {
    const review: IReview | null = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!review) {
      res.status(404).json({
        success: false,
        message: 'Review not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: { review },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const approveReview = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<ReviewData>>
): Promise<void> => {
  try {
    const review: IReview | null = await Review.findByIdAndUpdate(
      req.params.id,
      { status: 'Approved' as ReviewStatus, isApproved: true },
      { new: true }
    );

    if (!review) {
      res.status(404).json({
        success: false,
        message: 'Review not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Review approved successfully',
      data: { review },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const deleteReview = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const review: IReview | null = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      res.status(404).json({
        success: false,
        message: 'Review not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};