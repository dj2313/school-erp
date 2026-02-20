const express = require('express');
const { getClasses, createClass } = require('../controllers/class.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/', getClasses);
router.post('/', authorize('ADMIN', 'SUPERADMIN'), createClass);

module.exports = router;
