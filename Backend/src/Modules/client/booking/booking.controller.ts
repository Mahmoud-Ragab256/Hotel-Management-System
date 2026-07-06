import { Request, Response } from 'express';
import { Booking, IBooking, ensureBookingNumber } from '../../../DB/Models/booking.model.js';
import { Room } from '../../../DB/Models/room.model.js';
import { IInvoice, Invoice, PaymentMethod } from '../../../DB/Models/invoice.model.js';
import { Types } from 'mongoose';

interface CreateBookingBody {
  guestId: Types.ObjectId;
  roomId: Types.ObjectId;
  checkInDate: string;
  checkOutDate: string;
  adults?: number;
  children?: number;
  specialRequests?: string;
  totalPrice: number;
  paymentMethod?: PaymentMethod;
  method?: PaymentMethod;
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

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const normalizeDateOnly = (value: string, endOfDay = false): Date => {
  const datePart = value.slice(0, 10);
  const [year, month, day] = datePart.split('-').map(Number);

  if (!year || !month || !day) {
    throw new Error('Invalid booking date');
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid booking date');
  }

  if (endOfDay) {
    date.setUTCHours(23, 59, 59, 999);
  }

  return date;
};

const getPaymentMethod = (body: CreateBookingBody): PaymentMethod => {
  return body.paymentMethod || body.method || 'Cash';
};

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
    } = req.body;

    const normalizedCheckIn = normalizeDateOnly(checkInDate);
    const normalizedCheckOut = normalizeDateOnly(checkOutDate, true);

    if (normalizedCheckOut.getTime() - normalizedCheckIn.getTime() < DAY_IN_MS) {
      res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date',
      });
      return;
    }

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
      checkInDate: normalizedCheckIn,
      checkOutDate: normalizedCheckOut,
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
      method: getPaymentMethod(req.body),
    });

    res.status(201).json({
      success: true,
      message: 'Booking and invoice created successfully',
      data: {
        booking,
        invoice,
        bookingId: booking._id as Types.ObjectId,
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

    const bookingWithNumber = await ensureBookingNumber(booking);
    const invoice = bookingWithNumber ? await Invoice.findOne({ bookingId: bookingWithNumber._id }) : null;

    res.status(200).json({
      success: true,
      data: {
        booking: bookingWithNumber as IBooking,
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
  res: Response<ApiResponse<{ bookings: IBooking[] }>>
): Promise<void> => {
  try {
    const { guestId } = req.params;

    const bookings: IBooking[] = await Booking.find({ guestId })
      .populate('roomId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: { bookings },
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
  res: Response<ApiResponse<BookingDetailsData>>
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
    booking.paymentStatus = 'Refunded';
    await booking.save();

    await Room.findByIdAndUpdate(booking.roomId, { status: 'Available' });

    const invoice = await Invoice.findOneAndUpdate(
      { bookingId: booking._id },
      { status: 'Cancelled' },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Booking and invoice cancelled successfully',
      data: { booking, invoice },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};
