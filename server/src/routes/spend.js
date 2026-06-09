'use strict';

const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { requireCustomer } = require('../middleware/rbac');
const ctrl = require('../controllers/spendController');

router.use(authenticate, requireCustomer);
router.get('/summary', ctrl.getSpendSummary);
router.get('/top-products', ctrl.getTopProducts);
router.get('/favourites', ctrl.getFavourites);

module.exports = router;
