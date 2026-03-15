import { Room } from '../../../../DB/Models/room.model.js';
import { RoomCategory } from '../../../../DB/Models/roomCategory.model.js';

// Get all available rooms with filters
export const getAvailableRooms = async (req, res) => {
  try {
    const { 
      checkIn, 
      checkOut, 
      guests, 
      minPrice, 
      maxPrice, 
      amenities,
      sortBy = 'price' 
    } = req.query;

    let query = { status: 'Available' };

    // Build query based on filters
    const rooms = await Room.find(query)
      .populate('categoryId', 'name description basePrice maxOccupancy amenities')
      .sort(sortBy === 'price' ? { 'categoryId.basePrice': 1 } : { createdAt: -1 });

    // Filter by price range if provided
    let filteredRooms = rooms;
    if (minPrice || maxPrice) {
      filteredRooms = rooms.filter(room => {
        const price = room.categoryId.basePrice;
        if (minPrice && price < Number(minPrice)) return false;
        if (maxPrice && price > Number(maxPrice)) return false;
        return true;
      });
    }

    res.status(200).json({
      success: true,
      count: filteredRooms.length,
      data: filteredRooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get room details by ID
export const getRoomDetails = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('categoryId', 'name description basePrice maxOccupancy amenities');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.status(200).json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Search rooms by date and guests
export const searchRooms = async (req, res) => {
  try {
    const { checkInDate, checkOutDate, adults, children } = req.body;

    const totalGuests = Number(adults) + Number(children || 0);

    // Get available room categories that can accommodate guests
    const categories = await RoomCategory.find({
      maxOccupancy: { $gte: totalGuests }
    });

    const categoryIds = categories.map(cat => cat._id);

    // Find available rooms in these categories
    const rooms = await Room.find({
      categoryId: { $in: categoryIds },
      status: 'Available'
    }).populate('categoryId');

    res.status(200).json({
      success: true,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: { adults, children },
      count: rooms.length,
      data: rooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
