const Joi = require('joi');

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const phonePattern = /^\+?[\d\s\-()]{7,20}$/;

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(passwordPattern).required().messages({
    'string.pattern.base': 'Password must be at least 8 characters with uppercase, lowercase, and a number',
  }),
  phone: Joi.string().pattern(phonePattern).allow('').optional().messages({
    'string.pattern.base': 'Phone must be a valid format (7–20 digits, may include +, spaces, dashes)',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const taskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required(),
  description: Joi.string().trim().max(2000).allow('').optional(),
  status: Joi.string().valid('pending', 'in_progress', 'completed').optional(),
  priority: Joi.string().valid('low', 'medium', 'high').optional(),
  dueDate: Joi.date().iso().allow(null).optional(),
  category: Joi.string().hex().length(24).allow(null).optional(),
});

const categorySchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
  description: Joi.string().trim().max(500).allow('').optional(),
});

module.exports = { registerSchema, loginSchema, taskSchema, categorySchema };
