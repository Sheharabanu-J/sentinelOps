const express = require('express');
const { createPurchase, getPurchases } = require('../controllers/purchaseController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { enforceBaseScope } = require('../middlewares/rbacMiddleware');
const router = express.Router();

router.use(authenticateToken);

router.get('/', enforceBaseScope, getPurchases);
router.post('/', enforceBaseScope, createPurchase);

module.exports = router;
