const express = require('express');
const {
    getExams,
    createExam,
    bulkEntryMarks,
    getExamResults
} = require('../controllers/exam.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/', getExams);
router.post('/', authorize('ADMIN', 'SUPERADMIN'), createExam);
router.post('/bulk-marks', authorize('ADMIN', 'TEACHER', 'SUPERADMIN'), bulkEntryMarks);
router.get('/results', getExamResults);

module.exports = router;
