import { Guest } from '../../../../DB/Models/guest.model.js';
import { Booking } from '../../../../DB/Models/booking.model.js';
import { Review } from '../../../../DB/Models/review.model.js';

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id).select('-password');

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }

    res.status(200).json({
      success: true,
      data: guest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.password; // Don't allow password update here
    delete updates.email; // Don't allow email update

    const guest = await Guest.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: guest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user booking history
export const getBookingHistory = async (req, res) => {
  try {
    const bookings = await Booking.find({ guestId: req.params.id })
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

// Get user reviews
export const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ guestId: req.params.id })
      .populate('bookingId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
