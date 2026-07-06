import { Request, Response } from 'express';
import { Room } from '../../../DB/Models/room.model.js';
import { RoomCategory } from '../../../DB/Models/roomCategory.model.js';
import { Service } from '../../../DB/Models/service.model.js';
import { Review } from '../../../DB/Models/review.model.js';
import { IRoomCategory } from '../../../DB/Models/roomCategory.model.js';
import { IService } from '../../../DB/Models/service.model.js';
import { IReview } from '../../../DB/Models/review.model.js';

interface LandingStatsData {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  maintenanceRooms: number;
  totalRoomCategories: number;
  totalServices: number;
  totalReviews: number;
}

interface LandingPageData {
  stats: LandingStatsData;
  availableRooms: number;
  roomCategories: IRoomCategory[];
  services: IService[];
  reviews: IReview[];
}

interface StatisticsData {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  maintenanceRooms: number;
  totalRoomCategories: number;
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

const buildLandingStats = async (): Promise<LandingStatsData> => {
  const [
    totalRooms,
    availableRooms,
    occupiedRooms,
    maintenanceRooms,
    totalRoomCategories,
    totalServices,
    totalReviews,
  ] = await Promise.all([
    Room.countDocuments(),
    Room.countDocuments({ status: 'Available' }),
    Room.countDocuments({ status: 'Occupied' }),
    Room.countDocuments({ status: 'Maintenance' }),
    RoomCategory.countDocuments(),
    Service.countDocuments({ isAvailable: true }),
    Review.countDocuments({ isApproved: true }),
  ]);

  return {
    totalRooms,
    availableRooms,
    occupiedRooms,
    maintenanceRooms,
    totalRoomCategories,
    totalServices,
    totalReviews,
  };
};

export const getLandingPageData = async (
  req: Request,
  res: Response<ApiResponse<LandingPageData>>
): Promise<void> => {
  try {
    const [stats, roomCategories, services, reviews] = await Promise.all([
      buildLandingStats(),
      RoomCategory.find()
        .select('name description basePrice capacity amenities images createdAt')
        .sort({ createdAt: -1 })
        .limit(6),
      Service.find({ isAvailable: true })
        .select('name description details price category maxCapacity images createdAt')
        .sort({ createdAt: -1 })
        .limit(8),
      Review.find({ isApproved: true })
        .populate('guestId', 'fullName')
        .select('rating comment guestId createdAt')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats,
        availableRooms: stats.availableRooms,
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
    const stats = await buildLandingStats();

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
      .select('name description basePrice capacity amenities images createdAt')
      .sort({ createdAt: -1 })
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
