import Joi from 'joi';

export const createServiceOrderValidation = Joi.object({
  bookingId: Joi.string().hex().length(24).required(),
  serviceId: Joi.string().hex().length(24).required(),
  quantity: Joi.number().integer().positive().default(1),
  totalPrice: Joi.number().positive().required(),
  status: Joi.string().valid('Pending', 'InProgress', 'Completed', 'Cancelled').default('Pending'),
  notes: Joi.string().max(500).optional()
});

export const updateServiceOrderValidation = Joi.object({
  quantity: Joi.number().integer().positive().optional(),
  totalPrice: Joi.number().positive().optional(),
  status: Joi.string().valid('Pending', 'InProgress', 'Completed', 'Cancelled').optional(),
  notes: Joi.string().max(500).optional()
});
