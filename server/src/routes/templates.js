'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { requireCustomer } = require('../middleware/rbac');
const { handleValidation } = require('../middleware/validate');
const ctrl = require('../controllers/templateController');

router.use(authenticate, requireCustomer);

router.get('/', ctrl.getTemplates);

router.post('/', [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Template name required (max 100 chars)'),
  body('items').isArray({ min: 1 }).withMessage('Template must have items'),
  body('items.*.productId').isUUID().withMessage('Valid product ID required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  handleValidation,
], ctrl.createTemplate);

router.delete('/:id', ctrl.deleteTemplate);

module.exports = router;
