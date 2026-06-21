import Joi from 'joi';

export const createServiceValidation = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500).optional(),
  price: Joi.number().positive().required(),
  category: Joi.string().required(),
  isAvailable: Joi.boolean().default(true)
});

export const updateServiceValidation = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  description: Joi.string().max(500).optional(),
  price: Joi.number().positive().optional(),
  category: Joi.string().optional(),
  isAvailable: Joi.boolean().optional()
});
