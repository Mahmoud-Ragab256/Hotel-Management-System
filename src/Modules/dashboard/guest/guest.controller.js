import { Guest } from '../../../../DB/Models/guest.model.js';
import bcrypt from 'bcrypt';

// Get all guests
export const getAllGuests = async (req, res) => {
  try {
    const guests = await Guest.find().select('-password');
    res.status(200).json({
      success: true,
      count: guests.length,
      data: guests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get guest by ID
export const getGuestById = async (req, res) => {
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

// Create new guest (Register)
export const createGuest = async (req, res) => {
  try {
    const { fullName, email, password, phone, nationalId, vipLevel, preferences } = req.body;

    // Check if guest already exists
    const existingGuest = await Guest.findOne({ email });
    if (existingGuest) {
      return res.status(400).json({
        success: false,
        message: 'Guest with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create guest
    const guest = await Guest.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
      nationalId,
      vipLevel,
      preferences
    });

    res.status(201).json({
      success: true,
      message: 'Guest registered successfully',
      data: {
        guest: {
          id: guest._id,
          fullName: guest.fullName,
          email: guest.email,
          phone: guest.phone,
          vipLevel: guest.vipLevel
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update guest
export const updateGuest = async (req, res) => {
  try {
    const updates = { ...req.body };
    
    // Don't allow password update through this endpoint
    delete updates.password;

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
      message: 'Guest updated successfully',
      data: guest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete guest
export const deleteGuest = async (req, res) => {
  try {
    const guest = await Guest.findByIdAndDelete(req.params.id);

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Guest deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Guest login
export const loginGuest = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if guest exists
    const guest = await Guest.findOne({ email });
    if (!guest) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, guest.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        guest: {
          id: guest._id,
          fullName: guest.fullName,
          email: guest.email,
          phone: guest.phone,
          vipLevel: guest.vipLevel
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};