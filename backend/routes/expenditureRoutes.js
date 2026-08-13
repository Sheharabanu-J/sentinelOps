const express = require('express');
const router = express.Router();
const expenditureController = require('../controllers/expenditureController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/rbacMiddleware');

router.post('/', authenticateToken, authorizeRoles('admin', 'base_commander'), expenditureController.createExpenditure);
router.get('/', authenticateToken, expenditureController.getExpenditures);

module.exports = router;
