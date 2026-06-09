'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate } = require('../../middleware/auth');
const { requireAdmin } = require('../../middleware/rbac');
const { handleValidation } = require('../../middleware/validate');
const ctrl = require('../../controllers/admin/customerController');

router.use(authenticate, requireAdmin);

router.get('/', ctrl.getCustomers);

router.post('/', [
  body('businessName').trim().notEmpty().withMessage('Business name required'),
  body('contactName').trim().notEmpty().withMessage('Contact name required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('phone').trim().notEmpty().withMessage('Phone number required'),
  handleValidation,
], ctrl.createCustomer);

router.get('/:id', ctrl.getCustomer);
router.put('/:id', [
  body('businessName').trim().notEmpty(),
  body('contactName').trim().notEmpty(),
  body('phone').trim().notEmpty(),
  handleValidation,
], ctrl.updateCustomer);
router.patch('/:id/unlock', ctrl.unlockCustomer);
router.patch('/:id/deactivate', ctrl.deactivateCustomer);
router.post('/:id/reset-password', ctrl.resetPassword);

module.exports = router;
