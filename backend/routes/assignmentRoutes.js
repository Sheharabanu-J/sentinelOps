const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/rbacMiddleware');

router.post('/', authenticateToken, authorizeRoles('admin', 'base_commander'), assignmentController.createAssignment);
router.get('/', authenticateToken, assignmentController.getAssignments);

module.exports = router;
