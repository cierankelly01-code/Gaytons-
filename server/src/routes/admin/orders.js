'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate } = require('../../middleware/auth');
const { requireAdmin } = require('../../middleware/rbac');
const { handleValidation } = require('../../middleware/validate');
const ctrl = require('../../controllers/admin/orderController');

router.use(authenticate, requireAdmin);

router.get('/', ctrl.getAllOrders);
router.get('/stats', ctrl.getTodayStats);
router.get('/feed', ctrl.getLiveFeed);
router.get('/picking-sheet', ctrl.getPickingSheet);
router.get('/:id', ctrl.getOrderById);

router.patch('/:id/status', [
  body('status').isIn(['PENDING', 'CONFIRMED', 'PICKED', 'CANCELLED']).withMessage('Invalid status'),
  body('adminNotes').optional().isString().trim().isLength({ max: 2000 }),
  handleValidation,
], ctrl.updateOrderStatus);

module.exports = router;
