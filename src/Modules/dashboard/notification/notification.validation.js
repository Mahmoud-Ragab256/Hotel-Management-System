import Joi from 'joi';

export const createNotificationValidation = Joi.object({
  recipientId: Joi.string().hex().length(24).required(),
  recipientType: Joi.string().valid('Guest', 'Employee').required(),
  title: Joi.string().min(3).max(100).required(),
  message: Joi.string().min(10).max(500).required(),
  type: Joi.string().valid('Booking', 'Payment', 'Service', 'General').required(),
  isRead: Joi.boolean().default(false)
});

export const updateNotificationValidation = Joi.object({
  isRead: Joi.boolean().optional()
});
