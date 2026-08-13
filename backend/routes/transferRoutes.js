const express = require('express');
const { createTransfer, getTransfers } = require('../controllers/transferController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { enforceBaseScope } = require('../middlewares/rbacMiddleware');
const router = express.Router();

router.use(authenticateToken);

router.get('/', enforceBaseScope, getTransfers);
router.post('/', enforceBaseScope, createTransfer);

module.exports = router;
