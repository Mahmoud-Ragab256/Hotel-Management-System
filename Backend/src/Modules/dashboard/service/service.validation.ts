import Joi from 'joi';

export const createServiceValidation = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(1000).allow('').optional(),
  details: Joi.string().max(2000).allow('').optional(),
  price: Joi.number().min(0).required(),
  category: Joi.string().valid('RoomService', 'Spa', 'Laundry', 'Restaurant', 'Transport', 'Other').required(),
  maxCapacity: Joi.number().integer().min(1).default(1),
  images: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
  isAvailable: Joi.boolean().default(true),
});

export const updateServiceValidation = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  description: Joi.string().max(1000).allow('').optional(),
  details: Joi.string().max(2000).allow('').optional(),
  price: Joi.number().min(0).optional(),
  category: Joi.string().valid('RoomService', 'Spa', 'Laundry', 'Restaurant', 'Transport', 'Other').optional(),
  maxCapacity: Joi.number().integer().min(1).optional(),
  images: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
  isAvailable: Joi.boolean().optional(),
});
