import { Request, Response } from 'express';
import { Room } from '../../../DB/Models/room.model.js';
import { RoomCategory } from '../../../DB/Models/roomCategory.model.js';
import { IRoom } from '../../../DB/Models/room.model.js';
import { IRoomCategory } from '../../../DB/Models/roomCategory.model.js';
import { Types } from 'mongoose';


interface AvailableRoomsQuery {
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  minPrice?: string;
  maxPrice?: string;
  amenities?: string;
  sortBy?: 'price' | 'createdAt';
}

interface SearchRoomsBody {
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children?: number;
}


interface AvailableRoomsData {
  rooms: IRoom[];
}

interface RoomDetailsData {
  room: IRoom;
}

interface SearchRoomsData {
  checkIn: string;
  checkOut: string;
  guests: {
    adults: number;
    children: number;
  };
  rooms: IRoom[];
}


interface ApiResponse<T = null> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}


interface PopulatedRoom extends Omit<IRoom, 'categoryId'> {
  categoryId: IRoomCategory;
}


export const getAvailableRooms = async (
  req: Request<{}, ApiResponse<AvailableRoomsData>, {}, AvailableRoomsQuery>,
  res: Response<ApiResponse<AvailableRoomsData>>
): Promise<void> => {
  try {
    const {
      minPrice,
      maxPrice,
      sortBy = 'price',
    } = req.query;

    const rooms = await Room.find({ status: 'Available' })
      .populate('categoryId', 'name description basePrice amenities')
      .sort(sortBy === 'price' ? { createdAt: 1 } : { createdAt: -1 }) as unknown as PopulatedRoom[];

    let filteredRooms: PopulatedRoom[] = rooms;
    if (minPrice || maxPrice) {
      filteredRooms = rooms.filter((room) => {
        const price: number = room.categoryId.basePrice;
        if (minPrice && price < Number(minPrice)) return false;
        if (maxPrice && price > Number(maxPrice)) return false;
        return true;
      });
    }

    res.status(200).json({
      success: true,
      count: filteredRooms.length,
      data: { rooms: filteredRooms as unknown as IRoom[] },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const getRoomDetails = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<RoomDetailsData>>
): Promise<void> => {
  try {
    const room: IRoom | null = await Room.findById(req.params.id)
      .populate('categoryId', 'name description basePrice amenities');

    if (!room) {
      res.status(404).json({
        success: false,
        message: 'Room not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { room },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const searchRooms = async (
  req: Request<{}, ApiResponse<SearchRoomsData>, SearchRoomsBody>,
  res: Response<ApiResponse<SearchRoomsData>>
): Promise<void> => {
  try {
    const { checkInDate, checkOutDate, adults, children = 0 } = req.body;

    const totalGuests: number = Number(adults) + Number(children);

    const categories: IRoomCategory[] = await RoomCategory.find({
      'capacity.adults': { $gte: adults },
      'capacity.children': { $gte: children },
    });

    const categoryIds: Types.ObjectId[] = categories.map(
      (cat) => cat._id as Types.ObjectId
    );

    console.log(categoryIds)
    const rooms: IRoom[] = await Room.find({
      categoryId: { $in: categoryIds },
      status: 'Available',
    }).populate('categoryId');

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: {
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: { adults, children },
        rooms,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};