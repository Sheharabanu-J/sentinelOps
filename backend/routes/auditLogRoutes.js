const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/rbacMiddleware');

router.get('/', authenticateToken, authorizeRoles('admin'), auditLogController.getAuditLogs);

module.exports = router;
