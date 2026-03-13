import Joi from 'joi';

export const createReviewValidation = Joi.object({
  guestId: Joi.string().hex().length(24).required(),
  bookingId: Joi.string().hex().length(24).required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().min(10).max(1000).required(),
  isApproved: Joi.boolean().default(false)
});

export const updateReviewValidation = Joi.object({
  rating: Joi.number().integer().min(1).max(5).optional(),
  comment: Joi.string().min(10).max(1000).optional(),
  isApproved: Joi.boolean().optional()
});
