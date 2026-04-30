import Joi from 'joi';

export const createBookingValidation = Joi.object({
  guestId: Joi.string().hex().length(24).required(),
  roomId: Joi.string().hex().length(24).required(),
  checkInDate: Joi.date().required(),
  checkOutDate: Joi.date().greater(Joi.ref('checkInDate')).required(),
  totalPrice: Joi.number().positive().required(),
  status: Joi.string().valid('Pending', 'Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled').default('Pending'),
  specialRequests: Joi.string().max(500).optional()
});

export const updateBookingValidation = Joi.object({
  checkInDate: Joi.date().optional(),
  checkOutDate: Joi.date().optional(),
  totalPrice: Joi.number().positive().optional(),
  status: Joi.string().valid('Pending', 'Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled').optional(),
  specialRequests: Joi.string().max(500).optional()
});
