import { Request, Response } from 'express';
import { RoomCategory } from '../../../DB/Models/roomCategory.model.js';
import { IRoomCategory, ICapacity } from '../../../DB/Models/roomCategory.model.js';


interface CreateRoomCategoryBody {
  name: string;
  basePrice: number;
  capacity?: ICapacity;
  amenities?: string[];
  images?: string[];
  description?: string;
}

interface UpdateRoomCategoryBody {
  name?: string;
  basePrice?: number;
  capacity?: ICapacity;
  amenities?: string[];
  images?: string[];
  description?: string;
}


interface RoomCategoriesData {
  categories: IRoomCategory[];
}

interface RoomCategoryData {
  category: IRoomCategory;
}


interface ApiResponse<T = null> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}


export const getAllRoomCategories = async (
  req: Request,
  res: Response<ApiResponse<RoomCategoriesData>>
): Promise<void> => {
  try {
    const categories: IRoomCategory[] = await RoomCategory.find();

    res.status(200).json({
      success: true,
      count: categories.length,
      data: { categories },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const getRoomCategoryById = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<RoomCategoryData>>
): Promise<void> => {
  try {
    const category: IRoomCategory | null = await RoomCategory.findById(req.params.id);

    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Room category not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { category },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const createRoomCategory = async (
  req: Request<{}, ApiResponse<RoomCategoryData>, CreateRoomCategoryBody>,
  res: Response<ApiResponse<RoomCategoryData>>
): Promise<void> => {
  try {
    const category: IRoomCategory = await RoomCategory.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Room category created successfully',
      data: { category },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const updateRoomCategory = async (
  req: Request<{ id: string }, ApiResponse<RoomCategoryData>, UpdateRoomCategoryBody>,
  res: Response<ApiResponse<RoomCategoryData>>
): Promise<void> => {
  try {
    const category: IRoomCategory | null = await RoomCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Room category not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Room category updated successfully',
      data: { category },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const deleteRoomCategory = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const category: IRoomCategory | null = await RoomCategory.findByIdAndDelete(req.params.id);

    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Room category not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Room category deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};