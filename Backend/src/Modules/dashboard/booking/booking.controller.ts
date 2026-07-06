import { Request, Response } from 'express';
import { Booking, IBooking, backfillMissingBookingNumbers, ensureBookingNumber } from '../../../DB/Models/booking.model.js';
import { Room, IRoom } from '../../../DB/Models/room.model.js';
import { Invoice, IInvoice, PaymentMethod } from '../../../DB/Models/invoice.model.js';

interface CreateBookingBody {
  guestId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  specialRequests?: string;
  paymentMethod?: PaymentMethod;
  method?: PaymentMethod;
  employeeId?: string;
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

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const normalizeDateOnly = (value: string, endOfDay = false): Date => {
  const datePart = typeof value === 'string' ? value.slice(0, 10) : value;
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

const normalizeBookingDates = <T extends { checkInDate?: string; checkOutDate?: string }>(payload: T) => {
  const normalized: Record<string, unknown> = { ...payload };

  if (payload.checkInDate) {
    normalized.checkInDate = normalizeDateOnly(payload.checkInDate);
  }

  if (payload.checkOutDate) {
    normalized.checkOutDate = normalizeDateOnly(payload.checkOutDate, true);
  }

  if (normalized.checkInDate && normalized.checkOutDate) {
    const checkIn = normalized.checkInDate as Date;
    const checkOut = normalized.checkOutDate as Date;

    if (checkOut.getTime() - checkIn.getTime() < DAY_IN_MS) {
      throw new Error('Check-out date must be after check-in date');
    }
  }

  return normalized;
};

const getPaymentMethod = (body: CreateBookingBody): PaymentMethod => {
  return body.paymentMethod || body.method || 'Cash';
};



export const getBookingByNumber = async (
  req: Request<{ bookingNumber: string }>,
  res: Response<ApiResponse<BookingData>>
): Promise<void> => {
  try {
    const bookingNumber = String(req.params.bookingNumber || '').trim();

    if (!/^\d{4}$/.test(bookingNumber)) {
      res.status(400).json({
        success: false,
        message: 'Booking number must be exactly 4 digits',
      });
      return;
    }

    let booking: IBooking | null = await Booking.findOne({ bookingNumber })
      .populate('guestId', 'fullName email phone')
      .populate('roomId', 'roomNumber status');

    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
      return;
    }

    booking = await ensureBookingNumber(booking);
    const invoice = booking ? await Invoice.findOne({ bookingId: booking._id }) : null;

    res.status(200).json({
      success: true,
      data: { booking: booking as IBooking, invoice },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const getAllBookings = async (
  req: Request,
  res: Response<ApiResponse<BookingsData>>
): Promise<void> => {
  try {
    await backfillMissingBookingNumbers();

    const bookings: IBooking[] = await Booking.find()
      .populate('guestId', 'fullName email phone')
      .populate('roomId', 'roomNumber status')
      .sort({ checkInDate: 1, createdAt: -1 });

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

    const bookingWithNumber = await ensureBookingNumber(booking);
    const invoice = bookingWithNumber ? await Invoice.findOne({ bookingId: bookingWithNumber._id }) : null;

    res.status(200).json({
      success: true,
      data: { booking: bookingWithNumber as IBooking, invoice },
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
    const { roomId, totalPrice, employeeId } = req.body;

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

    const normalizedPayload = normalizeBookingDates(req.body);
    const booking: IBooking = await Booking.create(normalizedPayload);

    await Room.findByIdAndUpdate(roomId, { status: 'Occupied' });

    const invoicePayload: Record<string, unknown> = {
      bookingId: booking._id,
      totalAmount: Number(totalPrice || booking.totalPrice || 0),
      paidAmount: 0,
      status: 'Pending',
      method: getPaymentMethod(req.body),
    };

    if (employeeId) invoicePayload.employeeId = employeeId;

    const invoice: IInvoice = await Invoice.create(invoicePayload);

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
    const currentBooking = await Booking.findById(req.params.id);
    if (!currentBooking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
      return;
    }

    const normalizedPayload = normalizeBookingDates(req.body);

    if (normalizedPayload.checkInDate && !normalizedPayload.checkOutDate) {
      const checkIn = normalizedPayload.checkInDate as Date;
      if (currentBooking.checkOutDate.getTime() - checkIn.getTime() < DAY_IN_MS) {
        res.status(400).json({ success: false, message: 'Check-out date must be after check-in date' });
        return;
      }
    }

    if (normalizedPayload.checkOutDate && !normalizedPayload.checkInDate) {
      const checkOut = normalizedPayload.checkOutDate as Date;
      if (checkOut.getTime() - currentBooking.checkInDate.getTime() < DAY_IN_MS) {
        res.status(400).json({ success: false, message: 'Check-out date must be after check-in date' });
        return;
      }
    }

    const booking: IBooking | null = await Booking.findByIdAndUpdate(
      req.params.id,
      normalizedPayload,
      { new: true, runValidators: true }
    );

    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
      return;
    }

    let invoice: IInvoice | null = await Invoice.findOne({ bookingId: booking._id });

    if (req.body.totalPrice !== undefined && invoice) {
      invoice.totalAmount = Number(req.body.totalPrice);
      await invoice.save();
    }

    if (req.body.status === 'Cancelled') {
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
        paymentStatus: 'Refunded',
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

    await Room.findByIdAndUpdate(booking.roomId, { status: 'Available' });
    await Invoice.findOneAndUpdate({ bookingId: booking._id }, { status: 'Cancelled' });

    res.status(200).json({
      success: true,
      message: 'Booking deleted and related invoice cancelled successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};
