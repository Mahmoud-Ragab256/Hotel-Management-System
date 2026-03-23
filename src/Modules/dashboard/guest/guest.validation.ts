import Joi from 'joi';

export const registerGuestValidation = Joi.object({
  fullName: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().pattern(/^[0-9]{11}$/).required(),
  nationalId: Joi.string().pattern(/^[0-9]{14}$/).required(),
  vipLevel: Joi.string().valid('Standard', 'Silver', 'Gold', 'Platinum').default('Standard'),
  preferences: Joi.object().optional()
});

export const loginGuestValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const updateGuestValidation = Joi.object({
  fullName: Joi.string().min(3).max(100).optional(),
  phone: Joi.string().pattern(/^[0-9]{11}$/).optional(),
  vipLevel: Joi.string().valid('Standard', 'Silver', 'Gold', 'Platinum').optional(),
  preferences: Joi.object().optional()
});
