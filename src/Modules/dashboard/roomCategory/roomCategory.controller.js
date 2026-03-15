import { RoomCategory } from '../../../../DB/Models/roomCategory.model.js';

// Get all room categories
export const getAllRoomCategories = async (req, res) => {
  try {
    const categories = await RoomCategory.find();
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get room category by ID
export const getRoomCategoryById = async (req, res) => {
  try {
    const category = await RoomCategory.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Room category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create new room category
export const createRoomCategory = async (req, res) => {
  try {
    const category = await RoomCategory.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Room category created successfully',
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update room category
export const updateRoomCategory = async (req, res) => {
  try {
    const category = await RoomCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Room category not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Room category updated successfully',
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete room category
export const deleteRoomCategory = async (req, res) => {
  try {
    const category = await RoomCategory.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Room category not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Room category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};