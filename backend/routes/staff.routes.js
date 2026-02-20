const express = require('express');
const { getStaff, createStaff, updateStaff, deleteStaff } = require('../controllers/staff.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/', authorize('ADMIN', 'HR', 'SUPERADMIN'), getStaff);
router.post('/', authorize('ADMIN', 'HR'), createStaff);
router.put('/:id', authorize('ADMIN', 'HR'), updateStaff);
router.delete('/:id', authorize('ADMIN', 'HR'), deleteStaff);

module.exports = router;
