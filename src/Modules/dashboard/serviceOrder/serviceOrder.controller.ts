import { Request, Response } from 'express';
import { ServiceOrder } from '../../../DB/Models/serviceOrder.model.js';
import { IServiceOrder, ServiceOrderStatus } from '../../../DB/Models/serviceOrder.model.js';
import { Types } from 'mongoose';


interface CreateServiceOrderBody {
  bookingId: Types.ObjectId;
  serviceId: Types.ObjectId;
  assignedEmployeeId?: Types.ObjectId;
  quantity?: number;
  totalPrice: number;
  status?: ServiceOrderStatus;
  notes?: string;
  orderTime?: Date;
  deliveryTime?: Date;
  images?: string[];
}

interface UpdateServiceOrderBody {
  assignedEmployeeId?: Types.ObjectId;
  quantity?: number;
  totalPrice?: number;
  status?: ServiceOrderStatus;
  notes?: string;
  deliveryTime?: Date;
  images?: string[];
}


interface ServiceOrdersData {
  orders: IServiceOrder[];
}

interface ServiceOrderData {
  order: IServiceOrder;
}


interface ApiResponse<T = null> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}


export const getAllServiceOrders = async (
  req: Request,
  res: Response<ApiResponse<ServiceOrdersData>>
): Promise<void> => {
  try {
    const orders: IServiceOrder[] = await ServiceOrder.find()
      .populate('bookingId')
      .populate('serviceId', 'name price category')
      .populate('assignedEmployeeId', 'fullName role');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: { orders },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const getServiceOrderById = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<ServiceOrderData>>
): Promise<void> => {
  try {
    const order: IServiceOrder | null = await ServiceOrder.findById(req.params.id)
      .populate('bookingId')
      .populate('serviceId')
      .populate('assignedEmployeeId');

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Service order not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const createServiceOrder = async (
  req: Request<{}, ApiResponse<ServiceOrderData>, CreateServiceOrderBody>,
  res: Response<ApiResponse<ServiceOrderData>>
): Promise<void> => {
  try {
    const order: IServiceOrder = await ServiceOrder.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Service order created successfully',
      data: { order },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const updateServiceOrder = async (
  req: Request<{ id: string }, ApiResponse<ServiceOrderData>, UpdateServiceOrderBody>,
  res: Response<ApiResponse<ServiceOrderData>>
): Promise<void> => {
  try {
    const order: IServiceOrder | null = await ServiceOrder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Service order not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Service order updated successfully',
      data: { order },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const deleteServiceOrder = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const order: IServiceOrder | null = await ServiceOrder.findByIdAndDelete(req.params.id);

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Service order not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Service order deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};