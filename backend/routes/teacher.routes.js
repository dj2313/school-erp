const express = require('express');
const { getTeacherDashboardData } = require('../controllers/teacher.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);
router.use(authorize('TEACHER', 'ADMIN', 'SUPERADMIN'));

router.get('/dashboard', getTeacherDashboardData);

module.exports = router;
