import { Guest } from '../../../../DB/Models/guest.model.js';
import bcrypt from 'bcrypt';

// Register new guest
export const register = async (req, res) => {
  try {
    const { fullName, email, password, phone, nationalId, preferences } = req.body;

    // Check if guest exists
    const existingGuest = await Guest.findOne({ email });
    if (existingGuest) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
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
      preferences
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        id: guest._id,
        fullName: guest.fullName,
        email: guest.email,
        phone: guest.phone
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Login guest
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find guest
    const guest = await Guest.findOne({ email });
    if (!guest) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, guest.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: guest._id,
        fullName: guest.fullName,
        email: guest.email,
        phone: guest.phone,
        vipLevel: guest.vipLevel
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Reset password request
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const guest = await Guest.findOne({ email });
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }

    // Here you would normally send reset email
    // For now, just return success message
    res.status(200).json({
      success: true,
      message: 'Password reset instructions sent to your email'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const guest = await Guest.findOne({ email });
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    guest.password = hashedPassword;
    await guest.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
