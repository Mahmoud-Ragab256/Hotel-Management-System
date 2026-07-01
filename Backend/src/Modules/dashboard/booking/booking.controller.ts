import { Request, Response } from 'express';
import { Booking } from '../../../DB/Models/booking.model.js';
import { Room } from '../../../DB/Models/room.model.js';
import { IBooking } from '../../../DB/Models/booking.model.js';
import { IRoom } from '../../../DB/Models/room.model.js';
import { Invoice, IInvoice, PaymentMethod } from '../../../DB/Models/invoice.model.js';


interface CreateBookingBody {
  guestId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  specialRequests?: string;
  paymentMethod?: PaymentMethod;
  paidAmount?: number;
}

interface UpdateBookingBody {
  checkInDate?: string;
  checkOutDate?: string;
  totalPrice?: number;
  status?: string;
  specialRequests?: string;
}

interface CancelBookingBody {
  cancelReason: string;
}


interface BookingsData {
  bookings: IBooking[];
}

interface BookingData {
  booking: IBooking;
  invoice?: IInvoice | null;
}


interface ApiResponse<T = null> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}


// Get all bookings
export const getAllBookings = async (
  req: Request,
  res: Response<ApiResponse<BookingsData>>
): Promise<void> => {
  try {
    const bookings: IBooking[] = await Booking.find()
      .populate('guestId', 'fullName email phone')
      .populate('roomId', 'roomNumber status')
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


export const getBookingById = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<BookingData>>
): Promise<void> => {
  try {
    const booking: IBooking | null = await Booking.findById(req.params.id)
      .populate('guestId')
      .populate('roomId');

    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { booking },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const createBooking = async (
  req: Request<{}, ApiResponse<BookingData>, CreateBookingBody>,
  res: Response<ApiResponse<BookingData>>
): Promise<void> => {
  try {
    const { roomId } = req.body;

    const room: IRoom | null = await Room.findById(roomId);
    if (!room) {
      res.status(404).json({
        success: false,
        message: 'Room not found',
      });
      return;
    }

    if (room.status !== 'Available') {
      res.status(400).json({
        success: false,
        message: 'Room is not available',
      });
      return;
    }

    const checkIn = new Date(req.body.checkInDate);
    const checkOut = new Date(req.body.checkOutDate);

    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime()) || checkOut <= checkIn) {
      res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date',
      });
      return;
    }

    const { paymentMethod = 'Cash', paidAmount = 0, ...bookingPayload } = req.body;

    const booking: IBooking = await Booking.create({
      ...bookingPayload,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      source: 'Dashboard',
      lifecycleStage: 'BookingCreated',
    });

    await Room.findByIdAndUpdate(roomId, { status: 'Occupied' });

    const invoice: IInvoice = await Invoice.create({
      bookingId: booking._id,
      employeeId: res.locals.user?._id,
      totalAmount: booking.totalPrice,
      paidAmount,
      status: paidAmount >= booking.totalPrice && booking.totalPrice > 0 ? 'Paid' : 'Pending',
      method: paymentMethod,
    });

    res.status(201).json({
      success: true,
      message: 'Booking and invoice created successfully',
      data: { booking, invoice },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const updateBooking = async (
  req: Request<{ id: string }, ApiResponse<BookingData>, UpdateBookingBody>,
  res: Response<ApiResponse<BookingData>>
): Promise<void> => {
  try {
    const bookingBeforeUpdate: IBooking | null = await Booking.findById(req.params.id);

    if (!bookingBeforeUpdate) {
      res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
      return;
    }

    const booking: IBooking | null = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
      return;
    }

    let invoice: IInvoice | null = null;

    if (req.body.totalPrice !== undefined) {
      invoice = await Invoice.findOneAndUpdate(
        { bookingId: booking._id },
        { totalAmount: req.body.totalPrice },
        { new: true }
      );
    }

    if (req.body.status && req.body.status !== bookingBeforeUpdate.status) {
      booking.lifecycleStage = req.body.status;
      await booking.save();
    }

    if (req.body.status === 'Cancelled' && bookingBeforeUpdate.status !== 'Cancelled') {
      booking.cancelledAt = booking.cancelledAt || new Date();
      booking.lifecycleStage = 'Cancelled';
      await booking.save();
      await Room.findByIdAndUpdate(booking.roomId, { status: 'Available' });
      invoice = await Invoice.findOneAndUpdate(
        { bookingId: booking._id },
        { status: 'Cancelled' },
        { new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      data: { booking, invoice },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const cancelBooking = async (
  req: Request<{ id: string }, ApiResponse<BookingData>, CancelBookingBody>,
  res: Response<ApiResponse<BookingData>>
): Promise<void> => {
  try {
    const { cancelReason } = req.body;

    const booking: IBooking | null = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Cancelled',
        cancelledAt: new Date(),
        cancelReason,
        lifecycleStage: 'Cancelled',
      },
      { new: true }
    );

    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
      return;
    }

    await Room.findByIdAndUpdate(booking.roomId, { status: 'Available' });

    const invoice: IInvoice | null = await Invoice.findOneAndUpdate(
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


export const deleteBooking = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const booking: IBooking | null = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};