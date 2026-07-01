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
    const guest = res.locals.user;
    const {
      roomId,
      checkInDate,
      checkOutDate,
      specialRequests,
      paymentMethod = 'Cash'
    } = req.body as CreateBookingBody & { paymentMethod?: string };

    if (!guest?._id) {
      res.status(401).json({ success: false, message: 'Please login again' });
      return;
    }

    if (!roomId || !checkInDate || !checkOutDate) {
      res.status(400).json({ success: false, message: 'Room, check-in, and check-out dates are required' });
      return;
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime()) || nights <= 0) {
      res.status(400).json({ success: false, message: 'Check-out date must be after check-in date' });
      return;
    }

    const room = await Room.findById(roomId).populate('categoryId');
    if (!room || room.status !== 'Available') {
      res.status(400).json({
        success: false,
        message: 'Room is not available',
      });
      return;
    }

    const basePrice = Number((room as any).categoryId?.basePrice || 0);
    const totalPrice = basePrice > 0 ? basePrice * nights : Number(req.body.totalPrice || 0);

    const booking: IBooking = await Booking.create({
      guestId: guest._id,
      roomId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      totalPrice,
      status: 'Pending',
      source: 'GuestPortal',
      lifecycleStage: 'BookingCreated',
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
    const guest = res.locals.user;
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

    if (String((booking as any).guestId?._id || (booking as any).guestId) !== String(guest._id)) {
      res.status(403).json({ success: false, message: 'You do not have access to this booking' });
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
    const guestId = res.locals.user?._id || req.params.guestId;

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
    const guest = res.locals.user;
    const booking: IBooking | null = await Booking.findById(req.params.id);

    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
      return;
    }

    if (String(booking.guestId) !== String(guest._id)) {
      res.status(403).json({ success: false, message: 'You do not have access to this booking' });
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
    booking.lifecycleStage = 'Cancelled';
    booking.cancelledAt = new Date();
    booking.cancelReason = req.body?.cancelReason || 'Cancelled by guest';
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