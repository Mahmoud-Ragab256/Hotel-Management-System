import Joi from 'joi';

export const createRoomCategoryValidation = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  description: Joi.string().max(500).optional(),
  basePrice: Joi.number().positive().required(),
  maxOccupancy: Joi.number().integer().positive().required(),
  amenities: Joi.array().items(Joi.string()).optional()
});

export const updateRoomCategoryValidation = Joi.object({
  name: Joi.string().min(3).max(50).optional(),
  description: Joi.string().max(500).optional(),
  basePrice: Joi.number().positive().optional(),
  maxOccupancy: Joi.number().integer().positive().optional(),
  amenities: Joi.array().items(Joi.string()).optional()
});
