'use strict';

const router = require('express').Router();
const { authenticate } = require('../../middleware/auth');
const { requireAdmin } = require('../../middleware/rbac');
const ctrl = require('../../controllers/admin/auditController');

router.use(authenticate, requireAdmin);
router.get('/', ctrl.getAuditLog);

module.exports = router;
