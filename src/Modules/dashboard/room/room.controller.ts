import { Request, Response } from 'express';
import { Room } from '../../../DB/Models/room.model.js';
import { IRoom, RoomStatus, IMapCoordinates, ISmartDevices } from '../../../DB/Models/room.model.js';
import { Types } from 'mongoose';


interface CreateRoomBody {
  roomNumber: string;
  categoryId: Types.ObjectId;
  status?: RoomStatus;
  floor: number;
  mapCoordinates?: IMapCoordinates;
  smartDevices?: ISmartDevices;
  images?: string[];
}

interface UpdateRoomBody {
  roomNumber?: string;
  categoryId?: Types.ObjectId;
  status?: RoomStatus;
  floor?: number;
  mapCoordinates?: IMapCoordinates;
  smartDevices?: ISmartDevices;
  images?: string[];
}


interface RoomsData {
  rooms: IRoom[];
}

interface RoomData {
  room: IRoom;
}


interface ApiResponse<T = null> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}


export const getAllRooms = async (
  req: Request,
  res: Response<ApiResponse<RoomsData>>
): Promise<void> => {
  try {
    const rooms: IRoom[] = await Room.find().populate('categoryId', 'name basePrice');

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: { rooms },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const getRoomById = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<RoomData>>
): Promise<void> => {
  try {
    const room: IRoom | null = await Room.findById(req.params.id).populate('categoryId');

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


export const getAvailableRooms = async (
  req: Request,
  res: Response<ApiResponse<RoomsData>>
): Promise<void> => {
  try {
    const rooms: IRoom[] = await Room.find({ status: 'Available' as RoomStatus })
      .populate('categoryId');

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: { rooms },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const createRoom = async (
  req: Request<{}, ApiResponse<RoomData>, CreateRoomBody>,
  res: Response<ApiResponse<RoomData>>
): Promise<void> => {
  try {
    const room: IRoom = await Room.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: { room },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const updateRoom = async (
  req: Request<{ id: string }, ApiResponse<RoomData>, UpdateRoomBody>,
  res: Response<ApiResponse<RoomData>>
): Promise<void> => {
  try {
    const room: IRoom | null = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!room) {
      res.status(404).json({
        success: false,
        message: 'Room not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      data: { room },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const deleteRoom = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const room: IRoom | null = await Room.findByIdAndDelete(req.params.id);

    if (!room) {
      res.status(404).json({
        success: false,
        message: 'Room not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Room deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};