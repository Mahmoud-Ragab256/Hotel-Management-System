import Joi from 'joi';

export const createRoomValidation = Joi.object({
  roomNumber: Joi.string().required(),
  categoryId: Joi.string().hex().length(24).required(),
  floor: Joi.number().integer().positive().required(),
  status: Joi.string().valid('Available', 'Occupied', 'Maintenance', 'Reserved').default('Available'),
  features: Joi.array().items(Joi.string()).optional()
});

export const updateRoomValidation = Joi.object({
  roomNumber: Joi.string().optional(),
  categoryId: Joi.string().hex().length(24).optional(),
  floor: Joi.number().integer().positive().optional(),
  status: Joi.string().valid('Available', 'Occupied', 'Maintenance', 'Reserved').optional(),
  features: Joi.array().items(Joi.string()).optional()
});
