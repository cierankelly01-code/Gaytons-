'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { requireCustomer } = require('../middleware/rbac');
const { apiLimiter } = require('../middleware/rateLimit');
const { handleValidation } = require('../middleware/validate');
const ctrl = require('../controllers/orderController');

router.use(authenticate, requireCustomer, apiLimiter);

router.post('/', [
  body('items').isArray({ min: 1 }).withMessage('Order must contain items'),
  body('items.*.productId').isUUID().withMessage('Valid product ID required'),
  body('items.*.quantity').isInt({ min: 1, max: 9999 }).withMessage('Quantity must be between 1 and 9999'),
  body('notes').optional().isString().trim().isLength({ max: 1000 }),
  handleValidation,
], ctrl.submitOrder);

router.get('/', ctrl.getOrders);
router.get('/history', ctrl.getOrders);
router.get('/:id', ctrl.getOrderById);

module.exports = router;
