import { Room } from '../../../DB/Models/room.model.js';
import { RoomCategory } from '../../../DB/Models/roomCategory.model.js';
import { Service } from '../../../DB/Models/service.model.js';
import { Review } from '../../../DB/Models/review.model.js';

// Get landing page data
export const getLandingPageData = async (req, res) => {
  try {
    // Get available rooms count
    const availableRoomsCount = await Room.countDocuments({ status: 'Available' });
    
    // Get all room categories with their info
    const roomCategories = await RoomCategory.find()
      .select('name description basePrice amenities')
      .limit(6);
    
    // Get available services
    const services = await Service.find({ isAvailable: true })
      .select('name description price category')
      .limit(8);
    
    // Get approved reviews (latest 5)
    const reviews = await Review.find({ isApproved: true })
      .populate('guestId', 'fullName')
      .select('rating comment createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        availableRooms: availableRoomsCount,
        roomCategories,
        services,
        reviews
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get statistics for dashboard
export const getStatistics = async (req, res) => {
  try {
    const stats = {
      totalRooms: await Room.countDocuments(),
      availableRooms: await Room.countDocuments({ status: 'Available' }),
      occupiedRooms: await Room.countDocuments({ status: 'Occupied' }),
      totalServices: await Service.countDocuments(),
      totalReviews: await Review.countDocuments({ isApproved: true })
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get featured room categories
export const getFeaturedCategories = async (req, res) => {
  try {
    const categories = await RoomCategory.find()
      .select('name description basePrice maxOccupancy amenities')
      .limit(3);

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
