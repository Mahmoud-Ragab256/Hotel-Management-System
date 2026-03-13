import { ServiceOrder } from '../../../DB/Models/serviceOrder.model.js';

// Get all service orders
export const getAllServiceOrders = async (req, res) => {
  try {
    const orders = await ServiceOrder.find()
      .populate('bookingId')
      .populate('serviceId', 'name price category')
      .populate('assignedEmployeeId', 'fullName role');
    
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get service order by ID
export const getServiceOrderById = async (req, res) => {
  try {
    const order = await ServiceOrder.findById(req.params.id)
      .populate('bookingId')
      .populate('serviceId')
      .populate('assignedEmployeeId');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Service order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create new service order
export const createServiceOrder = async (req, res) => {
  try {
    const order = await ServiceOrder.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Service order created successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update service order
export const updateServiceOrder = async (req, res) => {
  try {
    const order = await ServiceOrder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Service order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Service order updated successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete service order
export const deleteServiceOrder = async (req, res) => {
  try {
    const order = await ServiceOrder.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Service order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Service order deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
