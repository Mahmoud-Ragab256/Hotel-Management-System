import { Request, Response } from 'express';
import { Booking } from '../../../DB/Models/booking.model.js';
import { Room } from '../../../DB/Models/room.model.js';
import { IInvoice, Invoice } from '../../../DB/Models/invoice.model.js';
import { IBooking } from '../../../DB/Models/booking.model.js';
import { Types } from 'mongoose';


interface CreateBookingBody {
  guestId: Types.ObjectId;
  roomId: Types.ObjectId;
  checkInDate: Date;
  checkOutDate: Date;
  adults: number;
  children: number;
  specialRequests?: string;
  totalPrice: number;
  paymentMethod: string;
}


interface ApiResponse<T = null> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}

interface CreateBookingData {
  booking: IBooking;
  invoice: IInvoice;
  bookingId: Types.ObjectId;
}

interface BookingDetailsData {
  booking: IBooking;
  invoice: IInvoice | null;
}


export const createBooking = async (
  req: Request<{}, ApiResponse<CreateBookingData>, CreateBookingBody>,
  res: Response<ApiResponse<CreateBookingData>>
): Promise<void> => {
  try {
    const {
      guestId,
      roomId,
      checkInDate,
      checkOutDate,
      specialRequests,
      totalPrice,
      paymentMethod
    } = req.body;

    const room = await Room.findById(roomId);
    if (!room || room.status !== 'Available') {
      res.status(400).json({
        success: false,
        message: 'Room is not available',
      });
      return;
    }

    const booking: IBooking = await Booking.create({
      guestId,
      roomId,
      checkInDate,
      checkOutDate,
      totalPrice,
      status: 'Pending',
      specialRequests,
    });

    room.status = 'Occupied';
    await room.save();

    const invoice = await Invoice.create({
      bookingId: booking._id,
      totalAmount: totalPrice,
      paidAmount: 0,
      status: 'Pending',
      method: paymentMethod
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        booking,
        invoice,
        bookingId: booking._id,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const getBookingDetails = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<BookingDetailsData>>
): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('guestId', 'fullName email phone')
      .populate('roomId');

    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
      return;
    }

    const invoice = await Invoice.findOne({ bookingId: booking._id });

    res.status(200).json({
      success: true,
      data: {
        booking,
        invoice,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const getUserBookings = async (
  req: Request<{ guestId: string }>,
  res: Response<ApiResponse<IBooking[]>>
): Promise<void> => {
  try {
    const { guestId } = req.params;

    const bookings: IBooking[] = await Booking.find({ guestId })
      .populate('roomId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const cancelBooking = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const booking: IBooking | null = await Booking.findById(req.params.id);

    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
      return;
    }

    if (booking.status === 'CheckedIn' || booking.status === 'CheckedOut') {
      res.status(400).json({
        success: false,
        message: 'Cannot cancel this booking',
      });
      return;
    }

    booking.status = 'Cancelled';
    booking.cancelledAt = new Date();
    await booking.save();

    await Room.findByIdAndUpdate(booking.roomId, { status: 'Available' });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};