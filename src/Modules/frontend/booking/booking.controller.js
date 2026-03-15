import { Booking } from '../../../../DB/Models/booking.model.js';
import { Room } from '../../../../DB/Models/room.model.js';
import { Invoice } from '../../../../DB/Models/invoice.model.js';

// Create new booking (from frontend)
export const createBooking = async (req, res) => {
  try {
    const { 
      guestId, 
      roomId, 
      checkInDate, 
      checkOutDate, 
      adults,
      children,
      specialRequests,
      totalPrice 
    } = req.body;

    // Check if room is available
    const room = await Room.findById(roomId);
    if (!room || room.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: 'Room is not available'
      });
    }

    // Create booking
    const booking = await Booking.create({
      guestId,
      roomId,
      checkInDate,
      checkOutDate,
      totalPrice,
      status: 'Pending',
      specialRequests
    });

    // Update room status
    room.status = 'Reserved';
    await room.save();

    // Create invoice
    const invoice = await Invoice.create({
      bookingId: booking._id,
      totalAmount: totalPrice,
      paidAmount: 0,
      status: 'Unpaid'
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        booking,
        invoice,
        bookingId: booking._id
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get booking details
export const getBookingDetails = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('guestId', 'fullName email phone')
      .populate('roomId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const invoice = await Invoice.findOne({ bookingId: booking._id });

    res.status(200).json({
      success: true,
      data: {
        booking,
        invoice
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user bookings
export const getUserBookings = async (req, res) => {
  try {
    const { guestId } = req.params;

    const bookings = await Booking.find({ guestId })
      .populate('roomId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Cancel booking
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status === 'CheckedIn' || booking.status === 'CheckedOut') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this booking'
      });
    }

    booking.status = 'Cancelled';
    await booking.save();

    // Update room status back to available
    await Room.findByIdAndUpdate(booking.roomId, { status: 'Available' });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
