'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const { authLimiter } = require('../middleware/rateLimit');
const { authenticate } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const ctrl = require('../controllers/authController');

const passwordRules = body('newPassword')
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
  .matches(/[0-9]/).withMessage('Password must contain a number')
  .matches(/[^A-Za-z0-9]/).withMessage('Password must contain a special character');

router.post('/login', authLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
  handleValidation,
], ctrl.login);

router.post('/logout', authenticate, ctrl.logout);

router.post('/refresh', ctrl.refresh);

router.post('/change-password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  passwordRules,
  handleValidation,
], ctrl.changePassword);

router.get('/me', authenticate, ctrl.me);

module.exports = router;
