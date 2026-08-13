const express = require('express');
const { getDashboardMetrics, getAssets } = require('../controllers/assetController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { enforceBaseScope } = require('../middlewares/rbacMiddleware');
const router = express.Router();

// Apply auth and scope middlewares
router.use(authenticateToken);
router.use(enforceBaseScope);

router.get('/metrics', getDashboardMetrics);
router.get('/', getAssets);

module.exports = router;
