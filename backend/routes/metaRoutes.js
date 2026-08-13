const express = require('express');
const router = express.Router();
const metaController = require('../controllers/metaController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/bases', authenticateToken, metaController.getBases);
router.get('/equipment-types', authenticateToken, metaController.getEquipmentTypes);

module.exports = router;
