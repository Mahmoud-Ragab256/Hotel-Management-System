import { Request, Response } from 'express';
import { Room } from '../../../DB/Models/room.model.js';
import { RoomCategory } from '../../../DB/Models/roomCategory.model.js';
import { Service } from '../../../DB/Models/service.model.js';
import { Review } from '../../../DB/Models/review.model.js';
import { IRoom } from '../../../DB/Models/room.model.js';
import { IRoomCategory } from '../../../DB/Models/roomCategory.model.js';
import { IService } from '../../../DB/Models/service.model.js';
import { IReview } from '../../../DB/Models/review.model.js';


interface LandingPageData {
  availableRooms: number;
  roomCategories: IRoomCategory[];
  services: IService[];
  reviews: IReview[];
}

interface StatisticsData {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  totalServices: number;
  totalReviews: number;
}

interface FeaturedCategoriesData {
  categories: IRoomCategory[];
}


interface ApiResponse<T = null> {
  success: boolean;
  message?: string;
  data?: T;
}


export const getLandingPageData = async (
  req: Request,
  res: Response<ApiResponse<LandingPageData>>
): Promise<void> => {
  try {
    const availableRoomsCount: number = await Room.countDocuments({ status: 'Available' });

    const roomCategories: IRoomCategory[] = await RoomCategory.find()
      .select('name description basePrice amenities')
      .limit(6);

    const services: IService[] = await Service.find({ isAvailable: true })
      .select('name description price category')
      .limit(8);

    const reviews: IReview[] = await Review.find({ isApproved: true })
      .populate('guestId', 'fullName')
      .select('rating comment createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        availableRooms: availableRoomsCount,
        roomCategories,
        services,
        reviews,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const getStatistics = async (
  req: Request,
  res: Response<ApiResponse<StatisticsData>>
): Promise<void> => {
  try {
    const stats: StatisticsData = {
      totalRooms: await Room.countDocuments(),
      availableRooms: await Room.countDocuments({ status: 'Available' }),
      occupiedRooms: await Room.countDocuments({ status: 'Occupied' }),
      totalServices: await Service.countDocuments(),
      totalReviews: await Review.countDocuments({ isApproved: true }),
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const getFeaturedCategories = async (
  req: Request,
  res: Response<ApiResponse<FeaturedCategoriesData>>
): Promise<void> => {
  try {
    const categories: IRoomCategory[] = await RoomCategory.find()
      .select('name description basePrice amenities')
      .limit(3);

    res.status(200).json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};