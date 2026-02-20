const express = require('express');
const { getLeaves, applyLeave, updateLeaveStatus } = require('../controllers/leave.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/', authorize('ADMIN', 'HR', 'SUPERADMIN'), getLeaves);
router.post('/apply', applyLeave);
router.put('/:id/status', authorize('ADMIN', 'HR'), updateLeaveStatus);

module.exports = router;
