import { Request, Response } from 'express';
import { Booking } from '../../../DB/Models/booking.model.js';
import { Service } from '../../../DB/Models/service.model.js';
import { ServiceOrder } from '../../../DB/Models/serviceOrder.model.js';

interface CreateServiceOrderBody {
  bookingId: string;
  serviceId: string;
  quantity?: number;
  notes?: string;
}

interface ApiResponse<T = null> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}

export const getClientServices = async (
  req: Request,
  res: Response<ApiResponse<{ services: unknown[] }>>
): Promise<void> => {
  try {
    const services = await Service.find({ isAvailable: true })
      .select('name category price isAvailable maxCapacity images description')
      .sort({ category: 1, price: 1 });

    res.status(200).json({
      success: true,
      count: services.length,
      data: { services }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message
    });
  }
};

export const createClientServiceOrder = async (
  req: Request<{}, ApiResponse<{ order: unknown }>, CreateServiceOrderBody>,
  res: Response<ApiResponse<{ order: unknown }>>
): Promise<void> => {
  try {
    const guest = res.locals.user;
    const { bookingId, serviceId, notes = '' } = req.body;
    const quantity = Math.max(1, Number(req.body.quantity || 1));

    if (!bookingId || !serviceId) {
      res.status(400).json({ success: false, message: 'Booking and service are required' });
      return;
    }

    const booking = await Booking.findOne({ _id: bookingId, guestId: guest._id });
    if (!booking || ['Cancelled', 'CheckedOut'].includes(booking.status)) {
      res.status(400).json({ success: false, message: 'Active booking not found' });
      return;
    }

    const service = await Service.findOne({ _id: serviceId, isAvailable: true });
    if (!service) {
      res.status(404).json({ success: false, message: 'Service not available' });
      return;
    }

    const order = await ServiceOrder.create({
      bookingId: booking._id,
      serviceId: service._id,
      quantity,
      totalPrice: Number(service.price || 0) * quantity,
      notes,
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      message: 'Service order created successfully',
      data: { order }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message
    });
  }
};
