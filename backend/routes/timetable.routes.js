const express = require('express');
const {
    getTimetableByClass,
    upsertTimetableEntry,
    deleteTimetableEntry
} = require('../controllers/timetable.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/class/:class_id', getTimetableByClass);
router.post('/', authorize('ADMIN', 'SUPERADMIN'), upsertTimetableEntry);
router.delete('/:id', authorize('ADMIN', 'SUPERADMIN'), deleteTimetableEntry);

module.exports = router;
