'use strict';

const router = require('express').Router();
const { authenticate } = require('../../middleware/auth');
const { requireAdmin } = require('../../middleware/rbac');
const ctrl = require('../../controllers/admin/analyticsController');

router.use(authenticate, requireAdmin);
router.get('/overview', ctrl.getOverview);
router.get('/spend-leaderboard', ctrl.getSpendLeaderboard);
router.get('/top-products', ctrl.getTopProducts);
router.get('/weekly-revenue', ctrl.getWeeklyRevenue);

module.exports = router;
