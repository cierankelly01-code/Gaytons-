'use strict';

const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimit');
const ctrl = require('../controllers/productController');

router.use(authenticate, apiLimiter);
router.get('/', ctrl.getProducts);
router.get('/categories', ctrl.getCategories);

module.exports = router;
