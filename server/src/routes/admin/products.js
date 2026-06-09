'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate } = require('../../middleware/auth');
const { requireAdmin } = require('../../middleware/rbac');
const { handleValidation } = require('../../middleware/validate');
const ctrl = require('../../controllers/admin/productController');

router.use(authenticate, requireAdmin);

router.get('/', ctrl.getAllProducts);
router.patch('/:id/availability', [
  body('isAvailable').isBoolean().withMessage('isAvailable must be boolean'),
  handleValidation,
], ctrl.updateAvailability);
router.patch('/:id/price', [
  body('price').isFloat({ min: 0.01 }).withMessage('Valid price required'),
  handleValidation,
], ctrl.updatePrice);
router.post('/bulk-price-update', [
  body('updates').isArray({ min: 1 }).withMessage('Updates array required'),
  handleValidation,
], ctrl.bulkPriceUpdate);

module.exports = router;
