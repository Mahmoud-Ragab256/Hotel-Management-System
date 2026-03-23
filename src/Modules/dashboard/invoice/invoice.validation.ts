import Joi from 'joi';

export const createInvoiceValidation = Joi.object({
  bookingId: Joi.string().hex().length(24).required(),
  totalAmount: Joi.number().positive().required(),
  paidAmount: Joi.number().min(0).default(0),
  status: Joi.string().valid('Unpaid', 'PartiallyPaid', 'Paid').default('Unpaid'),
  paymentMethod: Joi.string().valid('Cash', 'Card', 'Transfer', 'Other').optional(),
  notes: Joi.string().max(500).optional()
});

export const updateInvoiceValidation = Joi.object({
  totalAmount: Joi.number().positive().optional(),
  paidAmount: Joi.number().min(0).optional(),
  status: Joi.string().valid('Unpaid', 'PartiallyPaid', 'Paid').optional(),
  paymentMethod: Joi.string().valid('Cash', 'Card', 'Transfer', 'Other').optional(),
  notes: Joi.string().max(500).optional()
});
