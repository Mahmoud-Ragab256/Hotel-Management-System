import Joi from 'joi';

export const registerEmployeeValidation = Joi.object({
  fullName: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().pattern(/^[0-9]{11}$/).required(),
  position: Joi.string().required(),
  department: Joi.string().required(),
  salary: Joi.number().positive().required(),
  hireDate: Joi.date().optional()
});

export const loginEmployeeValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const updateEmployeeValidation = Joi.object({
  fullName: Joi.string().min(3).max(100).optional(),
  phone: Joi.string().pattern(/^[0-9]{11}$/).optional(),
  position: Joi.string().optional(),
  department: Joi.string().optional(),
  salary: Joi.number().positive().optional()
});
