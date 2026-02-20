const express = require('express');
const { getDashboardStats } = require('../controllers/superadmin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes protected and restricted to SUPERADMIN
router.use(protect, authorize('SUPERADMIN'));

router.get('/dashboard/stats', getDashboardStats);

module.exports = router;
